import prisma from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js";

const ACTIVE_STATUSES = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];

const VALID_COMPLAINT_TRANSITIONS = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["ACCEPTED", "IN_PROGRESS", "OPEN"],
  ACCEPTED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["RESOLVED", "REOPENED", "OPEN"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["ASSIGNED"],
};

const STAFF_ASSIGNMENT_INCLUDE = {
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
        category: assignment.complaint.category,
        priority: assignment.complaint.priority,
        status: assignment.complaint.status,
      }
    : null,
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

/**
 * Society Admin assigns a staff member to a complaint belonging to their own
 * society. The society is always derived from the authenticated admin's user
 * record — never from the request body. The selected staff member MUST belong
 * to the same society as the complaint.
 */
export const assignStaffToComplaint = async (complaintId, staffId, adminUserId) => {
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
      message: "This staff member is not activated yet and cannot be assigned work",
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
    include: STAFF_ASSIGNMENT_INCLUDE,
  });

  try {
    await createNotification({
      userId: staff.userId,
      type: "STAFF_ASSIGNMENT",
      title: "New work assignment",
      message: `You have been assigned to complaint "${complaint.title}"`,
    });
  } catch (error) {
    console.error("Failed to create staff assignment notification:", error);
  }

  return { assignment: mapStaffAssignment(fullAssignment) };
};

/**
 * Fetch all staff assignments for a complaint (Society Admin only).
 */
export const getComplaintStaffAssignments = async (complaintId, adminUserId) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true },
  });
  if (!complaint) return { notFound: true };

  const assignments = await prisma.staffAssignment.findMany({
    where: { complaintId },
    include: STAFF_ASSIGNMENT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return { assignments: assignments.map(mapStaffAssignment) };
};
