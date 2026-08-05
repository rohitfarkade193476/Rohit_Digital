import crypto from "crypto";
import prisma from "../../config/prisma.js";
import { auth } from "../../lib/auth.js";
import {
  normalizeText,
  isValidEmail,
  isValidPhone,
  readExcelRows,
  removeUploadedFile,
} from "../../utils/excelImport.js";

const generateTemporaryPassword = () =>
  crypto.randomBytes(24).toString("base64url");

export const getAllResidents = async (societyId, { page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [residents, total] = await Promise.all([
    prisma.resident.findMany({
      where: { societyId },
      include: {
        user: {
          select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true, isActive: true },
        },
        flat: {
          select: { id: true, flatNumber: true, wing: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.resident.count({ where: { societyId } }),
  ]);

  const mapped = residents.map((r) => ({
    id: r.id,
    name: r.user.name,
    firstName: r.user.firstName,
    lastName: r.user.lastName,
    phone: r.user.phone,
    email: r.user.email,
    flatId: r.flat.id,
    flatNumber: r.flat.flatNumber,
    wing: r.flat.wing,
    status: r.flat.status,
    residentType: r.residentType,
    isActive: r.user.isActive,
    moveInDate: r.createdAt ? r.createdAt.toISOString().split("T")[0] : "",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return {
    residents: mapped,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getResidentById = async (id, societyId) => {
  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true, isActive: true },
      },
      flat: {
        select: { id: true, flatNumber: true, wing: true, status: true },
      },
    },
  });

  if (!resident) return null;
  if (resident.societyId !== societyId) return null;

  return {
    id: resident.id,
    name: resident.user.name,
    firstName: resident.user.firstName,
    lastName: resident.user.lastName,
    phone: resident.user.phone,
    email: resident.user.email,
    flatId: resident.flat.id,
    flatNumber: resident.flat.flatNumber,
    wing: resident.flat.wing,
    status: resident.flat.status,
    residentType: resident.residentType,
    isActive: resident.user.isActive,
    moveInDate: resident.createdAt ? resident.createdAt.toISOString().split("T")[0] : "",
    createdAt: resident.createdAt,
    updatedAt: resident.updatedAt,
  };
};

export const createResident = async (societyId, data) => {
  const flat = await prisma.flat.findFirst({
    where: {
      societyId,
      flatNumber: data.flatNumber,
      ...(data.wing ? { wing: data.wing } : {}),
    },
  });

  if (!flat) {
    return { notFound: true, message: `Flat "${data.flatNumber}" not found in this society` };
  }

  if (flat.status === "OCCUPIED") {
    return { conflict: true, message: `Flat "${data.flatNumber}" is already occupied` };
  }

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
    return { conflict: true, message: `User with ${field} ${existingUser[field]} already exists` };
  }

  if (!data.email) {
    return {
      conflict: true,
      message: "An email address is required to create a resident account and send the activation email",
    };
  }

  const nameParts = (data.name || "").split(" ");
  const firstName = nameParts[0] || data.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  // Create the Better Auth account (User + credential Account) so the
  // resident can later log in after setting their own password.
  const authUser = await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: generateTemporaryPassword(),
      firstName,
      lastName,
      phone: data.phone || null,
      role: "RESIDENT",
      societyId,
      isActive: data.status !== "INACTIVE",
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const resident = await tx.resident.create({
        data: {
          userId: authUser.user.id,
          societyId,
          flatId: flat.id,
          residentType: data.residentType || "Owner",
        },
        include: {
          user: { select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true, isActive: true } },
          flat: { select: { id: true, flatNumber: true, wing: true, status: true } },
        },
      });

      await tx.flat.update({
        where: { id: flat.id },
        data: { status: "OCCUPIED" },
      });

      return resident;
    });

    // Only send the invitation email after all database changes succeeded.
    let invitationSent = false;
    if (result.user.email) {
      try {
        await auth.api.requestPasswordReset({ body: { email: result.user.email } });
        invitationSent = true;
      } catch (error) {
        console.error(
          `Failed to initiate invitation for resident ${result.user.email}:`,
          error
        );
      }
    }

    return {
      id: result.id,
      name: result.user.name,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      phone: result.user.phone,
      email: result.user.email,
      flatId: result.flat.id,
      flatNumber: result.flat.flatNumber,
      wing: result.flat.wing,
      status: "OCCUPIED",
      residentType: result.residentType,
      isActive: result.user.isActive,
      moveInDate: result.createdAt ? result.createdAt.toISOString().split("T")[0] : "",
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      invitationSent,
    };
  } catch (error) {
    // Clean up the partially-created Better Auth account so we never
    // leave an orphaned authentication account behind.
    await prisma.user
      .delete({ where: { id: authUser.user.id } })
      .catch(() => {});
    throw error;
  }
};

