import { Router } from "express";
import { registerSocietyValidation } from "./validators/registerSociety.validator.js";
import { updateSocietyProfileValidation } from "./validators/updateSocietyProfile.validator.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  registerSocietyHandler,
  getSocietyProfileHandler,
  updateSocietyProfileHandler,
} from "./society.controller.js";

const router = Router();

router.post("/register", registerSocietyValidation, validate, registerSocietyHandler);

router.get(
  "/profile",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getSocietyProfileHandler
);

router.put(
  "/profile",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  updateSocietyProfileValidation,
  validate,
  updateSocietyProfileHandler
);

export default router;
