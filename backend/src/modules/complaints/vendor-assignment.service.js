import prisma from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js";
import { recordStatusChange, getSocietyAdminId } from "./complaint.service.js";
import { getComplaintStaffAssignments } from "./staff-assignment.service.js";

const ACTIVE_STATUSES = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];

const VALID_TRANSITIONS = {
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const VALID_COMPLAINT_TRANSITIONS = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["ACCEPTED", "IN_PROGRESS", "OPEN"],
  ACCEPTED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["RESOLVED", "REOPENED", "OPEN"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["ASSIGNED"],
};

const ASSIGNMENT_INCLUDE = {
  vendor: {
    select: {
      id: true,
      companyName: true,
      category: true,
      city: true,
      user: { select: { name: true, phone: true, email: true } },
    },
  },
  society: {
    select: { id: true, name: true, societyCode: true },
  },
  complaint: {
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      priority: true,
      status: true,
      imageUrl: true,
      afterImageUrl: true,
      resident: {
        select: {
          id: true,
          user: { select: { name: true, phone: true, email: true } },
          flat: { select: { flatNumber: true, wing: true } },
        },
      },
    },
  },
  assignedBy: {
    select: { id: true, name: true },
  },
};

const mapAssignment = (assignment) => ({
  id: assignment.id,
  type: "VENDOR",
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  acceptedAt: assignment.acceptedAt,
  startedAt: assignment.startedAt,
  completedAt: assignment.completedAt,
  cancelledAt: assignment.cancelledAt,
  vendor: {
    id: assignment.vendor.id,
    companyName: assignment.vendor.companyName,
    category: assignment.vendor.category,
    city: assignment.vendor.city,
    contactPerson: assignment.vendor.user.name,
    phone: assignment.vendor.user.phone,
    email: assignment.vendor.user.email,
  },
  society: assignment.society
    ? {
        id: assignment.society.id,
        name: assignment.society.name,
        societyCode: assignment.society.societyCode,
      }
    : null,
  complaint: {
    id: assignment.complaint.id,
    title: assignment.complaint.title,
    description: assignment.complaint.description || "",
    category: assignment.complaint.category,
    priority: assignment.complaint.priority,
    status: assignment.complaint.status,
    imageUrl: assignment.complaint.imageUrl || null,
    afterImageUrl: assignment.complaint.afterImageUrl || null,
    resident: assignment.complaint.resident
      ? {
          name: assignment.complaint.resident.user.name,
          phone: assignment.complaint.resident.user.phone,
          email: assignment.complaint.resident.user.email,
          flatNumber: assignment.complaint.resident.flat?.flatNumber || "",
          wing: assignment.complaint.resident.flat?.wing || "",
        }
      : null,
  },
  assignedBy: assignment.assignedBy
    ? { id: assignment.assignedBy.id, name: assignment.assignedBy.name }
    : null,
});

const getAdminSocietyId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { societyId: true },
  });
  return user?.societyId || null;
};

const getVendorIdForUser = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return vendor?.id || null;
};

/**
 * Society Admin assigns a vendor to a complaint belonging to their own
 * society. The society is always derived from the authenticated admin's
 * user record — never from the request body.
 */
