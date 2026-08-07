import prisma from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js";
import { recordStatusChange, getSocietyAdminId } from "./complaint.service.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];

/**
 * Valid assignment-status transitions for a staff member.
 * Mirrors the vendor assignment state machine exactly.
 */
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

// ─── Prisma include shapes ────────────────────────────────────────────────────

/**
 * Minimal include used by the admin-side helpers (assignStaffToComplaint,
 * getComplaintStaffAssignments). Kept as-is to avoid breaking those callers.
 */
const STAFF_ASSIGNMENT_INCLUDE_ADMIN = {
  staff: {
    select: {
      id: true,
      role: true,
      department: true,
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
      category: true,
      priority: true,
      status: true,
    },
  },
  assignedBy: {
    select: { id: true, name: true },
  },
};

/**
 * Rich include used by the staff self-service helpers. Carries the full
 * complaint data the Staff UI needs, mirroring vendor-assignment ASSIGNMENT_INCLUDE.
 */
const STAFF_ASSIGNMENT_INCLUDE_SELF = {
  staff: {
    select: {
      id: true,
      role: true,
      department: true,
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
      statusHistory: {
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
          changedBy: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  },
  assignedBy: {
    select: { id: true, name: true },
  },
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapStaffAssignment = (assignment) => ({
  id: assignment.id,
  type: "STAFF",
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  acceptedAt: assignment.acceptedAt,
  startedAt: assignment.startedAt,
  completedAt: assignment.completedAt,
  cancelledAt: assignment.cancelledAt,
  staff: assignment.staff
    ? {
        id: assignment.staff.id,
        name: assignment.staff.user.name,
        role: assignment.staff.role,
        department: assignment.staff.department,
        phone: assignment.staff.user.phone,
        email: assignment.staff.user.email,
      }
    : null,
  society: assignment.society
    ? {
        id: assignment.society.id,
        name: assignment.society.name,
        societyCode: assignment.society.societyCode,
      }
    : null,
  complaint: assignment.complaint
    ? {
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
              flatNumber:
                assignment.complaint.resident.flat?.flatNumber || "",
              wing: assignment.complaint.resident.flat?.wing || "",
            }
          : null,
        statusHistory: (assignment.complaint.statusHistory || []).map((h) => ({
          id: h.id,
          status: h.status,
          note: h.note || null,
          createdAt: h.createdAt,
          changedBy: h.changedBy
            ? {
                id: h.changedBy.id,
                name: h.changedBy.name,
                role: h.changedBy.role,
              }
            : null,
        })),
      }
    : null,
  assignedBy: assignment.assignedBy
    ? { id: assignment.assignedBy.id, name: assignment.assignedBy.name }
    : null,
});

/**
 * Slim mapper used by admin-side helpers — keeps the original shape so
 * vendor-assignment.service.js callers that spread the result are unaffected.
 */
const mapStaffAssignmentAdmin = (assignment) => ({
  id: assignment.id,
  type: "STAFF",
  status: assignment.status,
  assignedAt: assignment.assignedAt,
  acceptedAt: assignment.acceptedAt,
  startedAt: assignment.startedAt,
  completedAt: assignment.completedAt,
  cancelledAt: assignment.cancelledAt,
  staff: assignment.staff
    ? {
        id: assignment.staff.id,
        name: assignment.staff.user.name,
        role: assignment.staff.role,
        department: assignment.staff.department,
        phone: assignment.staff.user.phone,
        email: assignment.staff.user.email,
      }
    : null,
  society: assignment.society
    ? {
        id: assignment.society.id,
        name: assignment.society.name,
        societyCode: assignment.society.societyCode,
      }
    : null,
  complaint: assignment.complaint
    ? {
        id: assignment.complaint.id,
        title: assignment.complaint.title,
        category: assignment.complaint.category,
        priority: assignment.complaint.priority,
        status: assignment.complaint.status,
      }
    : null,
  assignedBy: assignment.assignedBy
    ? { id: assignment.assignedBy.id, name: assignment.assignedBy.name }
    : null,
});

// ─── Internal helpers ─────────────────────────────────────────────────────────

const getAdminSocietyId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { societyId: true },
  });
  return user?.societyId || null;
};

const getStaffIdForUser = async (userId) => {
  const staff = await prisma.staff.findUnique({
    where: { userId },
    select: { id: true },
  });
  return staff?.id || null;
};

// ─── Admin-side functions (unchanged behaviour) ───────────────────────────────

/**
 * Society Admin assigns a staff member to a complaint belonging to their own
 * society. The society is always derived from the authenticated admin's user
 * record — never from the request body. The selected staff member MUST belong
 * to the same society as the complaint.
 */
