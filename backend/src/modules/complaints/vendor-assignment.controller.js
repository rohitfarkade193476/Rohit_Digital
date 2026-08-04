import {
  assignVendorToComplaint,
  getComplaintAssignments,
  listVendorAssignments,
  getVendorAssignmentById,
  updateVendorAssignmentStatus,
} from "./vendor-assignment.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ── Society Admin ──────────────────────────────────────────────────────────

export const assignVendorHandler = asyncHandler(async (req, res) => {
  const result = await assignVendorToComplaint(
    req.params.id,
    req.body.vendorId,
    req.user.id
  );

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  if (result.notFound) {
    return errorResponse(res, 404, result.message || "Complaint not found");
  }

  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  if (result.invalidTransition) {
    return errorResponse(res, 422, result.message);
  }

  return successResponse(res, 201, "Vendor assigned to complaint successfully", result.assignment);
});

export const getComplaintAssignmentsHandler = asyncHandler(async (req, res) => {
  const result = await getComplaintAssignments(
    req.params.id,
    req.user.id
  );

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  if (result.notFound) {
    return errorResponse(res, 404, "Complaint not found");
  }

  return successResponse(res, 200, "Assignments fetched successfully", result.assignments);
});

// ── Vendor self-service ────────────────────────────────────────────────────

export const listMyAssignmentsHandler = asyncHandler(async (req, res) => {
  const result = await listVendorAssignments(req.user.id);

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  return successResponse(res, 200, "Assignments fetched successfully", result.assignments);
});

export const getMyAssignmentHandler = asyncHandler(async (req, res) => {
  const result = await getVendorAssignmentById(req.user.id, req.params.id);

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  if (result.notFound) {
    return errorResponse(res, 404, "Assignment not found");
  }

  return successResponse(res, 200, "Assignment fetched successfully", result.assignment);
});

export const updateMyAssignmentStatusHandler = asyncHandler(async (req, res) => {
  const result = await updateVendorAssignmentStatus(
    req.user.id,
    req.params.id,
    req.body.status
  );

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  if (result.notFound) {
    return errorResponse(res, 404, "Assignment not found");
  }

  if (result.invalidTransition) {
    return errorResponse(res, 400, result.message);
  }

  return successResponse(res, 200, "Assignment status updated successfully", result.assignment);
});
