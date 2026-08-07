import path from "path";
import sharp from "sharp";

import prisma from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js";

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
  staffAssignments: {
    select: {
      id: true,
      status: true,
      assignedAt: true,
      acceptedAt: true,
      completedAt: true,
      cancelledAt: true,
      staff: {
        select: {
          id: true,
          role: true,
          department: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  statusHistory: {
    select: {
      id: true,
      status: true,
      note: true,
      resolutionImageUrl: true,
      createdAt: true,
      changedBy: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  },
};

const VALID_COMPLAINT_TRANSITIONS = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["ACCEPTED", "IN_PROGRESS", "OPEN"],
  ACCEPTED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["RESOLVED", "REOPENED", "OPEN"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["ASSIGNED", "IN_PROGRESS"],
};

const mapComplaint = (complaint) => {
  const resident = complaint.resident;
  const flat = resident?.flat;

  const activeAssignment = complaint.vendorAssignments?.find((a) =>
    ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(a.status)
  );

  const activeStaffAssignment = complaint.staffAssignments?.find((a) =>
    ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(a.status)
  );

  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description || "",
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    imageUrl: complaint.imageUrl || null,
    afterImageUrl: complaint.afterImageUrl || null,
    satisfiedAt: complaint.satisfiedAt || null,
    satisfactionNote: complaint.satisfactionNote || null,
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
    assignedStaff: activeStaffAssignment
      ? {
          id: activeStaffAssignment.staff.id,
          name: activeStaffAssignment.staff.user.name,
          role: activeStaffAssignment.staff.role,
          department: activeStaffAssignment.staff.department,
          status: activeStaffAssignment.status,
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
    staffAssignments: (complaint.staffAssignments || []).map((a) => ({
      id: a.id,
      status: a.status,
      assignedAt: a.assignedAt,
      acceptedAt: a.acceptedAt,
      completedAt: a.completedAt,
      cancelledAt: a.cancelledAt,
      staff: {
        id: a.staff.id,
        name: a.staff.user.name,
        role: a.staff.role,
        department: a.staff.department,
      },
    })),
    statusHistory: (complaint.statusHistory || []).map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note || null,
      resolutionImageUrl: h.resolutionImageUrl || null,
      createdAt: h.createdAt,
      changedBy: h.changedBy
        ? { id: h.changedBy.id, name: h.changedBy.name, role: h.changedBy.role }
        : null,
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

/**
 * Resolve the userId of the Society Admin responsible for a society.
 * Used to route "notify the admin" notifications without trusting any
 * userId coming from the request.
 */
export const getSocietyAdminId = async (societyId) => {
  const admin = await prisma.user.findFirst({
    where: { societyId, role: "SOCIETY_ADMIN" },
    select: { id: true },
  });
  return admin?.id || null;
};

const TITLE_SIMILARITY_THRESHOLD = 0.5;
const DESCRIPTION_SIMILARITY_THRESHOLD = 0.7;

const SIMILAR_CATEGORY_GROUPS = [["plumbing", "water supply"]];

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
  "have", "i", "in", "is", "it", "me", "my", "not", "of", "on", "or",
  "please", "that", "the", "there", "this", "to", "was", "with", "you",
]);

const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (text) =>
  normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));

const jaccardSimilarity = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter((token) => setB.has(token)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
};

const textSimilarityScore = (textA, textB) =>
  jaccardSimilarity(tokenize(textA), tokenize(textB));

const normalizeCategory = (category) => String(category || "").trim().toLowerCase();

const sameOrSimilarCategory = (categoryA, categoryB) => {
  const a = normalizeCategory(categoryA);
  const b = normalizeCategory(categoryB);
  if (!a || !b) return false;
  if (a === b) return true;
  return SIMILAR_CATEGORY_GROUPS.some((group) => group.includes(a) && group.includes(b));
};

const isTextuallySimilar = (candidate, existing) => {
  if (textSimilarityScore(candidate.title, existing.title) >= TITLE_SIMILARITY_THRESHOLD) {
    return true;
  }
  if (candidate.description && existing.description) {
    if (textSimilarityScore(candidate.description, existing.description) >= DESCRIPTION_SIMILARITY_THRESHOLD) {
      return true;
    }
  }
  return false;
};

/**
 * Heuristic duplicate check. A complaint is treated as a possible duplicate
 * when the same resident already has an open complaint (status NOT CLOSED)
 * with a same/similar category and a textually similar title or description.
 * CLOSED complaints never count as duplicates.
 */
export const isDuplicateComplaint = (candidate, existing) => {
  if (!existing) return false;
  if (existing.status === "CLOSED") return false;
  if (!sameOrSimilarCategory(candidate.category, existing.category)) return false;
  return isTextuallySimilar(candidate, existing);
};

// ── Image similarity (perceptual difference hash) ─────────────────────────
// Images are compared by a 64-bit dHash computed with sharp (already used for
// uploads). Files with different names but identical/similar pixels produce
// nearby hashes; the Hamming distance between them is the similarity signal.

const DHASH_WIDTH = 9;
const DHASH_HEIGHT = 8;
const IMAGE_HASH_HAMMING_THRESHOLD = 12; // out of 64 bits

const resolveImageFilePath = (imageUrl) =>
  path.resolve(process.cwd(), String(imageUrl).replace(/^\/+/, ""));

const computeDHash = (rawGrayBuffer) => {
  let bits = "";
  for (let y = 0; y < DHASH_HEIGHT; y++) {
    for (let x = 0; x < DHASH_HEIGHT; x++) {
      const left = rawGrayBuffer[y * DHASH_WIDTH + x];
      const right = rawGrayBuffer[y * DHASH_WIDTH + x + 1];
      bits += left > right ? "1" : "0";
    }
  }
  return BigInt(`0b${bits}`).toString(16).padStart(16, "0");
};

export const hashImageFile = async (imagePath) => {
  const rawGrayBuffer = await sharp(imagePath)
    .resize(DHASH_WIDTH, DHASH_HEIGHT, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer();
  return computeDHash(rawGrayBuffer);
};

const hammingDistance = (hashA, hashB) => {
  let xor = BigInt(`0x${hashA}`) ^ BigInt(`0x${hashB}`);
  let distance = 0;
  while (xor > 0n) {
    xor &= xor - 1n;
    distance += 1;
  }
  return distance;
};

export const imagesAreSimilar = (candidateHash, existingHash) =>
  Boolean(candidateHash) &&
  Boolean(existingHash) &&
  hammingDistance(candidateHash, existingHash) <= IMAGE_HASH_HAMMING_THRESHOLD;

const getImageHashFromUrl = async (imageUrl) => {
  if (!imageUrl) return null;
  try {
    return await hashImageFile(resolveImageFilePath(imageUrl));
  } catch (error) {
    console.error("Failed to hash existing complaint image:", error);
    return null;
  }
};

const findPotentialDuplicateComplaint = async (residentId, candidate) => {
  const existingComplaints = await prisma.complaint.findMany({
    where: { residentId, status: { not: "CLOSED" } },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      createdAt: true,
      imageUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });

  for (const existing of existingComplaints) {
    if (isDuplicateComplaint(candidate, existing)) return existing;
  }

  // Image-based duplicate: same resident + active + same/similar category and
  // a perceptually similar image. Hashes are computed on the fly from the
  // stored files (reuses the existing uploads/complaints storage).
  if (candidate.imageHash) {
    for (const existing of existingComplaints) {
      if (!existing.imageUrl) continue;
      if (!sameOrSimilarCategory(candidate.category, existing.category)) continue;
      const existingHash = await getImageHashFromUrl(existing.imageUrl);
      if (existingHash && imagesAreSimilar(candidate.imageHash, existingHash)) {
        return existing;
      }
    }
  }

  return null;
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

  let candidateImageHash = null;
  if (data.imagePath) {
    try {
      candidateImageHash = await hashImageFile(data.imagePath);
    } catch (error) {
      console.error("Failed to hash uploaded complaint image:", error);
    }
  }

  const duplicate = await findPotentialDuplicateComplaint(residentId, {
    title: data.title,
    description: data.description || null,
    category: data.category,
    imageHash: candidateImageHash,
  });

  if (duplicate) {
    return {
      duplicate: true,
      existingComplaint: {
        id: duplicate.id,
        title: duplicate.title,
        description: duplicate.description,
        category: duplicate.category,
        status: duplicate.status,
        createdAt: duplicate.createdAt,
        imageUrl: duplicate.imageUrl,
      },
    };
  }

  const complaint = await prisma.$transaction(async (tx) => {
    const c = await tx.complaint.create({
      data: {
        societyId,
        residentId,
        flatId,
        title: data.title,
        description: data.description || null,
        category: data.category,
        priority: data.priority || "MEDIUM",
        status: "OPEN",
        imageUrl: data.imageUrl || null,
      },
    });

    await tx.complaintStatusHistory.create({
      data: {
        complaintId: c.id,
        status: "OPEN",
        changedById: user.id,
        note: "Complaint created",
      },
    });

    return c;
  });

  const full = await prisma.complaint.findUnique({
    where: { id: complaint.id },
    include: COMPLAINT_INCLUDE,
  });

  // When a resident raises a complaint, notify the society admin. Best-effort
  // side effect — a notification failure must never fail complaint creation.
  if (user.role === "RESIDENT") {
    try {
      const adminId = await getSocietyAdminId(societyId);
      if (adminId) {
        await createNotification({
          userId: adminId,
          type: "COMPLAINT_CREATED",
          title: "New complaint raised",
          message: `"${data.title}" was raised by a resident in your society`,
          complaintId: complaint.id,
        });
      }
    } catch (error) {
      console.error("Failed to create complaint notification:", error);
    }
  }

  return mapComplaint(full);
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
  } else if (user.role === "STAFF") {
    // Staff may only view complaints assigned to them — never the whole
    // society's complaints. Existing authorization stays the source of truth.
    const staff = await prisma.staff.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!staff) return null;
    const assignment = await prisma.staffAssignment.findFirst({
      where: { complaintId: complaint.id, staffId: staff.id },
      select: { id: true },
    });
    if (!assignment) return null;
  } else {
    const societyId = await getSocietyIdForUser(user.id);
    if (complaint.societyId !== societyId) return null;
  }

  return mapComplaint(complaint);
};

/**
 * Record a complaint status change and update the complaint status atomically.
 * Used internally by vendor-assignment.service.js and the dedicated status-change endpoints.
 */
export const recordStatusChange = async (
  tx,
  complaintId,
  newStatus,
  userId,
  note,
  extraData = {}
) => {
  const complaint = await tx.complaint.findUnique({
    where: { id: complaintId },
    select: { status: true },
  });

  if (!complaint) return { notFound: true };

  const allowed = VALID_COMPLAINT_TRANSITIONS[complaint.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return {
      invalidTransition: true,
      message: `Cannot change complaint status from ${complaint.status} to ${newStatus}`,
    };
  }

  await tx.complaint.update({
    where: { id: complaintId },
    data: { status: newStatus, ...extraData },
  });

  await tx.complaintStatusHistory.create({
    data: {
      complaintId,
      status: newStatus,
      changedById: userId || null,
      note: note || null,
      // Keep the resolution evidence on the RESOLVED history entry so every
      // resolution attempt (across reopen cycles) stays visible.
      resolutionImageUrl: extraData.afterImageUrl || null,
    },
  });

  return { ok: true };
};

/**
 * Get the status-change history for a complaint.
 */
export const getComplaintHistory = async (complaintId, user) => {
  const societyId = await getSocietyIdForUser(user.id);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    select: { id: true, societyId: true, residentId: true },
  });

  if (!complaint) return { notFound: true };

  if (user.role === "RESIDENT") {
    const resident = await prisma.resident.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!resident || complaint.residentId !== resident.id) return { notFound: true };
  } else if (complaint.societyId !== societyId) {
    return { notFound: true };
  }

  const history = await prisma.complaintStatusHistory.findMany({
    where: { complaintId },
    select: {
      id: true,
      status: true,
      note: true,
      resolutionImageUrl: true,
      createdAt: true,
      changedBy: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    history: history.map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note || null,
      resolutionImageUrl: h.resolutionImageUrl || null,
      createdAt: h.createdAt,
      changedBy: h.changedBy
        ? { id: h.changedBy.id, name: h.changedBy.name, role: h.changedBy.role }
        : null,
    })),
  };
};

