import { errorResponse } from "../utils/response.js";

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Authentication required"
      );
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "Insufficient permissions"
      );
    }

    next();
  };
};
