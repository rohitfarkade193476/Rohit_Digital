import prisma from "../../config/prisma.js";
import { createNotification } from "../notifications/notification.service.js";
import { getSocietyAdminId } from "../complaints/complaint.service.js";

const ACTIVE_ASSIGNMENT_STATUSES = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];

const CONNECTION_INCLUDE = {
  vendor: {
    select: {
      id: true,
      companyName: true,
      category: true,
      contractType: true,
      city: true,
      state: true,
      isAvailable: true,
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
    },
  },
  society: {
    select: {
      id: true,
      name: true,
      societyCode: true,
      city: true,
      state: true,
      logo: true,
    },
  },
  requestedByUser: {
    select: { id: true, name: true },
  },
};

const mapConnection = (connection) => ({
  id: connection.id,
  vendorId: connection.vendorId,
  societyId: connection.societyId,
  status: connection.status,
  requestedBy: connection.requestedBy,
  requestedByUser: connection.requestedByUser
    ? { id: connection.requestedByUser.id, name: connection.requestedByUser.name }
    : null,
  requestedAt: connection.requestedAt,
  respondedAt: connection.respondedAt,
  removedAt: connection.removedAt,
  createdAt: connection.createdAt,
  updatedAt: connection.updatedAt,
  vendor: {
    id: connection.vendor.id,
    companyName: connection.vendor.companyName,
    category: connection.vendor.category,
    contractType: connection.vendor.contractType || "",
    city: connection.vendor.city || "",
    state: connection.vendor.state || "",
    isAvailable: connection.vendor.isAvailable,
    contactPerson: connection.vendor.user.name,
    phone: connection.vendor.user.phone,
    email: connection.vendor.user.email,
  },
  society: {
    id: connection.society.id,
    name: connection.society.name,
    societyCode: connection.society.societyCode,
    city: connection.society.city || "",
    state: connection.society.state || "",
    logo: connection.society.logo || null,
  },
});

const getAdminSocietyId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { societyId: true },
  });
  return user?.societyId || null;
};

const getVendorIdForUser = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return vendor?.id || null;
};

/**
 * Society Admin sends a connection request to a vendor on behalf of their
 * society. A vendor can hold only one live request per society: re-requesting
 * after a REJECTED or REMOVED connection re-activates the existing row.
 */
export const sendConnectionRequest = async ({ vendorId, adminUserId }) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, userId: true, companyName: true },
  });
  if (!vendor) return { notFound: true, message: "Vendor not found" };

  const existing = await prisma.vendorConnection.findFirst({
    where: { vendorId, societyId },
  });

  let connection;
  if (existing) {
    if (existing.status === "PENDING") {
      return {
        conflict: true,
        message: "A connection request to this vendor is already pending",
      };
    }
    if (existing.status === "ACCEPTED") {
      return {
        conflict: true,
        message: "This vendor is already connected to your society",
      };
    }

    connection = await prisma.vendorConnection.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        requestedBy: adminUserId,
        requestedAt: new Date(),
        respondedAt: null,
        removedAt: null,
      },
      include: CONNECTION_INCLUDE,
    });
  } else {
    connection = await prisma.vendorConnection.create({
      data: {
        vendorId,
        societyId,
        status: "PENDING",
        requestedBy: adminUserId,
      },
      include: CONNECTION_INCLUDE,
    });
  }

  // Best-effort notification to the vendor — a notification failure must
  // never fail the request itself.
  try {
    await createNotification({
      userId: vendor.userId,
      type: "VENDOR_CONNECTION_REQUEST",
      title: "New connection request",
      message: `${connection.society.name} wants to connect with your company`,
    });
  } catch (error) {
    console.error("Failed to notify vendor of connection request:", error);
  }

  return { connection: mapConnection(connection) };
};