export const assignStaffToComplaint = async (
  complaintId,
  staffId,
  adminUserId,
) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true, title: true, status: true },
  });
  if (!complaint) return { notFound: true };

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      userId: true,
      societyId: true,
      role: true,
      department: true,
      user: { select: { name: true, isActive: true, emailVerified: true } },
    },
  });
  if (!staff) return { notFound: true, message: "Staff member not found" };
  if (staff.societyId !== societyId) {
    return {
      conflict: true,
      message: "This staff member does not belong to your society",
    };
  }
  if (!staff.user.isActive || !staff.user.emailVerified) {
    return {
      conflict: true,
      message:
        "This staff member is not activated yet and cannot be assigned work",
    };
  }

  const active = await prisma.staffAssignment.findFirst({
    where: { complaintId, status: { in: ACTIVE_STATUSES } },
    select: { id: true },
  });
  if (active) {
    return {
      conflict: true,
      message: "Complaint already has an active staff assignment",
    };
  }

  if (!VALID_COMPLAINT_TRANSITIONS[complaint.status]?.includes("ASSIGNED")) {
    return {
      invalidTransition: true,
      message: `Cannot assign staff to a complaint in ${complaint.status} status`,
    };
  }

  const assignment = await prisma.$transaction(async (tx) => {
    const a = await tx.staffAssignment.create({
      data: {
        staffId,
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
        note: `Assigned to ${staff.user.name} (Staff)`,
      },
    });

    return a;
  });

  const fullAssignment = await prisma.staffAssignment.findUnique({
    where: { id: assignment.id },
    include: STAFF_ASSIGNMENT_INCLUDE_ADMIN,
  });

  // Notify the staff member of their new assignment. Best-effort side effect —
  // a notification failure must never fail the assignment itself.
  try {
    await createNotification({
      userId: staff.userId,
      type: "STAFF_ASSIGNMENT",
      title: "New work assignment",
      message: `You have been assigned to complaint "${complaint.title}"`,
      complaintId,
    });
  } catch (error) {
    console.error("Failed to create staff assignment notification:", error);
  }

  return { assignment: mapStaffAssignmentAdmin(fullAssignment) };
};

/**
 * Fetch all staff assignments for a complaint (Society Admin only).
 */
export const getComplaintStaffAssignments = async (
  complaintId,
  adminUserId,
) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true },
  });
  if (!complaint) return { notFound: true };

  const assignments = await prisma.staffAssignment.findMany({
    where: { complaintId },
    include: STAFF_ASSIGNMENT_INCLUDE_ADMIN,
    orderBy: { createdAt: "desc" },
  });

  return { assignments: assignments.map(mapStaffAssignmentAdmin) };
};

// ─── Staff self-service functions ─────────────────────────────────────────────

/**
 * Return all assignments that belong to the authenticated staff member.
 */
export const listStaffAssignments = async (userId) => {
  const staffId = await getStaffIdForUser(userId);
  if (!staffId) return { forbidden: true };

  const assignments = await prisma.staffAssignment.findMany({
    where: { staffId },
    include: STAFF_ASSIGNMENT_INCLUDE_SELF,
    orderBy: { assignedAt: "desc" },
  });

  return { assignments: assignments.map(mapStaffAssignment) };
};

/**
 * Return a single staff assignment, only if it belongs to the authenticated
 * staff member.
 */
export const getStaffAssignmentById = async (userId, assignmentId) => {
  const staffId = await getStaffIdForUser(userId);
  if (!staffId) return { forbidden: true };

  const assignment = await prisma.staffAssignment.findFirst({
    where: { id: assignmentId, staffId },
    include: STAFF_ASSIGNMENT_INCLUDE_SELF,
  });

  if (!assignment) return { notFound: true };

  return { assignment: mapStaffAssignment(assignment) };
};

/**
 * Staff member updates the status of their own assignment.
 *
 * Valid transitions (mirroring vendor assignment state machine):
 *   ASSIGNED  → ACCEPTED | CANCELLED
 *   ACCEPTED  → IN_PROGRESS | CANCELLED
 *   IN_PROGRESS → COMPLETED
 *
 * Complaint side-effects:
 *   ACCEPTED    → complaint IN_PROGRESS + history entry
 *   IN_PROGRESS → (complaint already IN_PROGRESS — no redundant update)
 *   COMPLETED   → complaint RESOLVED + history entry + afterImageUrl saved
 *   CANCELLED   → complaint OPEN + history entry
 *
 * For COMPLETED, afterImageUrl is required and stored on the Complaint record.
 */
