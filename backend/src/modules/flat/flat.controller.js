import {
  createFlat,
  getAllFlats,
  getFlatById,
  updateFlat,
  deleteFlat,
} from "./flat.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import { uploadFlatsFromExcel } from "./flat.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createFlatHandler = asyncHandler(async (req, res) => {
  const flat = await createFlat(req.user.societyId, req.body);

  return successResponse(
    res,
    201,
    "Flat created successfully",
    flat,
  );
});

export const getAllFlatsHandler = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const flats = await getAllFlats(req.user.societyId, {
       page,
     limit, }
  );

  return successResponse(
    res,
    200,
    "Flats fetched successfully",
    flats,
  );
});

export const getFlatByIdHandler = asyncHandler(async (req, res) => {
  const flat = await getFlatById(req.params.id, req.user.societyId);

  if (!flat) {
    return errorResponse(
      res,
      404,
      "Flat not found"
    );
  }

  return successResponse(
    res,
    200,
    "Flat fetched successfully",
    flat,
  );
});

export const updateFlatHandler = asyncHandler(async (req, res) => {
  const result = await updateFlat(req.params.id, req.user.societyId, req.body);

  if (result.notFound) {
    return errorResponse(
      res,
      404,
      "Flat not found"
    );
  }

  if (result.forbidden) {
    return errorResponse(
      res,
      403,
      "Forbidden"
    );
  }

  return successResponse(
    res,
    200,
    "Flat updated successfully",
    result,
  );
});

export const deleteFlatHandler = asyncHandler(async (req, res) => {
  const result = await deleteFlat(req.params.id, req.user.societyId);

  if (result.notFound) {
    return errorResponse(
      res,
      404,
      "Flat not found"
    );
  }

  if (result.forbidden) {
    return errorResponse(
      res,
      403,
      "Forbidden"
    );
  }

  return successResponse(
    res,
    200,
    "Flat deleted successfully",
  );
});


export const uploadFlatsFromExcelHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, "Please upload an Excel file");
  }

  const result = await uploadFlatsFromExcel(
    req.file.path,
    req.user.societyId
  );

  return successResponse(
    res,
    200,
    "Flats uploaded successfully",
    result
  );
});