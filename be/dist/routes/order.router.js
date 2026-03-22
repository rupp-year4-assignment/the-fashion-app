"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const hasRoles_middleware_1 = require("../middlewares/hasRoles.middleware");
const route = (0, express_1.Router)();
route.post("/order", order_controller_1.default.createOrder);
route.get("/order", (0, hasRoles_middleware_1.hasRoles)("admin"), order_controller_1.default.getAllOrders);
route.get("/order/:id", order_controller_1.default.getOrdetById);
route.get("/order/users/:id", order_controller_1.default.getOrderByUser);
exports.default = route;