export const listSocietyConnections = async (adminUserId) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const connections = await prisma.vendorConnection.findMany({
    where: { societyId },
    include: CONNECTION_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return { connections: connections.map(mapConnection) };
};

export const listVendorConnections = async (userId) => {
  const vendorId = await getVendorIdForUser(userId);
  if (!vendorId) return { forbidden: true };

  const connections = await prisma.vendorConnection.findMany({
    where: { vendorId },
    include: CONNECTION_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return { connections: connections.map(mapConnection) };
};

export const listVendorPendingConnections = async (userId) => {
  const vendorId = await getVendorIdForUser(userId);
  if (!vendorId) return { forbidden: true };

  const connections = await prisma.vendorConnection.findMany({
    where: { vendorId, status: "PENDING" },
    include: CONNECTION_INCLUDE,
    orderBy: { requestedAt: "desc" },
  });

  return { connections: connections.map(mapConnection) };
};

export const respondToConnection = async ({ connectionId, userId, status }) => {
  const vendorId = await getVendorIdForUser(userId);
  if (!vendorId) return { forbidden: true };

  const connection = await prisma.vendorConnection.findFirst({
    where: { id: connectionId, vendorId },
    select: {
      id: true,
      status: true,
      requestedBy: true,
      societyId: true,
      society: { select: { name: true } },
    },
  });
  if (!connection) return { notFound: true };

  if (connection.status !== "PENDING") {
    return {
      conflict: true,
      message: `This request has already been ${connection.status.toLowerCase()}`,
    };
  }

  const updated = await prisma.vendorConnection.update({
    where: { id: connection.id },
    data: { status, respondedAt: new Date() },
    include: CONNECTION_INCLUDE,
  });

  // Best-effort notification to the requesting admin.
  try {
    const adminId =
      connection.requestedBy || (await getSocietyAdminId(connection.societyId));
    if (adminId) {
      await createNotification({
        userId: adminId,
        type:
          status === "ACCEPTED"
            ? "VENDOR_CONNECTION_ACCEPTED"
            : "VENDOR_CONNECTION_REJECTED",
        title:
          status === "ACCEPTED"
            ? "Connection request accepted"
            : "Connection request rejected",
        message:
          status === "ACCEPTED"
            ? `${updated.vendor.companyName} accepted your connection request for ${connection.society.name}`
            : `${updated.vendor.companyName} declined your connection request for ${connection.society.name}`,
      });
    }
  } catch (error) {
    console.error("Failed to notify admin of connection response:", error);
  }

  return { connection: mapConnection(updated) };
};

export const removeConnection = async ({ connectionId, adminUserId }) => {
  const societyId = await getAdminSocietyId(adminUserId);
  if (!societyId) return { forbidden: true };

  const connection = await prisma.vendorConnection.findFirst({
    where: { id: connectionId, societyId },
    select: { id: true, status: true, vendorId: true },
  });
  if (!connection) return { notFound: true };

  if (connection.status !== "ACCEPTED") {
    return {
      conflict: true,
      message: "Only an accepted connection can be removed",
    };
  }

  const activeAssignment = await prisma.vendorAssignment.findFirst({
    where: {
      vendorId: connection.vendorId,
      societyId,
      status: { in: ACTIVE_ASSIGNMENT_STATUSES },
    },
    select: { id: true },
  });

  const updated = await prisma.vendorConnection.update({
    where: { id: connection.id },
    data: { status: "REMOVED", removedAt: new Date() },
    include: CONNECTION_INCLUDE,
  });

  // Best-effort notification to the vendor.
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: connection.vendorId },
      select: { userId: true },
    });
    if (vendor) {
      await createNotification({
        userId: vendor.userId,
        type: "VENDOR_CONNECTION_REMOVED",
        title: "Connection removed",
        message: `${updated.society.name} removed your connection`,
      });
    }
  } catch (error) {
    console.error("Failed to notify vendor of connection removal:", error);
  }

  return {
    connection: mapConnection(updated),
    hasActiveAssignments: Boolean(activeAssignment),
    message: activeAssignment
      ? "Vendor removed. Existing active assignments remain in progress."
      : "Vendor removed",
  };
};