export const updateResident = async (id, societyId, data) => {
  const existing = await prisma.resident.findUnique({
    where: { id },
    include: { user: { select: { id: true } }, flat: { select: { id: true, flatNumber: true } } },
  });

  if (!existing) return { notFound: true };
  if (existing.societyId !== societyId) return { forbidden: true };

  const updateData = {};

  if (data.name !== undefined || data.phone !== undefined || data.email !== undefined) {
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
  } else if (data.status !== undefined) {
    updateData.user = {
      update: { isActive: data.status !== "INACTIVE" },
    };
  }

  if (data.residentType !== undefined) {
    updateData.residentType = data.residentType;
  }

  if (data.flatNumber !== undefined) {
    const newFlat = await prisma.flat.findFirst({
      where: { societyId, flatNumber: data.flatNumber },
    });
    if (!newFlat) return { notFound: true, message: `Flat "${data.flatNumber}" not found` };

    updateData.flat = { connect: { id: newFlat.id } };

    await prisma.flat.update({
      where: { id: existing.flat.id },
      data: { status: "VACANT" },
    });
    await prisma.flat.update({
      where: { id: newFlat.id },
      data: { status: "OCCUPIED" },
    });
  }

  const resident = await prisma.resident.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, phone: true, email: true, isActive: true } },
      flat: { select: { id: true, flatNumber: true, wing: true, status: true } },
    },
  });

  return {
    id: resident.id,
    name: resident.user.name,
    firstName: resident.user.firstName,
    lastName: resident.user.lastName,
    phone: resident.user.phone,
    email: resident.user.email,
    flatId: resident.flat.id,
    flatNumber: resident.flat.flatNumber,
    wing: resident.flat.wing,
    status: resident.flat.status,
    residentType: resident.residentType,
    isActive: resident.user.isActive,
    moveInDate: resident.createdAt ? resident.createdAt.toISOString().split("T")[0] : "",
    createdAt: resident.createdAt,
    updatedAt: resident.updatedAt,
  };
};

export const deleteResident = async (id, societyId) => {
  const existing = await prisma.resident.findUnique({
    where: { id },
    include: { flat: { select: { id: true } } },
  });

  if (!existing) return { notFound: true };
  if (existing.societyId !== societyId) return { forbidden: true };

  await prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id: existing.userId } });
    await tx.flat.update({
      where: { id: existing.flat.id },
      data: { status: "VACANT" },
    });
  });

  return { deleted: true };
};

/**
 * Parses and validates every row of a resident Excel file.
 *
 * The authenticated Society Admin's society is the source of truth for
 * ownership; it is never taken from the file itself.
 *
 * Returns an array of rows in the shape:
 * { rowNumber, name, phone, email, flatNumber, residentType, valid, errors }
 */
const parseResidentExcelRows = async (filePath, societyId) => {
  const rows = readExcelRows(filePath);

  const result = [];
  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNumber = i + 2;

    const name = normalizeText(raw["Resident Name"]);
    const phone = normalizeText(raw["Phone Number"]);
    const email = normalizeText(raw["Email"]).toLowerCase();
    const flatNumber = normalizeText(raw["Flat Number"]);
    const residentType = normalizeText(raw["Resident Type"]);

    const errors = [];

    if (!name || !phone || !email || !flatNumber || !residentType) {
      errors.push(
        "Missing required fields (Resident Name, Phone Number, Email, Flat Number, Resident Type)"
      );
    }

    if (name && (name.length < 2 || name.length > 100)) {
      errors.push("Resident name must be 2-100 characters");
    }

    if (email && !isValidEmail(email)) {
      errors.push("Invalid email address");
    }

    if (phone && !isValidPhone(phone)) {
      errors.push("Invalid phone number");
    }

    if (residentType && !["Owner", "Tenant"].includes(residentType)) {
      errors.push(
        `Invalid Resident Type "${residentType}". Must be "Owner" or "Tenant".`
      );
    }

    if (errors.length === 0) {
      const flat = await prisma.flat.findFirst({
        where: { societyId, flatNumber },
      });

      if (!flat) {
        errors.push(`Flat "${flatNumber}" not found`);
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });

      if (existingUser) {
        const field = existingUser.phone === phone ? "phone" : "email";
        errors.push(`User with ${field} ${existingUser[field]} already exists`);
      }
    }

    result.push({
      rowNumber,
      name,
      phone,
      email,
      flatNumber,
      residentType,
      valid: errors.length === 0,
      errors,
    });
  }

  return result;
};

