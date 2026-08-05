import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  previewStaffExcel,
  importStaffExcel,
} from "./staff.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getAllStaffHandler = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await getAllStaff(req.user.societyId, { page, limit });

  return successResponse(res, 200, "Staff fetched successfully", result);
});

export const getStaffByIdHandler = asyncHandler(async (req, res) => {
  const staff = await getStaffById(req.params.id, req.user.societyId);

  if (!staff) {
    return errorResponse(res, 404, "Staff member not found");
  }

  return successResponse(res, 200, "Staff member fetched successfully", staff);
});

export const createStaffHandler = asyncHandler(async (req, res) => {
  const result = await createStaff(req.user.societyId, req.body);

  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  const message = result.invitationSent
    ? "Staff member created successfully and invitation email sent"
    : "Staff member created successfully but the invitation email could not be sent";

  return successResponse(res, 201, message, result);
});

export const updateStaffHandler = asyncHandler(async (req, res) => {
  const result = await updateStaff(req.params.id, req.user.societyId, req.body);

  if (result.notFound) {
    return errorResponse(res, 404, result.message || "Staff member not found");
  }

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  return successResponse(res, 200, "Staff member updated successfully", result);
});

export const deleteStaffHandler = asyncHandler(async (req, res) => {
  const result = await deleteStaff(req.params.id, req.user.societyId);

  if (result.notFound) {
    return errorResponse(res, 404, "Staff member not found");
  }

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  return successResponse(res, 200, "Staff member deleted successfully");
});

export const previewStaffExcelHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, "Please upload an Excel file");
  }

  try {
    const result = await previewStaffExcel(
      req.file.path,
      req.user.societyId
    );
    return successResponse(res, 200, "Staff Excel preview generated", result);
  } catch (error) {
    return errorResponse(res, 400, error.message || "Could not read the Excel file");
  }
});

export const importStaffExcelHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, "Please upload an Excel file");
  }

  try {
    const result = await importStaffExcel(
      req.file.path,
      req.user.societyId
    );
    return successResponse(res, 200, "Staff imported successfully", result);
  } catch (error) {
    return errorResponse(res, 400, error.message || "Could not read the Excel file");
  }
});
