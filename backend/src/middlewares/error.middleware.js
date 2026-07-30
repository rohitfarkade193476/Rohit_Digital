import { errorResponse } from "../utils/response.js";

const PRISMA_FIELD_MESSAGES = {
  registrationNumber:
    "A society with this registration number already exists.",
  societyCode: "Society code already exists. Please try again.",
  contactEmail: "A society with this contact email already exists.",
  contactPhone: "A society with this contact phone number already exists.",
  email: "An account with this email already exists. Please use another email.",
};

const AUTH_ERROR_MAP = {
  USER_ALREADY_EXISTS:
    "An account with this email already exists. Please use another email.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "An account with this email already exists. Please use another email.",

  PHONE_ALREADY_EXISTS:
    "An account with this phone number already exists. Please use another phone number.",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
};

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const code = err.code || err.body?.code;

  console.log("Middleware received code:", code);
  console.log("Error object:", err);
  // Prisma errors
  if (["P2002", "P2025"].includes(code))  {
    if (code === "P2002") {
      const field = err.meta?.target?.[0];
      const message = PRISMA_FIELD_MESSAGES[field] || "Duplicate data found.";
      return errorResponse(res, 409, message);
    }

    if (code === "P2025") {
      return errorResponse(res, 404, "Record not found");
    }

    return errorResponse(res, 500, "Internal server error");
  }

  // Better Auth errors
  if (AUTH_ERROR_MAP[code]) {
    return errorResponse(res, 409, AUTH_ERROR_MAP[code]);
  }

  // Default
  return errorResponse(res, 500, "Internal server error");
};

export default errorHandler;
