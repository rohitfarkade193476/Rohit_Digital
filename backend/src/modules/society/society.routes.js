import { Router } from "express";
import { registerSocietyValidation } from "../../validators/society/registerSociety.validator.js";
import { validate } from "../../middlewares/validate.js";
import { registerSocietyHandler } from "./society.controller.js";

const router = Router();

router.post("/register", registerSocietyValidation, validate, registerSocietyHandler);

export default router;
