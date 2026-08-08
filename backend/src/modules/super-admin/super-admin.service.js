import prisma from "../../config/prisma.js";

const SOCIETY_SELECT = {
  id: true,
  name: true,
  societyCode: true,
  registrationNumber: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  contactEmail: true,
  contactPhone: true,
  logo: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const ACTIVE_COMPLAINT_STATUSES = ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "REOPENED"];

const countByKey = (rows, key) => {
  const counts = {};
  for (const row of rows) {
    counts[row[key]] = row._count._all;
  }
  return counts;
};

const sumCounts = (rows) => rows.reduce((total, row) => total + row._count._all, 0);

export const getDashboardStats = async () => {
  const [societyCounts, userCounts, complaintCounts, priorityCounts, residents, staff, vendors] =
    await Promise.all([
      prisma.society.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.complaint.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.complaint.groupBy({ by: ["priority"], _count: { _all: true } }),
      prisma.resident.count(),
      prisma.staff.count(),
      prisma.vendor.count(),
    ]);

  const bySocietyStatus = countByKey(societyCounts, "status");
  const byRole = countByKey(userCounts, "role");
  const byComplaintStatus = countByKey(complaintCounts, "status");
  const byPriority = countByKey(priorityCounts, "priority");

  const openComplaints = ACTIVE_COMPLAINT_STATUSES.reduce(
    (total, status) => total + (byComplaintStatus[status] || 0),
    0
  );
  const resolvedComplaints =
    (byComplaintStatus.RESOLVED || 0) + (byComplaintStatus.CLOSED || 0);

  return {
    societies: {
      total: sumCounts(societyCounts),
      active: bySocietyStatus.ACTIVE || 0,
      inactive: bySocietyStatus.INACTIVE || 0,
      suspended: bySocietyStatus.SUSPENDED || 0,
    },
    users: {
      total: sumCounts(userCounts),
      superAdmins: byRole.SUPER_ADMIN || 0,
      societyAdmins: byRole.SOCIETY_ADMIN || 0,
      residents: byRole.RESIDENT || 0,
      staff: byRole.STAFF || 0,
      vendors: byRole.VENDOR || 0,
    },
    residents,
    staff,
    vendors,
    complaints: {
      total: sumCounts(complaintCounts),
      open: openComplaints,
      resolved: resolvedComplaints,
      byStatus: byComplaintStatus,
    },
    priorityBreakdown: byPriority,
  };
};

export const getSocieties = async ({ search, status, page = 1, limit = 10 } = {}) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { societyCode: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
      { contactPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, societies] = await Promise.all([
    prisma.society.count({ where }),
    prisma.society.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        ...SOCIETY_SELECT,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        _count: {
          select: { flats: true, residents: true, complaints: true, users: true },
        },
      },
    }),
  ]);

  return { total, page, limit, societies };
};

export const getSocietyById = async (id) => {
  const society = await prisma.society.findUnique({
    where: { id },
    select: {
      ...SOCIETY_SELECT,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      _count: {
        select: {
          flats: true,
          residents: true,
          staff: true,
          complaints: true,
          users: true,
          vendorAssignments: true,
          staffAssignments: true,
          vendorConnections: true,
        },
      },
    },
  });

  return society;
};

export const updateSocietyStatus = async (id, status) => {
  const existing = await prisma.society.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  return prisma.society.update({
    where: { id },
    data: { status },
    select: SOCIETY_SELECT,
  });
};

export const getUsers = async ({ role, societyId, search, page = 1, limit = 10 } = {}) => {
  const where = {};

  if (role) {
    where.role = role;
  }

  if (societyId) {
    where.societyId = societyId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        society: {
          select: { id: true, name: true, societyCode: true },
        },
      },
    }),
  ]);

  return { total, page, limit, users };
};

export const updateUserStatus = async ({ id, isActive, actorId }) => {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!target) {
    return null;
  }

  if (target.role === "SUPER_ADMIN" || target.id === actorId) {
    const err = new Error("Super admin accounts cannot be modified");
    err.code = "SUPER_ADMIN_LOCKED";
    throw err;
  }

  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
};

export const getReportsOverview = async ({ from, to } = {}) => {
  const createdAtFilter = {};
  if (from) {
    createdAtFilter.gte = new Date(from);
  }
  if (to) {
    createdAtFilter.lte = new Date(to);
  }

  const where =
    Object.keys(createdAtFilter).length > 0 ? { createdAt: createdAtFilter } : {};

  const complaints = await prisma.complaint.findMany({
    where,
    select: {
      id: true,
      status: true,
      priority: true,
      category: true,
      societyId: true,
      createdAt: true,
      satisfiedAt: true,
    },
  });

  const total = complaints.length;
  const byStatus = {};
  const byPriority = {};
  const byCategory = {};
  const bySociety = new Map();

  for (const complaint of complaints) {
    byStatus[complaint.status] = (byStatus[complaint.status] || 0) + 1;
    byPriority[complaint.priority] = (byPriority[complaint.priority] || 0) + 1;
    byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1;
    bySociety.set(
      complaint.societyId,
      (bySociety.get(complaint.societyId) || 0) + 1
    );
  }

  const resolved = (byStatus.RESOLVED || 0) + (byStatus.CLOSED || 0);
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  const societyIds = [...bySociety.keys()];
  const societies = societyIds.length
    ? await prisma.society.findMany({
        where: { id: { in: societyIds } },
        select: { id: true, name: true, societyCode: true },
      })
    : [];

  const societyBreakdown = societies
    .map((society) => ({
      id: society.id,
      name: society.name,
      societyCode: society.societyCode,
      complaints: bySociety.get(society.id),
    }))
    .sort((a, b) => b.complaints - a.complaints);

  const monthCounts = new Map();
  for (const complaint of complaints) {
    const key = complaint.createdAt.toISOString().slice(0, 7);
    monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
  }

  const monthlyTrend = [...monthCounts.entries()]
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, count]) => ({ month, total: count }));

  return {
    totals: {
      complaints: total,
      resolved,
      open: total - resolved,
    },
    resolutionRate,
    byStatus,
    byPriority,
    byCategory,
    societyBreakdown,
    monthlyTrend,
    period: { from: from || null, to: to || null },
  };
};
