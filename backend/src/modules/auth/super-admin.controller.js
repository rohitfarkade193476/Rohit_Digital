import { registerSuperAdmin } from "./super-admin.service.js";

export const registerSuperAdminHandler = async (req, res) => {
  try {
    const user = await registerSuperAdmin(req.body);

    return res.status(201).json({
      success: true,
      message: "Super admin registered successfully",
      data:{
   id:user.id,
   email:user.email,
   firstName:user.firstName,
   lastName:user.lastName,
   role:user.role
},
    });
  } catch (error) {
    if(error.code==="USER_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Super admin registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
