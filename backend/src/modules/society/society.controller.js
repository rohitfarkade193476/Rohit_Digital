import { registerSociety } from "./society.service.js";

export const registerSocietyHandler = async (req, res) => {
  try {
    const result = await registerSociety(req.body);

    return res.status(201).json({
      success: true,
      message: "Society registered successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please use another email.",
      });
    }

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      if (field === "registrationNumber") {
        return res.status(409).json({
          success: false,
          message: "A society with this registration number already exists.",
        });
    }

    if (field === "societyCode") {
    return res.status(409).json({
      success: false,
      message: "Society code already exists. Please try again.",
    });
  }

  return res.status(409).json({
    success: false,
    message: "Duplicate data found.",
  });
}

    console.error("Society registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
