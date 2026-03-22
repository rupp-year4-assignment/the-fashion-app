"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const validation_middleware_1 = __importStar(require("../middlewares/validation.middleware"));
const hasRoles_middleware_1 = require("../middlewares/hasRoles.middleware");
const router = (0, express_1.Router)();
router.get("/categories", (0, hasRoles_middleware_1.hasRoles)("admin"), (0, asyncHandler_1.default)(category_controller_1.default.list));
router.get("/categories/:id", (0, hasRoles_middleware_1.hasRoles)("admin"), (0, asyncHandler_1.default)(category_controller_1.default.getById));
router.post("/categories", (0, hasRoles_middleware_1.hasRoles)("admin"), validation_middleware_1.default.categoryCreate, validation_middleware_1.ValidationMiddleware, (0, asyncHandler_1.default)(category_controller_1.default.create));
router.patch("/categories/:id", (0, hasRoles_middleware_1.hasRoles)("admin"), validation_middleware_1.default.categoryUpdate, validation_middleware_1.ValidationMiddleware, (0, asyncHandler_1.default)(category_controller_1.default.update));
router.delete("/categories/:id", (0, hasRoles_middleware_1.hasRoles)("admin"), validation_middleware_1.default.categoryDelete, validation_middleware_1.ValidationMiddleware, (0, asyncHandler_1.default)(category_controller_1.default.remove));
exports.default = router;
