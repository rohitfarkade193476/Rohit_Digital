import { auth } from "../lib/auth.js";
import { errorResponse } from "../utils/response.js";
export const requireAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return errorResponse(
        res,
        401,
        "Authentication required"
      );
    }

    if (!session.user.isActive) {
      return errorResponse(
        res,
        403,
        "Account has been deactivated"
      );
    }

    req.user = session.user;
    req.session = session.session;
    next();
  }
   catch(error) {
    console.error("Authentication Error:", error);
    return errorResponse(
      res,
      401,
      "Invalid or expired session"
    );
  }
};
