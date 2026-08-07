import {
  assignStaffToComplaint,
  listStaffAssignments,
  getStaffAssignmentById,
  updateStaffAssignmentStatus,
} from "./staff-assignment.service.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ── Society Admin ─────────────────────────────────────────────────────────────

export const assignStaffHandler = asyncHandler(async (req, res) => {
  const result = await assignStaffToComplaint(
    req.params.id,
    req.body.staffId,
    req.user.id,
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

  return successResponse(
    res,
    201,
    "Staff member assigned to complaint successfully",
    result.assignment,
  );
});

// ── Staff self-service ────────────────────────────────────────────────────────

export const listMyStaffAssignmentsHandler = asyncHandler(
  async (req, res) => {
    const result = await listStaffAssignments(req.user.id);

    if (result.forbidden) {
      return errorResponse(res, 403, "Forbidden");
    }

    return successResponse(
      res,
      200,
      "Assignments fetched successfully",
      result.assignments,
    );
  },
);

export const getMyStaffAssignmentHandler = asyncHandler(async (req, res) => {
  const result = await getStaffAssignmentById(req.user.id, req.params.id);

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  if (result.notFound) {
    return errorResponse(res, 404, "Assignment not found");
  }

  return successResponse(
    res,
    200,
    "Assignment fetched successfully",
    result.assignment,
  );
});

export const updateMyStaffAssignmentStatusHandler = asyncHandler(
  async (req, res) => {
    // Image uploaded by the complaintUpload middleware (field name: afterImage).
    // Mirrors the exact same pattern used in vendor-assignment.controller.js.
    const afterImageUrl = req.file
      ? `/uploads/complaints/${req.file.filename}`
      : req.body.afterImageUrl || null;

    const result = await updateStaffAssignmentStatus(
      req.user.id,
      req.params.id,
      req.body.status,
      { afterImageUrl },
    );

    if (result.forbidden) {
      return errorResponse(res, 403, "Forbidden");
    }

    if (result.notFound) {
      return errorResponse(res, 404, "Assignment not found");
    }

    if (result.validationError) {
      return errorResponse(res, 422, result.message);
    }

    if (result.invalidTransition) {
      return errorResponse(res, 400, result.message);
    }

    return successResponse(
      res,
      200,
      "Assignment status updated successfully",
      result.assignment,
    );
  },
);
