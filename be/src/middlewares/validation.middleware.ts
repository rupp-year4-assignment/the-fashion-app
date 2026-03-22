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

    body("emailVerificationToken")
      .trim()
      .notEmpty()
      .withMessage("Email verification token is required")
      .isUUID()
      .withMessage("Email verification token is invalid"),

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
  updateProfile: [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 0, max: 80 })
      .withMessage("Last name must be at most 80 characters"),
    body("gender")
      .optional()
      .isIn(["male", "female", "not_specified"])
      .withMessage("Gender must be male, female, or not_specified"),
    body("phoneNumber")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (typeof value !== "string") return false;
        const normalized = value.trim();
        if (normalized.length === 0) return true;
        return /^[+0-9 ()-]{7,20}$/.test(normalized);
      })
      .withMessage("phoneNumber is invalid"),
    body("dateOfBirth")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (typeof value !== "string") return false;
        const normalized = value.trim();
        if (!normalized) return true;
        return !Number.isNaN(new Date(normalized).getTime());
      })
      .withMessage("dateOfBirth must be a valid date string"),
    body()
      .custom((value: any) => {
        if (!value || typeof value !== "object") return false;
        return (
          value.firstName !== undefined ||
          value.lastName !== undefined ||
          value.gender !== undefined ||
          value.phoneNumber !== undefined ||
          value.dateOfBirth !== undefined
        );
      })
      .withMessage("At least one profile field is required"),
  ],
  OTP_ctr_sendMailVerificationCode: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("purpose")
      .optional()
      .isIn(["register", "password_reset"])
      .withMessage("purpose must be register or password_reset"),
  ],
  OTP_ctr_verifyCode: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("code")
      .trim()
      .notEmpty()
      .withMessage("Verification code is required")
      .isString()
      .withMessage("Verification code must be a string")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
    body("purpose")
      .optional()
      .isIn(["register", "password_reset"])
      .withMessage("purpose must be register or password_reset"),
  ],
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
    body("productId")
      .trim()
      .notEmpty()
      .withMessage("productId is required")
      .isMongoId()
      .withMessage("Invalid productId"),
  ],
  addPaymentCard: [
    body("holderName")
      .trim()
      .notEmpty()
      .withMessage("holderName is required")
      .isLength({ min: 2, max: 120 })
      .withMessage("holderName must be between 2 and 120 characters"),
    body("cardNumber")
      .trim()
      .notEmpty()
      .withMessage("cardNumber is required")
      .isLength({ min: 13, max: 30 })
      .withMessage("cardNumber is invalid"),
    body("expiryMonth")
      .notEmpty()
      .withMessage("expiryMonth is required")
      .isInt({ min: 1, max: 12 })
      .withMessage("expiryMonth must be between 1 and 12"),
    body("expiryYear")
      .notEmpty()
      .withMessage("expiryYear is required")
      .isInt({ min: 0, max: 9999 })
      .withMessage("expiryYear is invalid"),
    body("cvv")
      .trim()
      .notEmpty()
      .withMessage("cvv is required")
      .isLength({ min: 3, max: 4 })
      .withMessage("cvv is invalid"),
    body("network")
      .optional()
      .isIn(["VISA", "MASTERCARD", "UNIONPAY"])
      .withMessage("network must be VISA, MASTERCARD, or UNIONPAY"),
  ],
  removePaymentCard: [
    param("cardId")
      .trim()
      .notEmpty()
      .withMessage("cardId is required")
      .isMongoId()
      .withMessage("Invalid cardId"),
  ],
  addAddress: [
    body("addressType")
      .optional()
      .equals("USER_DELIVERY")
      .withMessage("addressType must be USER_DELIVERY for user address book"),
    body("label")
      .optional()
      .isString()
      .withMessage("label must be a string")
      .isLength({ min: 1, max: 60 })
      .withMessage("label must be between 1 and 60 characters"),
    body("street")
      .trim()
      .notEmpty()
      .withMessage("street is required")
      .isLength({ min: 2, max: 160 })
      .withMessage("street must be between 2 and 160 characters"),
    body("city")
      .trim()
      .notEmpty()
      .withMessage("city is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("city must be between 2 and 80 characters"),
    body("state")
      .trim()
      .notEmpty()
      .withMessage("state is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("state must be between 2 and 80 characters"),
    body("postalCode")
      .trim()
      .notEmpty()
      .withMessage("postalCode is required")
      .isLength({ min: 2, max: 20 })
      .withMessage("postalCode is invalid"),
    body("country")
      .trim()
      .notEmpty()
      .withMessage("country is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("country is invalid"),
    body("location")
      .isObject()
      .withMessage("location is required and must be an object"),
    body("location.type")
      .optional()
      .isString()
      .withMessage("location.type must be a string")
      .custom((value) => value.toString().toUpperCase() === "POINT")
      .withMessage("location.type must be Point"),
    body("location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("location.coordinates must be [longitude, latitude]"),
    body("location.coordinates.*")
      .isFloat()
      .withMessage("location coordinates must be numbers"),
    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be boolean"),
  ],
  updateAddress: [
    param("addressId")
      .trim()
      .notEmpty()
      .withMessage("addressId is required"),
    body("addressType")
      .optional()
      .equals("USER_DELIVERY")
      .withMessage("addressType must be USER_DELIVERY for user address book"),
    body("label")
      .optional()
      .isString()
      .withMessage("label must be a string")
      .isLength({ min: 1, max: 60 })
      .withMessage("label must be between 1 and 60 characters"),
    body("street")
      .optional()
      .trim()
      .isLength({ min: 2, max: 160 })
      .withMessage("street must be between 2 and 160 characters"),
    body("city")
      .optional()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("city must be between 2 and 80 characters"),
    body("state")
      .optional()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("state must be between 2 and 80 characters"),
    body("postalCode")
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage("postalCode is invalid"),
    body("country")
      .optional()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("country is invalid"),
    body("location")
      .optional()
      .isObject()
      .withMessage("location must be an object"),
    body("location.type")
      .optional()
      .isString()
      .withMessage("location.type must be a string")
      .custom((value) => value.toString().toUpperCase() === "POINT")
      .withMessage("location.type must be Point"),
    body("location.coordinates")
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage("location.coordinates must be [longitude, latitude]"),
    body("location.coordinates.*")
      .optional()
      .isFloat()
      .withMessage("location coordinates must be numbers"),
    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be boolean"),
    body()
      .custom((value: any) => {
        if (!value || typeof value !== "object") return false;
        return (
          value.label != null ||
          value.addressType != null ||
          value.street != null ||
          value.city != null ||
          value.state != null ||
          value.postalCode != null ||
          value.country != null ||
          value.location != null ||
          value.isDefault != null
        );
      })
      .withMessage("At least one address field is required for update"),
  ],
  removeAddress: [
    param("addressId")
      .trim()
      .notEmpty()
      .withMessage("addressId is required"),
  ],
  setDefaultAddress: [
    param("addressId")
      .trim()
      .notEmpty()
      .withMessage("addressId is required"),
  ],
  upsertShopAddress: [
    body("label")
      .optional()
      .isString()
      .withMessage("label must be a string")
      .isLength({ min: 1, max: 60 })
      .withMessage("label must be between 1 and 60 characters"),
    body("street")
      .trim()
      .notEmpty()
      .withMessage("street is required")
      .isLength({ min: 2, max: 160 })
      .withMessage("street must be between 2 and 160 characters"),
    body("city")
      .trim()
      .notEmpty()
      .withMessage("city is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("city must be between 2 and 80 characters"),
    body("state")
      .trim()
      .notEmpty()
      .withMessage("state is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("state must be between 2 and 80 characters"),
    body("postalCode")
      .trim()
      .notEmpty()
      .withMessage("postalCode is required")
      .isLength({ min: 2, max: 20 })
      .withMessage("postalCode is invalid"),
    body("country")
      .trim()
      .notEmpty()
      .withMessage("country is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("country is invalid"),
    body("location")
      .isObject()
      .withMessage("location is required and must be an object"),
    body("location.type")
      .optional()
      .isString()
      .withMessage("location.type must be a string")
      .custom((value) => value.toString().toUpperCase() === "POINT")
      .withMessage("location.type must be Point"),
    body("location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("location.coordinates must be [longitude, latitude]"),
    body("location.coordinates.*")
      .isFloat()
      .withMessage("location coordinates must be numbers"),
  ],
  categoryCreate: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("name is required")
      .isLength({ min: 2, max: 80 })
      .withMessage("name must be between 2 and 80 characters"),
    body("slug")
      .optional()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("slug must be between 2 and 120 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 240 })
      .withMessage("description must be at most 240 characters"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("status must be active or inactive"),
  ],
  categoryUpdate: [
    param("id").trim().notEmpty().withMessage("id is required").isMongoId().withMessage("Invalid category id"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("name must be between 2 and 80 characters"),
    body("slug")
      .optional()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("slug must be between 2 and 120 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 240 })
      .withMessage("description must be at most 240 characters"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("status must be active or inactive"),
    body()
      .custom((value: any) => {
        if (!value || typeof value !== "object") return false;
        return (
          value.name !== undefined ||
          value.slug !== undefined ||
          value.description !== undefined ||
          value.status !== undefined
        );
      })
      .withMessage("At least one category field is required"),
  ],
  categoryDelete: [
    param("id").trim().notEmpty().withMessage("id is required").isMongoId().withMessage("Invalid category id"),
  ],
  productReview: [
    param("productId")
      .trim()
      .notEmpty()
      .withMessage("productId is required")
      .isMongoId()
      .withMessage("Invalid product id"),
    body("orderId")
      .trim()
      .notEmpty()
      .withMessage("orderId is required")
      .isMongoId()
      .withMessage("Invalid order id"),
    body("rating")
      .notEmpty()
      .withMessage("rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("rating must be between 1 and 5"),
    body("comment")
      .trim()
      .notEmpty()
      .withMessage("comment is required")
      .isLength({ min: 3, max: 500 })
      .withMessage("comment must be between 3 and 500 characters"),
  ],
  adminOrderStatus: [
    param("id").trim().notEmpty().withMessage("id is required").isMongoId().withMessage("Invalid order id"),
    body("orderStatus")
      .optional()
      .isIn(["pending", "shipped", "delivered", "cancelled"])
      .withMessage("orderStatus is invalid"),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "completed", "failed"])
      .withMessage("paymentStatus is invalid"),
    body("deliveryStatus")
      .optional()
      .isIn(["preparing", "in_transit", "delivered"])
      .withMessage("deliveryStatus is invalid"),
    body()
      .custom((value: any) => {
        if (!value || typeof value !== "object") return false;
        return (
          value.orderStatus !== undefined ||
          value.paymentStatus !== undefined ||
          value.deliveryStatus !== undefined
        );
      })
      .withMessage("At least one order status field is required"),
  ],
  adminPaymentStatus: [
    param("id").trim().notEmpty().withMessage("id is required").isMongoId().withMessage("Invalid payment id"),
    body("status")
      .trim()
      .notEmpty()
      .withMessage("status is required")
      .isIn(["CREATED", "PENDING", "COMPLETED", "FAILED", "EXPIRED", "SUCCEEDED", "REFUNDED"])
      .withMessage("status is invalid"),
    body("transactionRef")
      .optional()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("transactionRef must be between 2 and 120 characters"),
    body("paidAt")
      .optional()
      .isISO8601()
      .withMessage("paidAt must be a valid ISO date"),
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
