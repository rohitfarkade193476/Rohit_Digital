import { Router } from "express";
import { createFlatValidation } from "./validators/createFlat.validator.js";
import { updateFlatValidation } from "./validators/updateFlat.validator.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  createFlatHandler,
  getAllFlatsHandler,
  getFlatByIdHandler,
  updateFlatHandler,
  deleteFlatHandler,
  uploadFlatsFromExcelHandler,
} from "./flat.controller.js";

import { uploadExcel } from "../../middlewares/upload.middleware.js";
const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  createFlatValidation,
  validate,
  createFlatHandler,
);

router.get(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getAllFlatsHandler,
);

router.post(
  "/upload",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  uploadExcel.single("file"),
  uploadFlatsFromExcelHandler
);

router.get(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getFlatByIdHandler,
);

router.put(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  updateFlatValidation,
  validate,
  updateFlatHandler,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  deleteFlatHandler,
);

export default router;
