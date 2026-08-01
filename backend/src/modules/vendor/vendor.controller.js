import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getAllVendors,
  getVendorById,
} from "./vendor.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const registerVendorHandler = asyncHandler(async (req, res) => {
  const result = await registerVendor(req.body);

  if (result.conflict) {
    return errorResponse(res, 409, result.message);
  }

  const message = result.activationEmailSent
    ? "Vendor registered successfully. An activation email has been sent. Please check your inbox to set your password and activate your account."
    : "Vendor registered successfully but the activation email could not be sent. Please contact support.";

  return successResponse(res, 201, message, result);
});

export const getVendorProfileHandler = asyncHandler(async (req, res) => {
  const vendor = await getVendorProfile(req.user.id);

  if (!vendor) {
    return errorResponse(res, 404, "Vendor profile not found");
  }

  return successResponse(res, 200, "Vendor profile fetched successfully", vendor);
});

export const updateVendorProfileHandler = asyncHandler(async (req, res) => {
  const result = await updateVendorProfile(req.user.id, req.body);

  if (result.notFound) {
    return errorResponse(res, 404, "Vendor profile not found");
  }

  return successResponse(res, 200, "Vendor profile updated successfully", result);
});

export const getAllVendorsHandler = asyncHandler(async (req, res) => {
  const { page, limit, search, category, isAvailable } = req.query;
  const result = await getAllVendors({
    page,
    limit,
    search,
    category,
    isAvailable,
  });

  return successResponse(res, 200, "Vendors fetched successfully", result);
});

export const getVendorByIdHandler = asyncHandler(async (req, res) => {
  const vendor = await getVendorById(req.params.id);

  if (!vendor) {
    return errorResponse(res, 404, "Vendor not found");
  }

  return successResponse(res, 200, "Vendor fetched successfully", vendor);
});
