import crypto from "crypto";
import prisma from "../../config/prisma.js";
import { auth } from "../../lib/auth.js";

const generateTemporaryPassword = () =>
  crypto.randomBytes(24).toString("base64url");

const STAFF_SELECT = {
  id: true,
  userId: true,
  societyId: true,
  role: true,
  department: true,
  joiningDate: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      emailVerified: true,
      isActive: true,
    },
  },
};

const mapStaff = (staff) => {
  const status = !staff.user.isActive
    ? "INACTIVE"
    : staff.user.emailVerified
      ? "ACTIVE"
      : "INVITED";
  const invitationStatus =
    status === "ACTIVE" ? "Accepted" : status === "INVITED" ? "Pending" : "Suspended";

  return {
    id: staff.id,
    userId: staff.userId,
    name: staff.user.name,
    firstName: staff.user.firstName,
    lastName: staff.user.lastName,
    phone: staff.user.phone,
    email: staff.user.email,
    role: staff.role,
    department: staff.department,
    joiningDate: staff.joiningDate
      ? staff.joiningDate.toISOString().split("T")[0]
      : "",
    status,
    invitationStatus,
    isActive: staff.user.isActive,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  };
};

export const getAllStaff = async (societyId, { page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where: { societyId },
      select: STAFF_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.staff.count({ where: { societyId } }),
  ]);

  return {
    staff: staff.map(mapStaff),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getStaffById = async (id, societyId) => {
  const staff = await prisma.staff.findUnique({
    where: { id },
    select: STAFF_SELECT,
  });

  if (!staff) return null;
  if (staff.societyId !== societyId) return null;

  return mapStaff(staff);
};

export const createStaff = async (societyId, data) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(data.phone ? [{ phone: data.phone }] : []),
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });

  if (existingUser) {
    const field = existingUser.phone === data.phone ? "phone" : "email";
    return {
      conflict: true,
      message: `User with ${field} ${existingUser[field]} already exists`,
    };
  }

  if (!data.email) {
    return {
      conflict: true,
      message: "An email address is required to create a staff account and send the activation email",
    };
  }

  const nameParts = (data.name || "").split(" ");
  const firstName = nameParts[0] || data.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  const joiningDate =
    data.joiningDate && !isNaN(Date.parse(data.joiningDate))
      ? new Date(data.joiningDate)
      : null;

  const authUser = await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: generateTemporaryPassword(),
      firstName,
      lastName,
      phone: data.phone || null,
      role: "STAFF",
      societyId,
      isActive: data.status !== "INACTIVE",
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      return tx.staff.create({
        data: {
          userId: authUser.user.id,
          societyId,
          role: data.role || "General",
          department: data.department || "General",
          joiningDate,
        },
        select: STAFF_SELECT,
      });
    });

    let invitationSent = false;
    if (result.user.email) {
      try {
        await auth.api.requestPasswordReset({ body: { email: result.user.email } });
        invitationSent = true;
      } catch (error) {
        console.error(
          `Failed to initiate invitation for staff ${result.user.email}:`,
          error
        );
      }
    }

    return {
      ...mapStaff(result),
      invitationSent,
    };
  } catch (error) {
    await prisma.user
      .delete({ where: { id: authUser.user.id } })
      .catch(() => {});
    throw error;
  }
};

export const updateStaff = async (id, societyId, data) => {
  const existing = await prisma.staff.findUnique({
    where: { id },
    select: { id: true, societyId: true, userId: true },
  });

  if (!existing) return { notFound: true };
  if (existing.societyId !== societyId) return { forbidden: true };

  const updateData = {};

  if (
    data.name !== undefined ||
    data.phone !== undefined ||
    data.email !== undefined ||
    data.status !== undefined
  ) {
    const name = data.name;
    const nameParts = (name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    updateData.user = {
      update: {
        ...(data.name !== undefined && { name: data.name, firstName, lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.status !== undefined && { isActive: data.status !== "INACTIVE" }),
      },
    };
  }

  if (data.role !== undefined) {
    updateData.role = data.role;
  }

  if (data.department !== undefined) {
    updateData.department = data.department;
  }

  if (data.joiningDate !== undefined) {
    updateData.joiningDate =
      data.joiningDate && !isNaN(Date.parse(data.joiningDate))
        ? new Date(data.joiningDate)
        : null;
  }

  const staff = await prisma.staff.update({
    where: { id },
    data: updateData,
    select: STAFF_SELECT,
  });

  return mapStaff(staff);
};

export const deactivateStaff = async (id, societyId) => {
  const existing = await prisma.staff.findUnique({
    where: { id },
    select: { id: true, societyId: true, userId: true },
  });

  if (!existing) return { notFound: true };
  if (existing.societyId !== societyId) return { forbidden: true };

  await prisma.user.update({
    where: { id: existing.userId },
    data: { isActive: false },
  });

  return { deactivated: true };
};
