import {
  CreatePaymentDTO,
  CreateStripeCheckoutSessionDTO,
  GenerateKHQRDTO,
  PaymentFilterDTO,
  PaymentMethod,
  PaymentResponseDTO,
  UpdatePaymentStatusDTO,
  VerifyPaymentDTO,
} from "@dtos/request/payment.request";
import OrderModel from "@models/orders";
import PaymentCardModel from "@models/payment_card";
import PaymentModel, { IPayment } from "@models/payment";
import UserModel from "@models/user";
import { PaymentResponseMapper } from "@mapper/toResponse";
import PaymentService from "@services/payment.service";
import BadRequestException from "@exceptions/badRequest.exception";
import NotFoundException from "@exceptions/notFound.exception";
import bakongClient from "clients/bakong.client";
import mongoose from "mongoose";
import Stripe from "stripe";
import { getStripeClient } from "../../config/stripe.config";

class PaymentServiceImpl implements PaymentService {
  private paymentModel = PaymentModel.getModel();
  private paymentCardModel = PaymentCardModel.getModel();
  private stripe = getStripeClient();

  private async enrichPaymentResponse(
    payment: IPayment
  ): Promise<PaymentResponseDTO> {
    const order = await OrderModel.getModel()
      .findById(payment.orderId)
      .select("orderNumber userId")
      .lean();

    if (!order) {
      return PaymentResponseMapper.toResponse(payment);
    }

    const customer = mongoose.Types.ObjectId.isValid(
      order.userId?.toString?.() || ""
    )
      ? await UserModel.getModel()
          .findById(order.userId)
          .select("fullName email phoneNumber")
          .lean()
      : null;

    return PaymentResponseMapper.toResponse(payment, {
      orderNumber: order.orderNumber ?? "",
      customerId: order.userId?.toString?.() ?? "",
      customerName: customer?.fullName ?? "",
      customerEmail: customer?.email ?? "",
      customerPhone: customer?.phoneNumber ?? "",
    });
  }

