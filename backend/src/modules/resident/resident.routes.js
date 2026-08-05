import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  getAllResidentsHandler,
  getResidentByIdHandler,
  createResidentHandler,
  updateResidentHandler,
  deleteResidentHandler,
  previewResidentsExcelHandler,
  uploadResidentsFromExcelHandler,
} from "./resident.controller.js";

import { uploadExcel } from "../../middlewares/upload.middleware.js";
const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getAllResidentsHandler,
);

router.post(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  createResidentHandler,
);

router.post(
  "/upload/preview",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  uploadExcel.single("file"),
  previewResidentsExcelHandler
);

router.post(
  "/upload",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  uploadExcel.single("file"),
  uploadResidentsFromExcelHandler
);

router.get(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getResidentByIdHandler,
);

router.put(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  updateResidentHandler,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  deleteResidentHandler,
);

export default router;
