import crypto from "crypto";
import prisma from "../../config/prisma.js";
import { auth } from "../../lib/auth.js";

const generateTemporaryPassword = () =>
  crypto.randomBytes(24).toString("base64url");

const VENDOR_SELECT = {
  id: true,
  userId: true,
  companyName: true,
  category: true,
  contractType: true,
  description: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  isAvailable: true,
  notes: true,
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

const mapVendor = (vendor) => {
  const status = !vendor.user.isActive
    ? "INACTIVE"
    : vendor.user.emailVerified
      ? "ACTIVE"
      : "INVITED";

  return {
    id: vendor.id,
    userId: vendor.userId,
    companyName: vendor.companyName,
    name: vendor.companyName,
    firstName: vendor.user.firstName,
    lastName: vendor.user.lastName,
    contactPerson: `${vendor.user.firstName} ${vendor.user.lastName}`.trim(),
    phone: vendor.user.phone,
    email: vendor.user.email,
    category: vendor.category,
    contractType: vendor.contractType || "",
    description: vendor.description || "",
    address: vendor.address || "",
    city: vendor.city || "",
    state: vendor.state || "",
    pincode: vendor.pincode || "",
    isAvailable: vendor.isAvailable,
    notes: vendor.notes || "",
    status,
    isActive: vendor.user.isActive,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  };
};

/**
 * Public vendor self-registration.
 *
 * A vendor is an independent platform entity: no societyId is attached. The
 * flow mirrors the existing Resident/Staff activation pattern:
 *   1. Create a Better Auth User (role VENDOR) with a temporary password.
 *   2. Create the Vendor profile.
 *   3. Trigger requestPasswordReset() which sends the activation email via
 *      the shared Nodemailer transporter (/activate-account?token=...).
 */
export const registerVendor = async (data) => {
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
      message:
        "An email address is required to create a vendor account and send the activation email",
    };
  }

  const name = `${data.firstName} ${data.lastName}`.trim();

  const authUser = await auth.api.signUpEmail({
    body: {
      name,
      email: data.email,
      password: generateTemporaryPassword(),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      role: "VENDOR",
      isActive: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      return tx.vendor.create({
        data: {
          userId: authUser.user.id,
          companyName: data.companyName,
          category: data.category,
          contractType: data.contractType || null,
          description: data.description || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          isAvailable: true,
        },
        select: VENDOR_SELECT,
      });
    });

    let activationEmailSent = false;
    if (result.user.email) {
      try {
        await auth.api.requestPasswordReset({
          body: { email: result.user.email },
        });
        activationEmailSent = true;
      } catch (error) {
        console.error(
          `Failed to send activation email for vendor ${result.user.email}:`,
          error
        );
      }
    }

    return {
      ...mapVendor(result),
      activationEmailSent,
    };
  } catch (error) {
    await prisma.user
      .delete({ where: { id: authUser.user.id } })
      .catch(() => {});
    throw error;
  }
};

export const getVendorProfile = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: VENDOR_SELECT,
  });

  if (!vendor) return null;

  return mapVendor(vendor);
};

export const updateVendorProfile = async (userId, data) => {
  const existing = await prisma.vendor.findUnique({
    where: { userId },
    select: {
      id: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!existing) return { notFound: true };

  const updateData = {};

  if (
    data.firstName !== undefined ||
    data.lastName !== undefined ||
    data.phone !== undefined
  ) {
    const firstName =
      data.firstName !== undefined
        ? data.firstName
        : existing.user.firstName;
    const lastName =
      data.lastName !== undefined ? data.lastName : existing.user.lastName;

    updateData.user = {
      update: {
        ...(data.firstName !== undefined && { firstName }),
        ...(data.lastName !== undefined && { lastName }),
        ...((data.firstName !== undefined || data.lastName !== undefined) && {
          name: `${firstName} ${lastName}`.trim(),
        }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    };
  }

  const VENDOR_FIELDS = [
    "companyName",
    "category",
    "contractType",
    "description",
    "address",
    "city",
    "state",
    "pincode",
    "isAvailable",
  ];

  for (const field of VENDOR_FIELDS) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const vendor = await prisma.vendor.update({
    where: { id: existing.id },
    data: updateData,
    select: VENDOR_SELECT,
  });

  return mapVendor(vendor);
};

/**
 * Society Admin vendor discovery.
 *
 * Returns only vendors that can actually be selected for work:
 * - account is active and activated (email verified)
 * - currently available (isAvailable)
 *
 * Supports search (company name / category / city / contact / email) and
 * filtering by service category and availability.
 */
export const getAllVendors = async ({
  page = 1,
  limit = 20,
  search,
  category,
  isAvailable,
} = {}) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    user: { isActive: true, emailVerified: true },
    isAvailable: true,
  };

  if (isAvailable !== undefined && isAvailable !== "") {
    where.isAvailable = isAvailable === "true";
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search } } },
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      select: VENDOR_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    vendors: vendors.map(mapVendor),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getVendorById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: VENDOR_SELECT,
  });

  if (!vendor) return null;

  return mapVendor(vendor);
};