  private async enrichPaymentResponses(
    payments: IPayment[]
  ): Promise<PaymentResponseDTO[]> {
    if (payments.length === 0) {
      return [];
    }

    const orderIds = Array.from(
      new Set(payments.map((payment) => payment.orderId.toString()))
    );

    const orders = await OrderModel.getModel()
      .find({
        _id: {
          $in: orderIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      } as any)
      .select("orderNumber userId")
      .lean();

    const customerIds = Array.from(
      new Set(
        orders
          .map((order: any) => order.userId?.toString?.())
          .filter(
            (id): id is string => Boolean(id) && mongoose.Types.ObjectId.isValid(id)
          )
      )
    );

    const customers = customerIds.length
      ? await UserModel.getModel()
          .find({
            _id: {
              $in: customerIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          } as any)
          .select("fullName email phoneNumber")
          .lean()
      : [];

    const orderMap = new Map(
      orders.map((order: any) => [order._id.toString(), order])
    );
    const customerMap = new Map(
      customers.map((customer: any) => [customer._id.toString(), customer])
    );

    return payments.map((payment) => {
      const order = orderMap.get(payment.orderId.toString());
      const customer = order
        ? customerMap.get(order.userId?.toString?.() || "")
        : null;

      return PaymentResponseMapper.toResponse(payment, {
        orderNumber: order?.orderNumber ?? "",
        customerId: order?.userId?.toString?.() ?? "",
        customerName: customer?.fullName ?? "",
        customerEmail: customer?.email ?? "",
        customerPhone: customer?.phoneNumber ?? "",
      });
    });
  }

  private normalizeStripeCurrency(order: any): "usd" {
    const rawCurrency = (order?.currency ?? "USD").toString().toUpperCase();
    if (rawCurrency !== "USD") {
      throw new BadRequestException(
        "Stripe Checkout is configured for USD test payments in this project."
      );
    }

    return "usd";
  }

  private buildStripeLineItems(order: any): Stripe.Checkout.SessionCreateParams.LineItem[] {
    if (!Array.isArray(order?.items) || order.items.length === 0) {
      throw new BadRequestException("Order has no items.");
    }

    return order.items.map((item: any) => {
      const unitAmount = Math.round(Number(item.price || 0) * 100);
      if (unitAmount <= 0) {
        throw new BadRequestException(
          `Invalid item price for product ${item.productName || "Unknown product"}.`
        );
      }

      return {
        quantity: Number(item.quantity || 1),
        price_data: {
          currency: this.normalizeStripeCurrency(order),
          unit_amount: unitAmount,
          product_data: {
            name: item.productName || "Fashion Item",
            metadata: {
              productId: item.productId?.toString?.() ?? "",
              variantId: item.variantId?.toString?.() ?? "",
              size: item.size ?? "",
              color: item.color ?? "",
            },
          },
        },
      };
    });
  }

  private async findOrderForStripeCheckout(data: {
    orderId: string;
    userId?: string;
  }) {
    if (!mongoose.Types.ObjectId.isValid(data.orderId)) {
      throw new BadRequestException("Invalid order id.");
    }

    const order = await OrderModel.getModel().findById(data.orderId);
    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (data.userId && order.userId.toString() !== data.userId) {
      throw new BadRequestException("Order does not belong to the current user.");
    }

    if (order.orderStatus === "cancelled") {
      throw new BadRequestException("Cancelled orders cannot be paid.");
    }

    if (order.paymentStatus === "completed") {
      throw new BadRequestException("Order is already paid.");
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new BadRequestException("Order has no items.");
    }

    if (!order.totalAmount || order.totalAmount <= 0) {
      throw new BadRequestException("Order total amount must be greater than zero.");
    }

    return order;
  }

  private async reusePendingStripeCheckout(orderId: string): Promise<{
    checkoutUrl: string;
    payment: PaymentResponseDTO;
  } | null> {
    const latestStripePayment = await this.paymentModel
      .findOne({
        orderId,
        method: "STRIPE",
        status: { $in: ["PENDING", "CREATED"] },
      } as any)
      .sort({ createdAt: -1 });

    if (!latestStripePayment?.stripeCheckoutSessionId) {
      return null;
    }

    const session = await this.stripe.checkout.sessions.retrieve(
      latestStripePayment.stripeCheckoutSessionId
    );

    if (session.status === "complete") {
      await this.handleStripeCheckoutCompleted({
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        orderId: latestStripePayment.orderId.toString(),
      });
      throw new BadRequestException("Order is already paid.");
    }

    if (session.status === "open" && session.url) {
      return {
        checkoutUrl: session.url,
        payment: PaymentResponseMapper.toResponse(latestStripePayment),
      };
    }

    latestStripePayment.status = "FAILED";
    await latestStripePayment.save();
    await this.syncOrderPaymentStatus(
      latestStripePayment.orderId as any,
      latestStripePayment.status
    );

    return null;
  }

  private async reconcileStripePayment(payment: IPayment): Promise<boolean> {
    if (
      payment.method !== "STRIPE" ||
      !payment.stripeCheckoutSessionId ||
      !["CREATED", "PENDING"].includes(payment.status)
    ) {
      return false;
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(
        payment.stripeCheckoutSessionId
      );

      if (session.status === "complete" || session.payment_status === "paid") {
        await this.handleStripeCheckoutCompleted({
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
          orderId:
            session.metadata?.orderId ??
            session.client_reference_id ??
            payment.orderId.toString(),
        });
        return true;
      }

      if (session.status === "expired") {
        await this.handleStripeCheckoutExpired({
          sessionId: session.id,
          orderId:
            session.metadata?.orderId ??
            session.client_reference_id ??
            payment.orderId.toString(),
        });
        return true;
      }
    } catch (error: any) {
      console.warn(
        `[PaymentService] Failed to reconcile Stripe session ${payment.stripeCheckoutSessionId}: ${error?.message || error}`
      );
    }

    return false;
  }

  async reconcilePendingStripePayments(orderIds?: string[]): Promise<void> {
    const query: any = {
      method: "STRIPE",
      status: { $in: ["CREATED", "PENDING"] },
    };

    if (Array.isArray(orderIds) && orderIds.length > 0) {
      const validOrderIds = orderIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      if (validOrderIds.length === 0) {
        return;
      }

      query.orderId = {
        $in: validOrderIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const payments = await this.paymentModel.find(query).sort({ createdAt: -1 });

    for (const payment of payments) {
      await this.reconcileStripePayment(payment);
    }
  }

  private async syncOrderPaymentStatus(
    orderId: mongoose.Types.ObjectId,
    paymentStatus: IPayment["status"]
  ): Promise<void> {
    const order = await OrderModel.getModel().findById(orderId);
    if (!order) return;

    if (
      paymentStatus === "COMPLETED" ||
      paymentStatus === "SUCCEEDED" ||
      paymentStatus === "REFUNDED"
    ) {
      order.paymentStatus = "completed";
    } else if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
      order.paymentStatus = "failed";
    } else {
      order.paymentStatus = "pending";
    }

    await order.save();
  }

  async createStripeCheckoutSession(
    data: CreateStripeCheckoutSessionDTO & { userId?: string }
  ): Promise<{ checkoutUrl: string; payment: PaymentResponseDTO }> {
    const order = await this.findOrderForStripeCheckout(data);
    const reusedSession = await this.reusePendingStripeCheckout(order._id.toString());

    if (reusedSession) {
      return reusedSession;
    }

    const clientUrl = process.env.CLIENT_URL?.trim();
    if (!clientUrl) {
      throw new Error("CLIENT_URL is not configured.");
    }

    const currency = this.normalizeStripeCurrency(order);
    const lineItems = this.buildStripeLineItems(order);
    const successUrl = `${clientUrl.replace(/\/$/, "")}/payment/success?orderId=${order._id.toString()}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientUrl.replace(/\/$/, "")}/payment/cancel?orderId=${order._id.toString()}`;

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order._id.toString(),
      },
      client_reference_id: order._id.toString(),
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    const payment = await this.paymentModel.create({
      orderId: order._id,
      stripeCheckoutSessionId: session.id,
      amount: order.totalAmount,
      currency: currency.toUpperCase(),
      method: "STRIPE",
      status: "PENDING",
    } as any);

    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);

    return {
      checkoutUrl: session.url,
      payment: PaymentResponseMapper.toResponse(payment),
    };
  }

  private async createBakongPayment(
    order: any,
    data: CreatePaymentDTO,
    amount: number
  ): Promise<PaymentResponseDTO> {
    const currency = data.currency ?? "USD";

    const { qr, md5 } = bakongClient.generateMerchantKHQR({
      amount,
      currency,
      billNumber: order._id.toString(),
    });

    const rawExpiry = (data as any).expiresAt ?? data.expiesAt;
    const parsedExpiry = rawExpiry ? new Date(rawExpiry) : null;
    const expiresAt =
      parsedExpiry && !Number.isNaN(parsedExpiry.getTime())
        ? parsedExpiry
        : new Date(Date.now() + 15 * 60 * 1000);

    const payment = await this.paymentModel.create({
      orderId: order._id,
      method: "BAKONG",
      amount,
      currency,
      khqrString: qr,
      md5Hash: md5,
      status: "CREATED",
      expiresAt,
    } as any);

    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
    return PaymentResponseMapper.toResponse(payment);
  }

  private async createCardPayment(
    order: any,
    method: PaymentMethod,
    amount: number,
    currency: "KHR" | "USD",
    savedCardId?: string
  ): Promise<PaymentResponseDTO> {
    if (!savedCardId || !mongoose.Types.ObjectId.isValid(savedCardId)) {
      throw new BadRequestException(
        "A valid saved card is required for card payment."
      );
    }

    const card = await this.paymentCardModel.findById(savedCardId);
    if (!card || !card.isActive) {
      throw new NotFoundException("Saved card not found.");
    }

    if (card.userId.toString() !== order.userId.toString()) {
      throw new BadRequestException(
        "Saved card does not belong to this order user."
      );
    }

    if (method === "UNION_PAY" && card.network !== "UNIONPAY") {
      throw new BadRequestException(
        "UnionPay payment requires a UnionPay card."
      );
    }

    if (method === "CREDIT_CARD" && card.network === "UNIONPAY") {
      throw new BadRequestException("Use UnionPay payment method for this card.");
    }

    const payment = await this.paymentModel.create({
      orderId: order._id,
      method,
      amount,
      currency,
      status: "COMPLETED",
      transactionRef: `CARD-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      paidAt: new Date(),
      cardId: card._id,
      cardLast4: card.last4,
      cardNetwork: card.network,
    } as any);

    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
    return PaymentResponseMapper.toResponse(payment);
  }

  async createPayment(data: CreatePaymentDTO): Promise<PaymentResponseDTO> {
    const method: PaymentMethod = data.method ?? "BAKONG";

    const order = await OrderModel.getModel().findById(data.orderId);
    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    const latestPayment = await this.paymentModel
      .findOne({ orderId: order._id } as any)
      .sort({ createdAt: -1 });

    if (latestPayment?.status === "COMPLETED") {
      return PaymentResponseMapper.toResponse(latestPayment);
    }

    const amount = order.totalAmount > 0 ? order.totalAmount : data.amount;
    if (!amount || amount <= 0) {
      throw new BadRequestException("Payment amount must be greater than zero.");
    }

    const currency = data.currency ?? "USD";

    if (method === "BAKONG") {
      if (latestPayment) {
        const isExpired =
          latestPayment.expiresAt != null &&
          new Date() > latestPayment.expiresAt &&
          (latestPayment.status === "CREATED" ||
            latestPayment.status === "PENDING");

        if (
          (latestPayment.status === "CREATED" ||
            latestPayment.status === "PENDING") &&
          !isExpired
        ) {
          return PaymentResponseMapper.toResponse(latestPayment);
        }

        if (isExpired) {
          latestPayment.status = "EXPIRED";
          await latestPayment.save();
          await this.syncOrderPaymentStatus(
            latestPayment.orderId as any,
            latestPayment.status
          );
        }
      }

      return await this.createBakongPayment(order, data, amount);
    }

    if (method === "CREDIT_CARD" || method === "UNION_PAY") {
      if (
        latestPayment &&
        (latestPayment.status === "CREATED" || latestPayment.status === "PENDING")
      ) {
        latestPayment.status = "FAILED";
        await latestPayment.save();
        await this.syncOrderPaymentStatus(
          latestPayment.orderId as any,
          latestPayment.status
        );
      }

      return await this.createCardPayment(
        order,
        method,
        amount,
        currency,
        data.savedCardId
      );
    }

    throw new BadRequestException("Unsupported payment method.");
  }

  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new Error("Payment not found.");
    return payment;
  }

  async getPaymentByOrderId(
    orderId: string
  ): Promise<PaymentResponseDTO | null> {
    await this.reconcilePendingStripePayments([orderId]);

    const order = await OrderModel.getModel().findById(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const payment = await this.paymentModel
      .findOne({ orderId: order._id } as any)
      .sort({ createdAt: -1 });

    if (!payment) return null;
    return this.enrichPaymentResponse(payment);
  }

  async getAllPayments(
    filter?: PaymentFilterDTO
  ): Promise<PaymentResponseDTO[]> {
    if (!filter?.method || filter.method === "STRIPE") {
      await this.reconcilePendingStripePayments();
    }

    const query: any = {};

    if (filter?.status) query.status = filter.status;
    if (filter?.method) query.method = filter.method;
    if (filter?.minAmount != null || filter?.maxAmount != null) {
      query.amount = {};
      if (filter?.minAmount != null) query.amount.$gte = filter.minAmount;
      if (filter?.maxAmount != null) query.amount.$lte = filter.maxAmount;
    }

    const allPayments = await this.paymentModel.find(query).sort({ createdAt: -1 });
    return this.enrichPaymentResponses(allPayments);
  }

  async updatePaymentStatus(
    paymentId: string,
    data: UpdatePaymentStatusDTO
  ): Promise<PaymentResponseDTO | null> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "COMPLETED") {
      throw new Error("Payment already completed.");
    }
    if (payment.status === "EXPIRED") {
      throw new Error("Payment already expired");
    }
    if (payment.status === "FAILED") {
      throw new Error("Failed payment cannot be updated");
    }

    if (data.status === "COMPLETED" && !data.transactionRef) {
      throw new Error("Transaction reference is required for completion.");
    }

    payment.status = data.status;
    if (data.transactionRef) {
      payment.transactionRef = data.transactionRef;
    }
    if (data.paidAt) {
      payment.paidAt = data.paidAt;
    }

    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
    return this.enrichPaymentResponse(payment);
  }

  async generateKHQR(data: GenerateKHQRDTO): Promise<string> {
    const order = await OrderModel.getModel().findById(data.orderId);
    if (!order) throw new Error("Order not found.");

    const { qr } = bakongClient.generateMerchantKHQR({
      amount: data.amount,
      currency: data.currency,
      billNumber: data.orderId,
    });

    return qr;
  }

  async verifyPayment(data: VerifyPaymentDTO): Promise<boolean> {
    try {
      const verificationResult = bakongClient.verifyKHQR(data.khqrString);
      if (!verificationResult.isValid) {
        return false;
      }

      const order = await OrderModel.getModel().findById(data.orderId);
      if (!order) throw new Error("Order not found.");

      const payment = await this.paymentModel.findOne({ orderId: order._id } as any);
      if (!payment) {
        throw new Error("Payment not found for this order.");
      }

      if (payment.method !== "BAKONG") {
        throw new Error("KHQR verification only supports Bakong payments.");
      }

      if (payment.khqrString !== data.khqrString) {
        return false;
      }

      if (payment.status === "COMPLETED") {
        return true;
      }

      if (payment.expiresAt && new Date() > payment.expiresAt) {
        await this.expirePayment(payment._id.toString());
        return false;
      }

      if (payment.status === "FAILED" || payment.status === "EXPIRED") {
        return false;
      }

      if (data.transactionRef) {
        payment.transactionRef = data.transactionRef;
        payment.status = "PENDING";
        await payment.save();
        await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
      }

      return true;
    } catch (error: any) {
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  async completePayment(
    paymentId: string,
    transactionRef: string
  ): Promise<PaymentResponseDTO | null> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "COMPLETED") {
      throw new Error("Payment already completed.");
    }

    if (payment.status === "EXPIRED") {
      throw new Error("Cannot complete an expired payment.");
    }

    if (payment.status === "FAILED") {
      throw new Error("Cannot complete a failed payment.");
    }

    if (!transactionRef || transactionRef.trim().length === 0) {
      throw new Error("Transaction reference is required.");
    }

    payment.status = "COMPLETED";
    payment.transactionRef = transactionRef;
    payment.paidAt = new Date();

    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
    return PaymentResponseMapper.toResponse(payment);
  }

  async failPayment(
    paymentId: string,
    reason?: string
  ): Promise<PaymentResponseDTO | null> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "COMPLETED") {
      throw new Error("Cannot fail a completed payment.");
    }

    if (payment.status === "FAILED") {
      return PaymentResponseMapper.toResponse(payment);
    }

    payment.status = "FAILED";
    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);

    if (reason) {
      console.warn(`Payment ${paymentId} marked as failed: ${reason}`);
    }

    return PaymentResponseMapper.toResponse(payment);
  }

  async expirePayment(paymentId: string): Promise<PaymentResponseDTO | null> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "COMPLETED") {
      throw new Error("Cannot expire a completed payment.");
    }

    if (payment.status === "EXPIRED") {
      return PaymentResponseMapper.toResponse(payment);
    }

    payment.status = "EXPIRED";
    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);

    return PaymentResponseMapper.toResponse(payment);
  }

  async handleStripeCheckoutCompleted(payload: {
    sessionId: string;
    paymentIntentId?: string | null;
    orderId?: string | null;
  }): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripeCheckoutSessionId: payload.sessionId,
      method: "STRIPE",
    } as any);

    if (!payment) {
      throw new NotFoundException("Stripe payment session not found.");
    }

    if (
      payload.orderId &&
      payment.orderId.toString() !== payload.orderId.toString()
    ) {
      throw new BadRequestException("Webhook order id does not match payment.");
    }

    if (payment.status === "SUCCEEDED" || payment.status === "COMPLETED") {
      return;
    }

    payment.status = "SUCCEEDED";
    if (payload.paymentIntentId) {
      payment.stripePaymentIntentId = payload.paymentIntentId;
      payment.transactionRef = payload.paymentIntentId;
    }
    payment.paidAt = payment.paidAt ?? new Date();

    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
  }

  async handleStripeCheckoutExpired(payload: {
    sessionId: string;
    orderId?: string | null;
  }): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripeCheckoutSessionId: payload.sessionId,
      method: "STRIPE",
    } as any);

    if (!payment) {
      return;
    }

    if (
      payload.orderId &&
      payment.orderId.toString() !== payload.orderId.toString()
    ) {
      throw new BadRequestException("Webhook order id does not match payment.");
    }

    if (payment.status === "SUCCEEDED" || payment.status === "COMPLETED") {
      return;
    }

    if (payment.status === "FAILED" || payment.status === "EXPIRED") {
      return;
    }

    payment.status = "FAILED";
    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
  }

  async handleStripeRefund(payload: {
    paymentIntentId?: string | null;
  }): Promise<void> {
    if (!payload.paymentIntentId) {
      return;
    }

    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: payload.paymentIntentId,
      method: "STRIPE",
    } as any);

    if (!payment) {
      return;
    }

    if (payment.status === "REFUNDED") {
      return;
    }

    payment.status = "REFUNDED";
    await payment.save();
    await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
  }

  async checkExpiredPayments(): Promise<void> {
    const now = new Date();

    const expiredPayments = await this.paymentModel.find({
      status: { $in: ["CREATED", "PENDING"] },
      expiresAt: { $lte: now },
    } as any);

    for (const payment of expiredPayments) {
      payment.status = "EXPIRED";
      await payment.save();
      await this.syncOrderPaymentStatus(payment.orderId as any, payment.status);
    }
  }
}

export default new PaymentServiceImpl();
