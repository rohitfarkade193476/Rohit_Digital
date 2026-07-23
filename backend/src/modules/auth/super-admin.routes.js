import { Router } from "express";
import { registerSuperAdminValidation } from "../../validators/auth/registerSuperAdmin.validator.js";
import { validate } from "../../middlewares/validate.js";
import { registerSuperAdminHandler } from "./super-admin.controller.js";

const router = Router();

router.post("/register", registerSuperAdminValidation, validate, registerSuperAdminHandler);

export default router;
