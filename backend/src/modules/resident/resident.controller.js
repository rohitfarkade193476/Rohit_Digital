import {
  uploadResidentsFromExcel,
} from "./resident.service.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const uploadResidentsFromExcelHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, "Please upload an Excel file");
  }

  const result = await uploadResidentsFromExcel(
    req.file.path,
    req.user.societyId
  );

  return successResponse(
    res,
    200,
    "Residents uploaded successfully",
    result
  );
});