export const updateStaffAssignmentStatus = async (
  userId,
  assignmentId,
  status,
  { afterImageUrl } = {},
) => {
  const staffId = await getStaffIdForUser(userId);
  if (!staffId) return { forbidden: true };

  const assignment = await prisma.staffAssignment.findFirst({
    where: { id: assignmentId, staffId },
    select: { id: true, status: true, complaintId: true, societyId: true },
  });

  if (!assignment) return { notFound: true };

  if (!VALID_TRANSITIONS[assignment.status]?.includes(status)) {
    return {
      invalidTransition: true,
      message: `Cannot change assignment status from ${assignment.status} to ${status}`,
    };
  }

  // COMPLETED requires an after-resolution image.
  if (status === "COMPLETED" && !afterImageUrl) {
    return {
      validationError: true,
      message: "An after-resolution image is required to complete the assignment",
    };
  }

  // Pre-validate the complaint status transition before entering the
  // transaction, so we surface a clear error without partial writes.
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
          : "OPEN"; // CANCELLED

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

  // Build the assignment update payload.
  const data = { status };
  if (status === "ACCEPTED") data.acceptedAt = new Date();
  if (status === "IN_PROGRESS") data.startedAt = new Date();
  if (status === "COMPLETED") data.completedAt = new Date();
  if (status === "CANCELLED") data.cancelledAt = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.staffAssignment.update({
      where: { id: assignmentId },
      data,
    });

    // Sync the complaint status and append a history entry.
    if (status === "ACCEPTED") {
      const r = await recordStatusChange(
        tx,
        assignment.complaintId,
        "IN_PROGRESS",
        userId,
        "Staff accepted the assignment",
      );
      if (r?.invalidTransition) throw new Error(r.message);
    } else if (status === "IN_PROGRESS") {
      // Complaint is already IN_PROGRESS from the ACCEPTED transition.
      // No redundant status update needed — just append a history note.
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: assignment.complaintId,
          status: "IN_PROGRESS",
          changedById: userId,
          note: "Staff started work on the complaint",
        },
      });
    } else if (status === "COMPLETED") {
      const r = await recordStatusChange(
        tx,
        assignment.complaintId,
        "RESOLVED",
        userId,
        "Work completed by staff",
        afterImageUrl ? { afterImageUrl } : {},
      );
      if (r?.invalidTransition) throw new Error(r.message);
    } else if (status === "CANCELLED") {
      const r = await recordStatusChange(
        tx,
        assignment.complaintId,
        "OPEN",
        userId,
        "Staff assignment cancelled",
      );
      if (r?.invalidTransition) throw new Error(r.message);
    }

    return tx.staffAssignment.findUnique({
      where: { id: assignmentId },
      include: STAFF_ASSIGNMENT_INCLUDE_SELF,
    });
  });

  // ── Notifications (best-effort — failures must never fail the update) ──────

  // Admin is notified when staff accepts or declines.
  if (status === "ACCEPTED" || status === "CANCELLED") {
    try {
      const adminId = await getSocietyAdminId(updated.societyId);
      if (adminId) {
        const verb = status === "ACCEPTED" ? "accepted" : "declined";
        await createNotification({
          userId: adminId,
          type: status === "ACCEPTED" ? "STAFF_ACCEPTED" : "STAFF_REJECTED",
          title: `Staff ${verb} the assignment`,
          message: `${updated.staff.user.name} ${verb} the work for complaint "${updated.complaint.title}"`,
          complaintId: updated.complaintId,
        });
      }
    } catch (error) {
      console.error(
        "Failed to create staff accept/decline notification:",
        error,
      );
    }
  }

  // Admin is notified when staff starts work.
  if (status === "IN_PROGRESS") {
    try {
      const adminId = await getSocietyAdminId(updated.societyId);
      if (adminId) {
        await createNotification({
          userId: adminId,
          type: "STAFF_IN_PROGRESS",
          title: "Staff started work",
          message: `${updated.staff.user.name} started work on complaint "${updated.complaint.title}"`,
          complaintId: updated.complaintId,
        });
      }
    } catch (error) {
      console.error("Failed to create staff start-work notification:", error);
    }
  }

  // Resident + Admin are notified when staff completes (resolves) the complaint.
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
          message: `Your complaint "${updated.complaint.title}" has been resolved by ${updated.staff.user.name}`,
          complaintId: updated.complaintId,
        });
      }

      const adminId = await getSocietyAdminId(updated.societyId);
      if (adminId) {
        await createNotification({
          userId: adminId,
          type: "COMPLAINT_RESOLVED",
          title: "Complaint resolved",
          message: `${updated.staff.user.name} resolved complaint "${updated.complaint.title}"`,
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

  return { assignment: mapStaffAssignment(updated) };
};
