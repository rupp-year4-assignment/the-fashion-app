"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hasRoles_middleware_1 = require("../middlewares/hasRoles.middleware");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const upload_controller_1 = __importDefault(require("../controllers/upload.controller"));
const upload_config_1 = require("../config/upload.config");
const router = (0, express_1.Router)();
router.post("/uploads/products", (0, hasRoles_middleware_1.hasRoles)("admin"), upload_config_1.productImageUpload.single("file"), (0, asyncHandler_1.default)(upload_controller_1.default.uploadProductImage));
exports.default = router;
