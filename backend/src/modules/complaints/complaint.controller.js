import {
  createComplaint,
  listComplaints,
  getComplaintById,
} from "./complaint.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createComplaintHandler = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    data.imageUrl = `/uploads/complaints/${req.file.filename}`;
  }
  const result = await createComplaint(req.user, data);

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  if (result.notFound) {
    return errorResponse(res, 404, result.message);
  }

  return successResponse(res, 201, "Complaint created successfully", result);
});

export const getAllComplaintsHandler = asyncHandler(async (req, res) => {
  const { page, limit, status, category, priority } = req.query;
  const result = await listComplaints(req.user, {
    page,
    limit,
    status,
    category,
    priority,
  });

  if (result.forbidden) {
    return errorResponse(res, 403, "Forbidden");
  }

  return successResponse(res, 200, "Complaints fetched successfully", result);
});

export const getComplaintByIdHandler = asyncHandler(async (req, res) => {
  const complaint = await getComplaintById(req.params.id, req.user);

  if (!complaint) {
    return errorResponse(res, 404, "Complaint not found");
  }

  return successResponse(res, 200, "Complaint fetched successfully", complaint);
});
