import {
  getAllResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  uploadResidentsFromExcel,
} from "./resident.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getAllResidentsHandler = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await getAllResidents(req.user.societyId, { page, limit });

  return successResponse(res, 200, "Residents fetched successfully", result);
});

export const getResidentByIdHandler = asyncHandler(async (req, res) => {
  const resident = await getResidentById(req.params.id, req.user.societyId);

  if (!resident) {
    return errorResponse(res, 404, "Resident not found");
  }

  return successResponse(res, 200, "Resident fetched successfully", resident);
});

export const createResidentHandler = asyncHandler(async (req, res) => {
  const result = await createResident(req.user.societyId, req.body);

  if (result.notFound) {
    return errorResponse(res, 404, result.message);
  }

  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  return successResponse(res, 201, "Resident created successfully", result);
});

export const updateResidentHandler = asyncHandler(async (req, res) => {
  const result = await updateResident(req.params.id, req.user.societyId, req.body);

  if (result.notFound) {
    return errorResponse(res, 404, result.message || "Resident not found");
  }

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  return successResponse(res, 200, "Resident updated successfully", result);
});

export const deleteResidentHandler = asyncHandler(async (req, res) => {
  const result = await deleteResident(req.params.id, req.user.societyId);

  if (result.notFound) {
    return errorResponse(res, 404, "Resident not found");
  }

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  return successResponse(res, 200, "Resident deleted successfully");
});

export const uploadResidentsFromExcelHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, "Please upload an Excel file");
  }

  const result = await uploadResidentsFromExcel(
    req.file.path,
    req.user.societyId
  );

  return successResponse(
    res,
    200,
    "Residents uploaded successfully",
    result
  );
});