export const assignVendorToComplaint = async (
  complaintId,
  vendorId,
  adminUserId,
) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true, title: true, status: true },
  });
  if (!complaint) return { notFound: true };

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      userId: true,
      companyName: true,
      isAvailable: true,
      user: { select: { isActive: true, emailVerified: true } },
    },
  });
  if (!vendor) return { notFound: true, message: "Vendor not found" };
  if (!vendor.user.isActive || !vendor.user.emailVerified) {
    return {
      conflict: true,
      message: "This vendor is not activated yet and cannot be assigned work",
    };
  }
  if (!vendor.isAvailable) {
    return { conflict: true, message: "This vendor is currently unavailable" };
  }

  const active = await prisma.vendorAssignment.findFirst({
    where: { complaintId, status: { in: ACTIVE_STATUSES } },
    select: { id: true },
  });
  if (active) {
    return {
      conflict: true,
      message: "Complaint already has an active vendor assignment",
    };
  }

  if (!VALID_COMPLAINT_TRANSITIONS[complaint.status]?.includes("ASSIGNED")) {
    return {
      invalidTransition: true,
      message: `Cannot assign vendor to a complaint in ${complaint.status} status`,
    };
  }

  const assignment = await prisma.$transaction(async (tx) => {
    const a = await tx.vendorAssignment.create({
      data: {
        vendorId,
        societyId,
        complaintId,
        assignedById: adminUserId,
        status: "ASSIGNED",
      },
    });

    await tx.complaint.update({
      where: { id: complaintId },
      data: { status: "ASSIGNED" },
    });

    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status: "ASSIGNED",
        changedById: adminUserId,
        note: `Assigned to ${vendor.companyName}`,
      },
    });

    return a;
  });

  const fullAssignment = await prisma.vendorAssignment.findUnique({
    where: { id: assignment.id },
    include: ASSIGNMENT_INCLUDE,
  });

  // In-app notification for the vendor. This is a best-effort side effect —
  // a failure to notify must never fail the assignment itself.
  try {
    await createNotification({
      userId: vendor.userId,
      type: "VENDOR_ASSIGNMENT",
      title: "New work assignment",
      message: `You have been assigned to complaint "${complaint.title}"`,
      complaintId,
    });

    const resident = await prisma.resident.findUnique({
      where: { id: fullAssignment.complaint.resident.id },
      select: { userId: true },
    });

    if (resident?.userId) {
      await createNotification({
        userId: resident.userId,
        type: "VENDOR_ASSIGNED",
        title: "Vendor assigned",
        message: `A vendor has been assigned to your complaint "${complaint.title}"`,
        complaintId,
      });
    }
  } catch (error) {
    console.error("Failed to create vendor assignment notification:", error);
  }

  return { assignment: mapAssignment(fullAssignment) };
};

export const getComplaintAssignments = async (complaintId, adminUserId) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true },
  });
  if (!complaint) return { notFound: true };

  const [vendorAssignments, staffResult] = await Promise.all([
    prisma.vendorAssignment.findMany({
      where: { complaintId },
      include: ASSIGNMENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    }),
    getComplaintStaffAssignments(complaintId, adminUserId),
  ]);

  const assignments = [
    ...vendorAssignments.map(mapAssignment),
    ...(staffResult?.assignments || []),
  ].sort(
    (a, b) =>
      new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime(),
  );

  return { assignments };
};

export const listVendorAssignments = async (userId) => {
  const vendorId = await getVendorIdForUser(userId);
  if (!vendorId) return { forbidden: true };

  const assignments = await prisma.vendorAssignment.findMany({
    where: { vendorId },
    include: ASSIGNMENT_INCLUDE,
    orderBy: { assignedAt: "desc" },
  });

  return { assignments: assignments.map(mapAssignment) };
};

export const getVendorAssignmentById = async (userId, assignmentId) => {
  const vendorId = await getVendorIdForUser(userId);
  if (!vendorId) return { forbidden: true };

  const assignment = await prisma.vendorAssignment.findFirst({
    where: { id: assignmentId, vendorId },
    include: ASSIGNMENT_INCLUDE,
  });

  if (!assignment) return { notFound: true };

  return { assignment: mapAssignment(assignment) };
};

