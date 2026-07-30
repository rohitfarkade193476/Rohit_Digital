import prisma from "../../config/prisma.js";
import XLSX from "xlsx";
import fs from "fs";
export const createFlat = async (societyId, data) => {
  const flat = await prisma.flat.create({
    data: {
      societyId,
      flatNumber: data.flatNumber,
      wing: data.wing || null,
      floor: data.floor,
      type: data.type,
      status: data.status || "VACANT",
    },
    select: {
      id: true,
      societyId: true,
      flatNumber: true,
      wing: true,
      floor: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return flat;
};

export const getAllFlats = async (societyId, { page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [flats, total] = await Promise.all([
    prisma.flat.findMany({
      where: { societyId },
      select: {
        id: true,
        societyId: true,
        flatNumber: true,
        wing: true,
        floor: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ wing: "asc" }, { floor: "asc" }, { flatNumber: "asc" }],
      skip,
      take: limitNum,
    }),
    prisma.flat.count({ where: { societyId } }),
  ]);

  return {
    flats,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getFlatById = async (id, societyId) => {
  const flat = await prisma.flat.findUnique({
    where: { id },
    select: {
      id: true,
      societyId: true,
      flatNumber: true,
      wing: true,
      floor: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!flat) return null;
  if (flat.societyId !== societyId) return null;

  return flat;
};

export const updateFlat = async (id, societyId, data) => {
  const existing = await prisma.flat.findUnique({
    where: { id },
    select: { id: true, societyId: true },
  });

  if (!existing) return { notFound: true };
  if (existing.societyId !== societyId) return { forbidden: true };

  const flat = await prisma.flat.update({
    where: { id },
    data: {
      ...(data.flatNumber !== undefined && { flatNumber: data.flatNumber }),
      ...(data.wing !== undefined && { wing: data.wing }),
      ...(data.floor !== undefined && { floor: data.floor }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
    },
    select: {
      id: true,
      societyId: true,
      flatNumber: true,
      wing: true,
      floor: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return flat;
};

export const deleteFlat = async (id, societyId) => {
  const existing = await prisma.flat.findUnique({
    where: { id },
    select: { id: true, societyId: true },
  });

  if (!existing) return { notFound: true };
  if (existing.societyId !== societyId) return { forbidden: true };

  await prisma.flat.delete({ where: { id } });

  return { deleted: true };
};


export const uploadFlatsFromExcel = async (filePath, societyId) => {
  const workbook = XLSX.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet);

  const flats = rows.map((row) => ({
    societyId,
    flatNumber: String(row["Flat Number"]).trim(),
    wing: String(row["Wing"]).trim(),
    floor: Number(row["Floor"]),
    type: row["Type"],
    status: row["Status"],
  }));

  const result = await prisma.flat.createMany({
    data: flats,
    skipDuplicates: true,
  });

  fs.unlinkSync(filePath);

  return result;
};