/**
 * Resident records satisfaction with a resolved/closed complaint. Confirming
 * satisfaction closes the complaint in the same step. Idempotent — recording
 * twice returns the current complaint unchanged.
 */
export const markSatisfied = async (complaintId, user, { note } = {}) => {
  const societyId = await getSocietyIdForUser(user.id);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: {
      id: true,
      title: true,
      residentId: true,
      status: true,
      societyId: true,
      satisfiedAt: true,
    },
  });

  if (!complaint) return { notFound: true };

  if (user.role === "RESIDENT") {
    const resident = await prisma.resident.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!resident || complaint.residentId !== resident.id) return { notFound: true };
  }

  if (!["RESOLVED", "CLOSED"].includes(complaint.status)) {
    return {
      invalidTransition: true,
      message: `Satisfaction can only be recorded after the complaint is resolved (current: ${complaint.status})`,
    };
  }

  if (complaint.satisfiedAt) {
    const existing = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: COMPLAINT_INCLUDE,
    });
    return mapComplaint(existing);
  }

  await prisma.$transaction(async (tx) => {
    // Auto-close: RESOLVED → CLOSED in the same step. When the complaint is
    // already CLOSED (e.g. closed by the admin first), keep the status and
    // avoid adding a duplicate CLOSED entry to the status history.
    const transitioningToClosed = complaint.status === "RESOLVED";

    await tx.complaint.update({
      where: { id: complaintId },
      data: {
        ...(transitioningToClosed ? { status: "CLOSED" } : {}),
        satisfiedAt: new Date(),
        satisfactionNote: note || null,
      },
    });

    if (transitioningToClosed) {
      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          status: "CLOSED",
          changedById: user.id,
          note: note || "Resident confirmed they are satisfied with the resolution",
        },
      });
    }
  });

  const full = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: COMPLAINT_INCLUDE,
  });

  // Notify the society admin that the complaint was closed after the resident
  // confirmed satisfaction. Best-effort side effect — a notification failure
  // must never fail the satisfaction recording itself.
  try {
    const adminId = await getSocietyAdminId(complaint.societyId);
    if (adminId) {
      await createNotification({
        userId: adminId,
        type: "COMPLAINT_SATISFIED",
        title: "Resident satisfied",
        message: `The resident is satisfied with "${full.title}" — the complaint has been closed`,
        complaintId,
      });
    }
  } catch (error) {
    console.error("Failed to create satisfaction notification:", error);
  }

  return mapComplaint(full);
};

