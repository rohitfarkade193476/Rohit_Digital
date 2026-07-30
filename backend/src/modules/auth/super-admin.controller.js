import { registerSuperAdmin } from "./super-admin.service.js";

import {
  successResponse,
} from "../../utils/response.js";

import asyncHandler from "../../utils/asyncHandler.js";

export const registerSuperAdminHandler = asyncHandler(async (req, res) => {
  const user = await registerSuperAdmin(req.body);

  return successResponse(
    res,
    201,
    "Super admin registered successfully",
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  );
});
