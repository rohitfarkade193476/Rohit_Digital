import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { societyQueryValidation } from "./validators/societyQuery.validator.js";
import { updateSocietyStatusValidation } from "./validators/updateSocietyStatus.validator.js";
import { userQueryValidation } from "./validators/userQuery.validator.js";
import { updateUserStatusValidation } from "./validators/updateUserStatus.validator.js";
import { reportsQueryValidation } from "./validators/reportsQuery.validator.js";
import {
  getDashboardStatsHandler,
  getSocietiesHandler,
  getSocietyByIdHandler,
  updateSocietyStatusHandler,
  getUsersHandler,
  updateUserStatusHandler,
  getReportsOverviewHandler,
} from "./super-admin.controller.js";

const router = Router();

// Every route in this router is restricted to authenticated super admins.
router.use(requireAuth, requireRole("SUPER_ADMIN"));

router.get("/dashboard/stats", getDashboardStatsHandler);

router.get("/societies", societyQueryValidation, validate, getSocietiesHandler);
router.get("/societies/:id", getSocietyByIdHandler);
router.patch(
  "/societies/:id/status",
  updateSocietyStatusValidation,
  validate,
  updateSocietyStatusHandler
);

router.get("/users", userQueryValidation, validate, getUsersHandler);
router.patch(
  "/users/:id/status",
  updateUserStatusValidation,
  validate,
  updateUserStatusHandler
);

router.get("/reports/overview", reportsQueryValidation, validate, getReportsOverviewHandler);

export default router;