/**
 * Resident reopens a resolved/closed complaint.
 */
export const reopenComplaint = async (complaintId, user, { note } = {}) => {
  const societyId = await getSocietyIdForUser(user.id);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true, residentId: true, status: true, societyId: true },
  });

  if (!complaint) return { notFound: true };

  if (user.role === "RESIDENT") {
    const resident = await prisma.resident.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!resident || complaint.residentId !== resident.id) return { notFound: true };
  }

  const allowed = VALID_COMPLAINT_TRANSITIONS[complaint.status];
  if (!allowed || !allowed.includes("REOPENED")) {
    return {
      invalidTransition: true,
      message: `Cannot reopen a complaint in ${complaint.status} status`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.complaint.update({
      where: { id: complaintId },
      data: { status: "REOPENED" },
    });

    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status: "REOPENED",
        changedById: user.id,
        note: note || "Complaint reopened by resident",
      },
    });
  });

  const full = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: COMPLAINT_INCLUDE,
  });

  // Notify the society admin that a resident reopened the complaint.
  // Best-effort side effect — a notification failure must never fail reopen.
  try {
    const adminId = await getSocietyAdminId(complaint.societyId);
    if (adminId) {
      await createNotification({
        userId: adminId,
        type: "COMPLAINT_REOPENED",
        title: "Complaint reopened",
        message: `"${full.title}" was reopened by the resident`,
        complaintId,
      });
    }

    // Notify the staff/vendor currently assigned to the complaint so they can
    // follow up. Best-effort side effect, same as the admin notification.
    const [vendorAssignees, staffAssignees] = await Promise.all([
      prisma.vendorAssignment.findMany({
        where: {
          complaintId,
          status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
        },
        select: { vendor: { select: { userId: true } } },
      }),
      prisma.staffAssignment.findMany({
        where: {
          complaintId,
          status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
        },
        select: { staff: { select: { userId: true } } },
      }),
    ]);

    const assigneeIds = [
      ...vendorAssignees.map((a) => a.vendor.userId),
      ...staffAssignees.map((a) => a.staff.userId),
    ];

    for (const userId of assigneeIds) {
      await createNotification({
        userId,
        type: "COMPLAINT_REOPENED",
        title: "Complaint reopened",
        message: `Complaint "${full.title}" was reopened by the resident — please follow up`,
        complaintId,
      });
    }
  } catch (error) {
    console.error("Failed to create complaint reopened notification:", error);
  }

  return mapComplaint(full);
};

