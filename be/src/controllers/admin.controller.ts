import { Request, Response } from "express";
import CategoryModel from "@models/category";
import OrderModel from "@models/orders";
import PaymentModel from "@models/payment";
import ProductModel from "@models/product";
import userModel from "@models/user";
import mongoose from "mongoose";
import NotFoundException from "@exceptions/notFound.exception";
import BadRequestException from "@exceptions/badRequest.exception";
import { getStripeClient } from "../config/stripe.config";
import orderService from "@services/impl/order.service.impl";
import paymentService from "@services/impl/payment.service.impl";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

function addressToString(value: any) {
  if (!value || typeof value !== "object") {
    return "Address unavailable";
  }

  return [value.street, value.city, value.state, value.postalCode, value.country]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");
}

function mapOrderStatus(value: any) {
  return typeof value === "string" ? value : "pending";
}

function mapPaymentStatus(value: any) {
  if (value === "completed") return "COMPLETED";
  if (value === "failed") return "FAILED";
  return value || "PENDING";
}

function normalizeStripeAmount(amount: number, currency: string) {
  const normalizedCurrency = String(currency || "").toLowerCase();
  if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
    return amount;
  }
  return amount / 100;
}

function mapStripeBalanceAmounts(
  entries: Array<{ amount: number; currency: string; source_types?: Record<string, number> }> = [],
) {
  return entries.map((entry) => ({
    currency: String(entry.currency || "").toUpperCase(),
    amount: Number(entry.amount || 0),
    displayAmount: normalizeStripeAmount(Number(entry.amount || 0), String(entry.currency || "")),
    sourceTypes: entry.source_types || {},
  }));
}

class AdminController {
  private productModel = ProductModel.getModel();
  private orderModel = OrderModel.getModel();
  private paymentModel = PaymentModel.getModel();
  private userModel = userModel.getModel();
  private categoryModel = CategoryModel.getModel();