export const updateVendorAssignmentStatus = async (
  userId,
  assignmentId,
  status,
  { afterImageUrl } = {},
) => {
  const vendorId = await getVendorIdForUser(userId);
  if (!vendorId) return { forbidden: true };

  const assignment = await prisma.vendorAssignment.findFirst({
    where: { id: assignmentId, vendorId },
    select: { id: true, status: true, complaintId: true },
  });

  if (!assignment) return { notFound: true };

  if (!VALID_TRANSITIONS[assignment.status]?.includes(status)) {
    return {
      invalidTransition: true,
      message: `Cannot change assignment status from ${assignment.status} to ${status}`,
    };
  }

  // Pre-check complaint status transition before entering the transaction.
  if (
    status === "ACCEPTED" ||
    status === "COMPLETED" ||
    status === "CANCELLED"
  ) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: assignment.complaintId },
      select: { status: true },
    });
    const targetComplaintStatus =
      status === "ACCEPTED"
        ? "IN_PROGRESS"
        : status === "COMPLETED"
          ? "RESOLVED"
          : "OPEN";

    if (
      !VALID_COMPLAINT_TRANSITIONS[complaint.status]?.includes(
        targetComplaintStatus,
      )
    ) {
      return {
        invalidTransition: true,
        message: `Cannot change complaint status from ${complaint.status} to ${targetComplaintStatus}`,
      };
    }
  }

  const data = { status };
  if (status === "ACCEPTED") data.acceptedAt = new Date();
  if (status === "IN_PROGRESS") data.startedAt = new Date();
  if (status === "COMPLETED") data.completedAt = new Date();
  if (status === "CANCELLED") data.cancelledAt = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const updatedAssignment = await tx.vendorAssignment.update({
      where: { id: assignmentId },
      data,
    });

    let complaintStatusResult;
    if (status === "ACCEPTED") {
      complaintStatusResult = await recordStatusChange(
        tx,
        assignment.complaintId,
        "IN_PROGRESS",
        userId,
        "Vendor accepted the assignment",
      );
    } else if (status === "COMPLETED") {
      complaintStatusResult = await recordStatusChange(
        tx,
        assignment.complaintId,
        "RESOLVED",
        userId,
        "Work completed by vendor",
        afterImageUrl ? { afterImageUrl } : {},
      );
    } else if (status === "CANCELLED") {
      complaintStatusResult = await recordStatusChange(
        tx,
        assignment.complaintId,
        "OPEN",
        userId,
        "Vendor assignment cancelled",
      );
    }

    if (complaintStatusResult?.invalidTransition) {
      throw new Error(complaintStatusResult.message);
    }

    return await tx.vendorAssignment.findUnique({
      where: { id: assignmentId },
      include: ASSIGNMENT_INCLUDE,
    });
  });

  // Notify the society admin when a vendor accepts or rejects an assignment.
  // Best-effort side effect — a notification failure must never fail the
  // status update itself.
  if (status === "ACCEPTED" || status === "CANCELLED") {
    try {
      const adminId = await getSocietyAdminId(updated.societyId);
      if (adminId) {
        const verb = status === "ACCEPTED" ? "accepted" : "rejected";

        await createNotification({
          userId: adminId,
          type: status === "ACCEPTED" ? "VENDOR_ACCEPTED" : "VENDOR_REJECTED",
          title: `Vendor ${verb} the assignment`,
          message: `${updated.vendor.companyName} ${verb} the work for complaint "${updated.complaint.title}"`,
          complaintId: updated.complaintId,
        });
      }
    } catch (error) {
      console.error(
        "Failed to create vendor assignment update notification:",
        error,
      );
    }
  }

  // Notify the society admin when the vendor starts work. Best-effort side
  // effect — a notification failure must never fail the status update.
  if (status === "IN_PROGRESS") {
    try {
      const adminId = await getSocietyAdminId(updated.societyId);
      if (adminId) {
        await createNotification({
          userId: adminId,
          type: "VENDOR_IN_PROGRESS",
          title: "Vendor started work",
          message: `${updated.vendor.companyName} started work on complaint "${updated.complaint.title}"`,
          complaintId: updated.complaintId,
        });

        const resident = await prisma.resident.findUnique({
          where: { id: updated.complaint.resident.id },
          select: { userId: true },
        });

        if (resident?.userId) {
          await createNotification({
            userId: resident.userId,
            type: "VENDOR_IN_PROGRESS",
            title: "Vendor started work",
            message: `${updated.vendor.companyName} started work on your complaint "${updated.complaint.title}"`,
            complaintId: updated.complaintId,
          });
        }
      }
    } catch (error) {
      console.error("Failed to create vendor start-work notification:", error);
    }
  }

  // When the vendor completes the assignment, notify the resident that their
  // complaint has been resolved and the society admin of the completion.
  // Best-effort side effects — a notification failure must never fail the
  // status update.
  if (status === "COMPLETED") {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: updated.complaint.resident.id },
        select: { userId: true },
      });
      if (resident?.userId) {
        await createNotification({
          userId: resident.userId,
          type: "COMPLAINT_RESOLVED",
          title: "Complaint resolved",
          message: `Your complaint "${updated.complaint.title}" has been resolved by ${updated.vendor.companyName}`,
          complaintId: updated.complaintId,
        });
      }

      const adminId = await getSocietyAdminId(updated.societyId);
      if (adminId) {
        await createNotification({
          userId: adminId,
          type: "COMPLAINT_RESOLVED",
          title: "Complaint resolved",
          message: `${updated.vendor.companyName} resolved complaint "${updated.complaint.title}"`,
          complaintId: updated.complaintId,
        });
      }
    } catch (error) {
      console.error(
        "Failed to create complaint resolved notifications:",
        error,
      );
    }
  }

  return { assignment: mapAssignment(updated) };
};
