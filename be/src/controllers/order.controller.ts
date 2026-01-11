import { OrderServiceImpl } from "@services/impl/order.service.impl";
import { NextFunction, Request, Response } from "express";
class OrderController {
  private orderService: OrderServiceImpl;
  constructor() {
    this.orderService = new OrderServiceImpl();
  }

  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.orderService.createOrder(req.body);
      res
        .status(201)
        .json({
          success: true,
          message: "Order created successfully",
          data: order,
        });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.page) || 10;
      const orders = await this.orderService.getAllOrders(page, limit);

      res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrdetById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const orderId = await this.orderService.getOrderById(id);
      res.status(200).json({
        success: true,
        message: "Order fetched Succssfully",
        data: orderId,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const orderOject = await this.orderService.getOrderByUser(id);
      res.status(200).json({
        success: true,
        message: "Succssfully",
        data: orderOject,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new OrderController();
