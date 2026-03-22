"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_service_impl_1 = require("../services/impl/order.service.impl");
class OrderController {
    constructor() {
        this.createOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield this.orderService.createOrder(req.body);
                res.status(201).json({ success: true, message: "Order created successfully", data: order });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
        this.getAllOrders = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;
                const orders = yield this.orderService.getAllOrders(page, limit);
                res.status(200).json({
                    success: true,
                    message: "Orders fetched successfully",
                    data: orders
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.getOrdetById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (typeof id !== "string") {
                    throw new Error("Invalid order id");
                }
                const orderId = yield this.orderService.getOrderById(id);
                res.status(200).json({
                    success: true,
                    message: "Order fetched Succssfully",
                    data: orderId
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.getOrderByUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (typeof id !== "string") {
                    throw new Error("Invalid order id");
                }
                const orderOject = yield this.orderService.getOrderByUser(id);
                res.status(200).json({
                    success: true,
                    message: "Succssfully",
                    data: orderOject,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.orderService = new order_service_impl_1.OrderServiceImpl();
    }
}
exports.default = new OrderController();
