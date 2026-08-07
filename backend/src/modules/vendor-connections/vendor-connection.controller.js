import {
  sendConnectionRequest,
  listSocietyConnections,
  listVendorConnections,
  listVendorPendingConnections,
  respondToConnection,
  removeConnection,
} from "./vendor-connection.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const sendConnectionRequestHandler = asyncHandler(async (req, res) => {
  const result = await sendConnectionRequest({
    vendorId: req.body.vendorId,
    adminUserId: req.user.id,
  });

  if (result.forbidden) {
    return errorResponse(res, 403, "Society admin account has no society");
  }
  if (result.notFound) {
    return errorResponse(res, 404, result.message);
  }
  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  return successResponse(
    res,
    201,
    "Connection request sent successfully",
    result,
  );
});

export const getSocietyConnectionsHandler = asyncHandler(async (req, res) => {
  const result = await listSocietyConnections(req.user.id);

  if (result.forbidden) {
    return errorResponse(res, 403, "Society admin account has no society");
  }

  return successResponse(
    res,
    200,
    "Society connections fetched successfully",
    result,
  );
});

export const removeConnectionHandler = asyncHandler(async (req, res) => {
  const result = await removeConnection({
    connectionId: req.params.id,
    adminUserId: req.user.id,
  });

  if (result.forbidden) {
    return errorResponse(res, 403, "Society admin account has no society");
  }
  if (result.notFound) {
    return errorResponse(res, 404, "Connection not found");
  }
  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  return successResponse(res, 200, result.message, result);
});

export const getVendorConnectionsHandler = asyncHandler(async (req, res) => {
  const result = await listVendorConnections(req.user.id);

  if (result.forbidden) {
    return errorResponse(res, 404, "Vendor profile not found");
  }

  return successResponse(
    res,
    200,
    "Vendor connections fetched successfully",
    result,
  );
});

export const getVendorPendingConnectionsHandler = asyncHandler(
  async (req, res) => {
    const result = await listVendorPendingConnections(req.user.id);

    if (result.forbidden) {
      return errorResponse(res, 404, "Vendor profile not found");
    }

    return successResponse(
      res,
      200,
      "Pending connection requests fetched successfully",
      result,
    );
  },
);

export const respondConnectionHandler = asyncHandler(async (req, res) => {
  const result = await respondToConnection({
    connectionId: req.params.id,
    userId: req.user.id,
    status: req.body.status,
  });

  if (result.forbidden) {
    return errorResponse(res, 404, "Vendor profile not found");
  }
  if (result.notFound) {
    return errorResponse(res, 404, "Connection request not found");
  }
  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  const verb = req.body.status === "ACCEPTED" ? "accepted" : "rejected";

  return successResponse(
    res,
    200,
    `Connection request ${verb} successfully`,
    result,
  );
});
