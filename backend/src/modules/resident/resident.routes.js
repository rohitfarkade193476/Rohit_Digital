import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  uploadResidentsFromExcelHandler,
} from "./resident.controller.js";

import { uploadExcel } from "../../middlewares/upload.middleware.js";
const router = Router();

router.post(
  "/upload",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  uploadExcel.single("file"),
  uploadResidentsFromExcelHandler
);

export default router;
