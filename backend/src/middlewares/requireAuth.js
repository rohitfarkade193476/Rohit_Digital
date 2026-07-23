import { auth } from "../lib/auth.js";

export const requireAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!session.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  }
  //  catch {
  //   return res.status(401).json({
  //     success: false,
  //     message: "Invalid or expired session",
  //   });
  // }
  catch (error) {
    console.error(error);
  }
};
