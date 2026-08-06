import {
  createComplaint,
  listComplaints,
  getComplaintById,
  getComplaintHistory,
  reopenComplaint,
  changeComplaintStatus,
  markSatisfied,
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

export const getComplaintHistoryHandler = asyncHandler(async (req, res) => {
  const result = await getComplaintHistory(req.params.id, req.user);

  if (result.forbidden) return errorResponse(res, 403, "Forbidden");
  if (result.notFound) return errorResponse(res, 404, "Complaint not found");

  return successResponse(res, 200, "Complaint history fetched successfully", result);
});

export const reopenComplaintHandler = asyncHandler(async (req, res) => {
  const result = await reopenComplaint(req.params.id, req.user, {
    note: req.body.note,
  });

  if (result.forbidden) return errorResponse(res, 403, "Forbidden");
  if (result.notFound) return errorResponse(res, 404, "Complaint not found");
  if (result.invalidTransition) return errorResponse(res, 422, result.message);

  return successResponse(res, 200, "Complaint reopened successfully", result);
});

export const changeComplaintStatusHandler = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const result = await changeComplaintStatus(req.params.id, status, req.user.id, { note });

  if (result.forbidden) return errorResponse(res, 403, "Forbidden");
  if (result.notFound) return errorResponse(res, 404, "Complaint not found");
  if (result.invalidTransition) return errorResponse(res, 422, result.message);

  return successResponse(res, 200, "Complaint status updated successfully", result);
});

export const markSatisfiedHandler = asyncHandler(async (req, res) => {
  const result = await markSatisfied(req.params.id, req.user, {
    note: req.body.note,
  });

  if (result.forbidden) return errorResponse(res, 403, "Forbidden");
  if (result.notFound) return errorResponse(res, 404, "Complaint not found");
  if (result.invalidTransition) return errorResponse(res, 422, result.message);

  return successResponse(res, 200, "Satisfaction recorded successfully", result);
});
