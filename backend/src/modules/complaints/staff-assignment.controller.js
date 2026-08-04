import { assignStaffToComplaint } from "./staff-assignment.service.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const assignStaffHandler = asyncHandler(async (req, res) => {
  const result = await assignStaffToComplaint(
    req.params.id,
    req.body.staffId,
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

  return successResponse(res, 201, "Staff member assigned to complaint successfully", result.assignment);
});
