import {
  registerSociety,
  getSocietyProfile,
  updateSocietyProfile,
} from "./society.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

import asyncHandler from "../../utils/asyncHandler.js";

export const registerSocietyHandler = asyncHandler(async (req, res) => {
  const result = await registerSociety(req.body);

  return successResponse(
    res,
    201,
    "Society registered successfully",
    result,
  );
});

export const getSocietyProfileHandler = asyncHandler(async (req, res) => {
  const society = await getSocietyProfile(req.user.societyId);

  if (!society) {
    return errorResponse(
      res,
      404,
      "Society not found"
    );
  }

  return successResponse(
    res,
    200,
    "Society profile fetched successfully",
    society
  );
});

export const updateSocietyProfileHandler = asyncHandler(async (req, res) => {
  const society = await updateSocietyProfile(req.user.societyId, req.body);

  return successResponse(
    res,
    200,
    "Society profile updated successfully",
    society
  );
});
