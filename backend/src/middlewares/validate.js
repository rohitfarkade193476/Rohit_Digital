import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mappedErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    return errorResponse(
      res,
      422,
      "Validation failed",
      mappedErrors
    );
  }
  next();
};
