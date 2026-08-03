import { body } from "express-validator";

export const updateVendorValidation = [
  body("companyName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be 2-150 characters"),

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2-50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2-50 characters"),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category must be at most 100 characters"),

  body("contractType")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contract type must be at most 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address must be at most 200 characters"),

  body("city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City must be at most 50 characters"),

  body("state")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("State must be at most 50 characters"),

  body("pincode")
    .optional()
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Invalid pincode"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),
];
