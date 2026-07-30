import prisma from "../../config/prisma.js";
import XLSX from "xlsx";
import fs from "fs";

export const uploadResidentsFromExcel = async (filePath, societyId) => {
  const workbook = XLSX.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet);

  let imported = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const residentName = String(row["Resident Name"] || "").trim();
    const phone = String(row["Phone Number"] || "").trim();
    const email = String(row["Email"] || "").trim();
    const flatNumber = String(row["Flat Number"] || "").trim();
    const residentType = String(row["Resident Type"] || "").trim();

    if (!residentName || !phone || !flatNumber || !residentType) {
      failed++;
      errors.push({
        row: rowNumber,
        message: "Missing required fields (Resident Name, Phone Number, Flat Number, Resident Type)",
      });
      continue;
    }

    if (!["Owner", "Tenant"].includes(residentType)) {
      failed++;
      errors.push({
        row: rowNumber,
        message: `Invalid Resident Type "${residentType}". Must be "Owner" or "Tenant".`,
      });
      continue;
    }

    const flat = await prisma.flat.findFirst({
      where: { societyId, flatNumber },
    });

    if (!flat) {
      failed++;
      errors.push({
        row: rowNumber,
        message: `Flat "${flatNumber}" not found`,
      });
      continue;
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
      failed++;
      const field = existingUser.phone === phone ? "phone" : "email";
      errors.push({
        row: rowNumber,
        message: `User with ${field} ${existingUser[field]} already exists`,
      });
      continue;
    }

    const nameParts = residentName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: residentName,
          firstName,
          lastName,
          phone: phone || null,
          email: email || null,
          role: "RESIDENT",
          societyId,
          isActive: true,
        },
      });

      await tx.resident.create({
        data: {
          userId: user.id,
          societyId,
          flatId: flat.id,
          residentType,
        },
      });

      await tx.flat.update({
        where: { id: flat.id },
        data: { status: "OCCUPIED" },
      });
    });

    imported++;
  }

  fs.unlinkSync(filePath);

  return { imported, failed, errors };
};