  private getParamId(req: Request) {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private async getStripeBalanceSummary() {
    try {
      const stripe = getStripeClient();
      const balance = await stripe.balance.retrieve();
      const available = mapStripeBalanceAmounts(balance.available as any);
      const pending = mapStripeBalanceAmounts(balance.pending as any);

      return {
        configured: true,
        livemode: Boolean(balance.livemode),
        modeLabel: balance.livemode ? "Live" : "Test",
        available,
        pending,
        availableTotalUsd: available
          .filter((item) => item.currency === "USD")
          .reduce((sum, item) => sum + item.displayAmount, 0),
        pendingTotalUsd: pending
          .filter((item) => item.currency === "USD")
          .reduce((sum, item) => sum + item.displayAmount, 0),
        retrievedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        configured: false,
        livemode: false,
        modeLabel: "Unavailable",
        available: [],
        pending: [],
        availableTotalUsd: 0,
        pendingTotalUsd: 0,
        retrievedAt: new Date().toISOString(),
        error: error?.message || "Unable to load Stripe balance.",
      };
    }
  }

  dashboard = async (_req: Request, res: Response) => {
    const [productCount, orderCount, customerCount, categoryCount, paymentStats, recentOrders, lowStockProducts, stripeBalance] = await Promise.all([
      this.productModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.userModel.countDocuments({ role: "user" }),
      this.categoryModel.countDocuments(),
      this.paymentModel.aggregate([
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["COMPLETED", "SUCCEEDED", "REFUNDED"]] },
                  "$amount",
                  0,
                ],
              },
            },
            pendingPayments: {
              $sum: {
                $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
              },
            },
          },
        },
      ]),
      this.orderModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      this.productModel.find().sort({ updatedAt: -1 }).limit(20).lean(),
      this.getStripeBalanceSummary(),
    ]);

    const lowStock = lowStockProducts
      .map((product: any) => {
        const stock = Array.isArray(product.variants)
          ? product.variants.reduce((sum: number, variant: any) => sum + Number(variant.stock || 0), 0)
          : 0;
        return {
          id: product._id.toString(),
          name: product.name,
          category: product.category,
          stock,
          updatedAt: product.updatedAt,
        };
      })
      .filter((product) => product.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      message: "Admin dashboard summary fetched successfully.",
      data: {
        summary: {
          totalSales: paymentStats[0]?.totalSales || 0,
          totalOrders: orderCount,
          totalCustomers: customerCount,
          totalProducts: productCount,
          totalCategories: categoryCount,
          pendingPayments: paymentStats[0]?.pendingPayments || 0,
          lowStockProducts: lowStock.length,
        },
        stripeBalance,
        recentOrders: recentOrders.map((order: any) => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: order.userId?.toString?.() || "",
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          deliveryStatus: order.delivery?.deliveryStatus || "preparing",
          createdAt: order.createdAt,
          itemsCount: Array.isArray(order.items) ? order.items.length : 0,
        })),
        lowStockProducts: lowStock,
      },
    });
  };

  customers = async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";

    const query: any = { role: "user" };
    if (status === "active" || status === "banned") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "userId",
            as: "orders",
          },
        },
        {
          $addFields: {
            totalOrders: { $size: "$orders" },
            paidOrders: {
              $filter: {
                input: "$orders",
                as: "order",
                cond: { $eq: ["$$order.paymentStatus", "completed"] },
              },
            },
          },
        },
        {
          $addFields: {
            totalSpent: { $sum: "$paidOrders.totalAmount" },
          },
        },
        { $sort: { totalSpent: -1, totalOrders: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            fullName: 1,
            email: 1,
            phoneNumber: 1,
            status: 1,
            createdAt: 1,
            addresses: 1,
            totalOrders: 1,
            totalSpent: 1,
          },
        },
      ]),
      this.userModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Admin customers fetched successfully.",
      data: users.map((user: any) => {
        const primaryAddress = Array.isArray(user.addresses)
          ? user.addresses.find((address: any) => address?.isDefault) || user.addresses[0]
          : null;

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          phone: user.phoneNumber || "",
          address: addressToString(primaryAddress),
          totalOrders: Number(user.totalOrders || 0),
          totalSpent: Number(user.totalSpent || 0),
          status: user.status,
          joinedAt: (user as any).createdAt,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  };

  customerById = async (req: Request, res: Response) => {
    const id = this.getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid customer id.");
    }

    const user = await this.userModel.findOne({ _id: id, role: "user" }).lean();
    if (!user) {
      throw new NotFoundException("Customer not found.");
    }

    const orders = await this.orderModel.find({ userId: user._id } as any).sort({ createdAt: -1 }).lean();
    const totalSpent = orders.reduce(
      (sum, order: any) =>
        order.paymentStatus === "completed"
          ? sum + Number(order.totalAmount || 0)
          : sum,
      0,
    );
    const primaryAddress = Array.isArray(user.addresses)
      ? user.addresses.find((address: any) => address?.isDefault) || user.addresses[0]
      : null;

    res.status(200).json({
      success: true,
      message: "Admin customer fetched successfully.",
      data: {
        customer: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          phone: user.phoneNumber || "",
          address: addressToString(primaryAddress),
          totalOrders: orders.length,
          totalSpent,
          status: user.status,
          joinedAt: (user as any).createdAt,
        },
        orders: orders.map((order: any) => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          deliveryStatus: order.delivery?.deliveryStatus || "preparing",
          createdAt: order.createdAt,
          shippingAddress: addressToString(order.delivery?.destinationAddress || order.delivery?.address),
          itemsCount: Array.isArray(order.items) ? order.items.length : 0,
        })),
      },
    });
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    const id = this.getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid order id.");
    }

    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (req.body.orderStatus) {
      order.orderStatus = mapOrderStatus(req.body.orderStatus) as any;
    }
    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }
    if (req.body.deliveryStatus && order.delivery) {
      order.delivery.deliveryStatus = req.body.deliveryStatus;
    }

    await order.save();

    const enrichedOrder = await orderService.getOrderById(id);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: enrichedOrder,
    });
  };

  updatePaymentStatus = async (req: Request, res: Response) => {
    const id = this.getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid payment id.");
    }

    const payment = await this.paymentModel.findById(id);
    if (!payment) {
      throw new NotFoundException("Payment not found.");
    }

    const updatedPayment = await paymentService.updatePaymentStatus(id, {
      status: mapPaymentStatus(req.body.status) as any,
      transactionRef:
        typeof req.body.transactionRef === "string"
          ? req.body.transactionRef.trim()
          : undefined,
      paidAt: req.body.paidAt ? new Date(req.body.paidAt) : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      data: updatedPayment,
    });
  };
}

export default new AdminController();
