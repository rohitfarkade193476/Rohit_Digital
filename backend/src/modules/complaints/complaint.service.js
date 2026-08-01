import prisma from "../../config/prisma.js";

const COMPLAINT_INCLUDE = {
  resident: {
    select: {
      id: true,
      user: { select: { name: true, phone: true, email: true } },
      flat: { select: { flatNumber: true, wing: true } },
    },
  },
  vendorAssignments: {
    select: {
      id: true,
      status: true,
      assignedAt: true,
      acceptedAt: true,
      completedAt: true,
      cancelledAt: true,
      vendor: {
        select: {
          id: true,
          companyName: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  },
};

const mapComplaint = (complaint) => {
  const resident = complaint.resident;
  const flat = resident?.flat;

  const activeAssignment = complaint.vendorAssignments?.find((a) =>
    ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(a.status)
  );

  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description || "",
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    residentId: complaint.residentId,
    residentName: resident?.user.name || "",
    residentPhone: resident?.user.phone || "",
    residentEmail: resident?.user.email || "",
    flatNumber: flat?.flatNumber || "",
    wing: flat?.wing || "",
    assignedVendor: activeAssignment
      ? {
          id: activeAssignment.vendor.id,
          companyName: activeAssignment.vendor.companyName,
          category: activeAssignment.vendor.category,
          status: activeAssignment.status,
        }
      : null,
    vendorAssignments: (complaint.vendorAssignments || []).map((a) => ({
      id: a.id,
      status: a.status,
      assignedAt: a.assignedAt,
      acceptedAt: a.acceptedAt,
      completedAt: a.completedAt,
      cancelledAt: a.cancelledAt,
      vendor: {
        id: a.vendor.id,
        companyName: a.vendor.companyName,
        category: a.vendor.category,
      },
    })),
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
};

const getSocietyIdForUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { societyId: true },
  });
  return user?.societyId || null;
};

export const createComplaint = async (user, data) => {
  const societyId = await getSocietyIdForUser(user.id);
  if (!societyId) return { forbidden: true };

  let residentId = data.residentId || null;
  let flatId = null;

  if (user.role === "RESIDENT") {
    const resident = await prisma.resident.findUnique({
      where: { userId: user.id },
      select: { id: true, societyId: true, flatId: true },
    });

    if (!resident || resident.societyId !== societyId) {
      return { forbidden: true };
    }

    residentId = resident.id;
    flatId = resident.flatId;
  } else {
    const resident = await prisma.resident.findFirst({
      where: { id: data.residentId, societyId },
      select: { id: true, flatId: true },
    });

    if (!resident) {
      return {
        notFound: true,
        message: "Resident not found in this society",
      };
    }

    residentId = resident.id;
    flatId = resident.flatId;
  }

  const complaint = await prisma.complaint.create({
    data: {
      societyId,
      residentId,
      flatId,
      title: data.title,
      description: data.description || null,
      category: data.category,
      priority: data.priority || "MEDIUM",
      status: "OPEN",
    },
    include: COMPLAINT_INCLUDE,
  });

  return mapComplaint(complaint);
};

export const listComplaints = async (
  user,
  { page = 1, limit = 20, status, category, priority } = {}
) => {
  const societyId = await getSocietyIdForUser(user.id);
  if (!societyId) return { forbidden: true };

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (user.role === "RESIDENT") {
    const resident = await prisma.resident.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!resident) return { forbidden: true };
    where.residentId = resident.id;
  } else {
    where.societyId = societyId;
  }

  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: COMPLAINT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    complaints: complaints.map(mapComplaint),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getComplaintById = async (id, user) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: COMPLAINT_INCLUDE,
  });

  if (!complaint) return null;

  if (user.role === "RESIDENT") {
    const resident = await prisma.resident.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!resident || complaint.residentId !== resident.id) return null;
  } else {
    const societyId = await getSocietyIdForUser(user.id);
    if (complaint.societyId !== societyId) return null;
  }

  return mapComplaint(complaint);
};
