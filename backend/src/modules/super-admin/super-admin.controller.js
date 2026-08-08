import {
  getDashboardStats,
  getSocieties,
  getSocietyById,
  updateSocietyStatus,
  getUsers,
  updateUserStatus,
  getReportsOverview,
} from "./super-admin.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

import asyncHandler from "../../utils/asyncHandler.js";

const parsePagination = (req) => ({
  page: Number(req.query.page) || 1,
  limit: Number(req.query.limit) || 10,
});

export const getDashboardStatsHandler = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();

  return successResponse(
    res,
    200,
    "Dashboard stats fetched successfully",
    stats
  );
});

export const getSocietiesHandler = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const { page, limit } = parsePagination(req);

  const result = await getSocieties({ search, status, page, limit });

  return successResponse(
    res,
    200,
    "Societies fetched successfully",
    result
  );
});

export const getSocietyByIdHandler = asyncHandler(async (req, res) => {
  const society = await getSocietyById(req.params.id);

  if (!society) {
    return errorResponse(res, 404, "Society not found");
  }

  return successResponse(
    res,
    200,
    "Society fetched successfully",
    society
  );
});

export const updateSocietyStatusHandler = asyncHandler(async (req, res) => {
  const society = await updateSocietyStatus(req.params.id, req.body.status);

  if (!society) {
    return errorResponse(res, 404, "Society not found");
  }

  return successResponse(
    res,
    200,
    "Society status updated successfully",
    society
  );
});

export const getUsersHandler = asyncHandler(async (req, res) => {
  const { role, societyId, search } = req.query;
  const { page, limit } = parsePagination(req);

  const result = await getUsers({ role, societyId, search, page, limit });

  return successResponse(
    res,
    200,
    "Users fetched successfully",
    result
  );
});

export const updateUserStatusHandler = asyncHandler(async (req, res) => {
  const user = await updateUserStatus({
    id: req.params.id,
    isActive: req.body.isActive,
    actorId: req.user.id,
  });

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  return successResponse(
    res,
    200,
    "User status updated successfully",
    user
  );
});

export const getReportsOverviewHandler = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const report = await getReportsOverview({ from, to });

  return successResponse(
    res,
    200,
    "Reports fetched successfully",
    report
  );
});
