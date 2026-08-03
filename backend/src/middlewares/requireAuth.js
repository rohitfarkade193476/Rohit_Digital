import { auth } from "../lib/auth.js";
import prisma from "../config/prisma.js";
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

    // Re-fetch the user from the database so deactivation takes effect
    // immediately. Better Auth's cookie cache can otherwise keep serving
    // a stale (active) user object for up to its cache TTL.
    const freshUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isActive: true },
    });

    if (!freshUser) {
      return errorResponse(
        res,
        401,
        "Authentication required"
      );
    }

    if (!freshUser.isActive) {
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
