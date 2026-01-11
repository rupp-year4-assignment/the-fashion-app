import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

const validationMiddleware = {
  // register validation
  register: [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),

    body("gender")
      .optional()
      .isIn(["male", "female", "not_specified"])
      .withMessage("Gender must be male, female, or not_specified"),

    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be user or admin"),
  ],
  // login validation
  login: [
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  OTP_ctr_sendMailVerificationCode: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
  ],
  OTP_ctr_verifyCode: [
    body("code")
      .trim()
      .notEmpty()
      .withMessage("Verification code is required")
      .isString()
      .withMessage("Verification code must be a string"),
  ],
  // wishlist validation
  addWishlists: [
    body("productId")
      .trim()
      .notEmpty()
      .withMessage("productId is required")
      .isMongoId()
      .withMessage("Invalid productId"),
    body("variantId")
      .trim()
      .notEmpty()
      .withMessage("variantId is required")
      .isMongoId()
      .withMessage("Invalid variantId"),
  ],
  removeWishlists: [
    param("productId")
      .trim()
      .notEmpty()
      .withMessage("productId is required")
      .isMongoId()
      .withMessage("Invalid productId"),
  ],
  // profile validation
  updateProfile: [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("gender")
      .optional()
      .isIn(["male", "female", "not_specified"])
      .withMessage("Gender must be male, female, or not_specified"),
  ],
};

export const ValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    res.status(400).send({
      message: "Validation failed",
      errors: errorArray,
    });
    return;
  }
  next();
};

export default validationMiddleware;