/**
 * Society Admin changes complaint status directly (e.g. RESOLVED → CLOSED).
 */
export const changeComplaintStatus = async (
  complaintId,
  newStatus,
  adminUserId,
  { note } = {}
) => {
  const societyId = await getSocietyIdForUser(adminUserId);
  if (!societyId) return { forbidden: true };

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId },
    select: { id: true, status: true, residentId: true, satisfiedAt: true },
  });

  if (!complaint) return { notFound: true };

  const result = await prisma.$transaction(async (tx) => {
    const r = await recordStatusChange(tx, complaintId, newStatus, adminUserId, note);
    return r;
  });

  if (result.invalidTransition) return result;

  const full = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: COMPLAINT_INCLUDE,
  });

  // Notify the resident when their complaint is closed. Best-effort side
  // effect — a notification failure must never fail the status change.
  if (newStatus === "CLOSED" && full?.residentId) {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: full.residentId },
        select: { userId: true },
      });
      if (resident?.userId) {
        await createNotification({
          userId: resident.userId,
          type: "COMPLAINT_CLOSED",
          title: "Complaint closed",
          message: `Your complaint "${full.title}" has been closed`,
          complaintId,
        });
      }
    } catch (error) {
      console.error("Failed to create complaint closed notification:", error);
    }
  }

  return mapComplaint(full);
};