export const previewResidentsExcel = async (filePath, societyId) => {
  let rows;
  try {
    rows = await parseResidentExcelRows(filePath, societyId);
  } catch (error) {
    console.error("Failed to preview residents Excel:", error);
    throw new Error(
      "Could not read the Excel file. Please upload a valid .xlsx or .xls file."
    );
  } finally {
    removeUploadedFile(filePath);
  }

  const valid = rows.filter((row) => row.valid).length;

  return {
    total: rows.length,
    valid,
    invalid: rows.length - valid,
    rows,
  };
};

export const uploadResidentsFromExcel = async (filePath, societyId) => {
  let rows;
  try {
    rows = await parseResidentExcelRows(filePath, societyId);
  } catch (error) {
    console.error("Failed to import residents Excel:", error);
    throw new Error(
      "Could not read the Excel file. Please upload a valid .xlsx or .xls file."
    );
  } finally {
    removeUploadedFile(filePath);
  }

  let imported = 0;
  let failed = 0;
  let invited = 0;
  let invitationFailed = 0;
  const errors = [];

  for (const row of rows) {
    if (!row.valid) {
      failed++;
      errors.push({ row: row.rowNumber, message: row.errors.join("; ") });
      continue;
    }

    // Re-check duplicates at import time to stay safe even if the preview
    // ran a while ago or another admin imported in the meantime.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(row.phone ? [{ phone: row.phone }] : []),
          ...(row.email ? [{ email: row.email }] : []),
        ],
      },
    });

    if (existingUser) {
      failed++;
      const field = existingUser.phone === row.phone ? "phone" : "email";
      errors.push({
        row: row.rowNumber,
        message: `User with ${field} ${existingUser[field]} already exists`,
      });
      continue;
    }

    const flat = await prisma.flat.findFirst({
      where: { societyId, flatNumber: row.flatNumber },
    });

    if (!flat) {
      failed++;
      errors.push({ row: row.rowNumber, message: `Flat "${row.flatNumber}" not found` });
      continue;
    }

    const nameParts = row.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create the Better Auth account (User + credential Account) first,
    // then create the Resident and update the Flat in a transaction.
    let authUser;
    try {
      authUser = await auth.api.signUpEmail({
        body: {
          name: row.name,
          email: row.email,
          password: generateTemporaryPassword(),
          firstName,
          lastName,
          phone: row.phone || null,
          role: "RESIDENT",
          societyId,
          isActive: true,
        },
      });
    } catch (error) {
      failed++;
      errors.push({
        row: row.rowNumber,
        message: "Failed to create resident account",
      });
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.resident.create({
          data: {
            userId: authUser.user.id,
            societyId,
            flatId: flat.id,
            residentType: row.residentType,
          },
        });

        await tx.flat.update({
          where: { id: flat.id },
          data: { status: "OCCUPIED" },
        });
      });
    } catch (error) {
      // Clean up the partially-created Better Auth account for this row.
      await prisma.user
        .delete({ where: { id: authUser.user.id } })
        .catch(() => {});
      failed++;
      errors.push({
        row: row.rowNumber,
        message: "Failed to create resident",
      });
      continue;
    }

    imported++;

    // Send the invitation email only after this row fully succeeded.
    // A failed email must not fail the import.
    if (row.email) {
      try {
        await auth.api.requestPasswordReset({ body: { email: row.email } });
        invited++;
      } catch (error) {
        invitationFailed++;
        console.error(
          `Failed to initiate invitation for imported resident ${row.email}:`,
          error
        );
      }
    }
  }

  return {
    total: rows.length,
    imported,
    failed,
    invited,
    invitationFailed,
    errors,
  };
};
