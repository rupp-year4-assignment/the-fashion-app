import { CreateOrderDTO } from "@dtos/request/order.request";
import CartModel from "@models/cart";
import OrderService from "@services/order.service";
import OrderModel, { IOrder } from "@models/orders";
import ProductModel from "@models/product";
import ReviewModel from "@models/review";
import UserModel from "@models/user";
import ShopAddressServiceImpl from "@services/impl/shop_address.service.impl";
import paymentService from "@services/impl/payment.service.impl";
import mongoose from "mongoose";

export class OrderServiceImpl implements OrderService {
  private orderModel = OrderModel.getModel();
  private reviewModel = ReviewModel.getModel();
  private shopAddressService = new ShopAddressServiceImpl();

  private async buildProductSnapshotMap(productIds: string[]): Promise<
    Map<
      string,
      {
        name: string;
        image?: string;
      }
    >
  > {
    const validProductIds = Array.from(
      new Set(productIds.filter((id) => mongoose.Types.ObjectId.isValid(id)))
    );

    if (validProductIds.length === 0) {
      return new Map();
    }

    const products = await ProductModel.getModel()
      .find({
        _id: {
          $in: validProductIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      } as any)
      .lean();

    return new Map(
      products.map((product: any) => [
        product._id.toString(),
        {
          name: product.name ?? "Product",
          image:
            Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : undefined,
        },
      ])
    );
  }

  private async enrichOrder(order: IOrder): Promise<any> {
    const plainOrder = order.toObject();
    const productMap = await this.buildProductSnapshotMap(
      plainOrder.items.map((item: any) => item.productId.toString())
    );
    const reviewMap = await this.buildReviewMapForOrders([
      {
        userId: plainOrder.userId?.toString?.() || "",
        productIds: plainOrder.items.map((item: any) =>
          item.productId.toString()
        ),
      },
    ]);
    const customer =
      mongoose.Types.ObjectId.isValid(plainOrder.userId?.toString?.() || "") &&
      (await UserModel.getModel()
        .findById(plainOrder.userId)
        .select("fullName email phoneNumber")
        .lean());

    return {
      ...plainOrder,
      customer: customer
        ? {
            id: customer._id.toString(),
            name: customer.fullName ?? "Customer",
            email: customer.email ?? "",
            phone: customer.phoneNumber ?? "",
          }
        : null,
      items: plainOrder.items.map((item: any) => {
        const snapshot = productMap.get(item.productId.toString());
        const review = reviewMap.get(
          `${plainOrder.userId?.toString?.() || ""}:${item.productId.toString()}`
        );
        return {
          ...item,
          productName: item.productName || snapshot?.name || "Product",
          image: item.image || snapshot?.image,
          hasReview: Boolean(review),
          reviewId: review?.id,
          reviewRating: review?.rating,
          reviewComment: review?.comment,
        };
      }),
    };
  }

  private async buildReviewMapForOrders(
    entries: Array<{ userId: string; productIds: string[] }>
  ): Promise<Map<string, { id: string; rating: number; comment: string }>> {
    const userIds = Array.from(
      new Set(
        entries
          .map((entry) => entry.userId)
          .filter((value) => mongoose.Types.ObjectId.isValid(value))
      )
    );
    const productIds = Array.from(
      new Set(
        entries.flatMap((entry) => entry.productIds).filter((value) =>
          mongoose.Types.ObjectId.isValid(value)
        )
      )
    );

    if (userIds.length === 0 || productIds.length === 0) {
      return new Map();
    }

    const reviews = await this.reviewModel
      .find({
        userId: {
          $in: userIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      } as any)
      .select("userId productId rating comment")
      .lean();

    return new Map(
      reviews.map((review: any) => [
        `${review.userId.toString()}:${review.productId.toString()}`,
        {
          id: review._id.toString(),
          rating: Number(review.rating || 0),
          comment: review.comment || "",
        },
      ])
    );
  }

  private async enrichOrders(orders: IOrder[]): Promise<any[]> {
    const productMap = await this.buildProductSnapshotMap(
      orders.flatMap((order) =>
        order.items.map((item) => item.productId.toString())
      )
    );
    const reviewMap = await this.buildReviewMapForOrders(
      orders.map((order) => ({
        userId: order.userId?.toString?.() || "",
        productIds: order.items.map((item) => item.productId.toString()),
      }))
    );
    const customerIds = Array.from(
      new Set(
        orders
          .map((order) => order.userId?.toString())
          .filter((value): value is string => Boolean(value) && mongoose.Types.ObjectId.isValid(value))
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
    const customerMap = new Map(
      customers.map((customer: any) => [
        customer._id.toString(),
        {
          id: customer._id.toString(),
          name: customer.fullName ?? "Customer",
          email: customer.email ?? "",
          phone: customer.phoneNumber ?? "",
        },
      ])
    );

    return orders.map((order) => {
      const plainOrder = order.toObject();
      return {
        ...plainOrder,
        customer: customerMap.get(plainOrder.userId?.toString?.() || "") || null,
        items: plainOrder.items.map((item: any) => {
          const snapshot = productMap.get(item.productId.toString());
          const review = reviewMap.get(
            `${plainOrder.userId?.toString?.() || ""}:${item.productId.toString()}`
          );
          return {
            ...item,
            productName: item.productName || snapshot?.name || "Product",
            image: item.image || snapshot?.image,
            hasReview: Boolean(review),
            reviewId: review?.id,
            reviewRating: review?.rating,
            reviewComment: review?.comment,
          };
        }),
      };
    });
  }

  private normalizeAddress(payload: any): {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  } {
    const fallbackCoordinates: [number, number] = [104.9282, 11.5564];
    const rawCoordinates = payload?.location?.coordinates;
    let coordinates = fallbackCoordinates;

    if (
      Array.isArray(rawCoordinates) &&
      rawCoordinates.length === 2 &&
      Number.isFinite(Number(rawCoordinates[0])) &&
      Number.isFinite(Number(rawCoordinates[1]))
    ) {
      coordinates = [Number(rawCoordinates[0]), Number(rawCoordinates[1])];
    } else if (rawCoordinates && typeof rawCoordinates === "object") {
      const lat = Number(
        rawCoordinates.latitude ?? rawCoordinates.latidute ?? rawCoordinates.lat
      );
      const lng = Number(
        rawCoordinates.longitude ??
          rawCoordinates.longtitude ??
          rawCoordinates.lng
      );

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        coordinates = [lng, lat];
      }
    }

    const street = payload?.street?.trim() || "Unknown street";
    const city = payload?.city?.trim() || "Phnom Penh";
    const state = payload?.state?.trim() || city;
    const postalCode = payload?.postalCode?.trim() || "12000";
    const country = payload?.country?.trim() || "Cambodia";

    return {
      street,
      city,
      state,
      postalCode,
      country,
      location: {
        type: "Point",
        coordinates,
      },
    };
  }

  async createOrder(data: CreateOrderDTO): Promise<CreateOrderDTO> {
    if (!data.item || data.item.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    if (!data.delivery?.address) {
      throw new Error("Delivery address is required.");
    }

    const totalAmount = data.item.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const productMap = await this.buildProductSnapshotMap(
      data.item.map((item) => item.productId)
    );

    const orderNumbes = `ORD-${Date.now()}`;
    const trackingNumber = `TRK-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toLocaleUpperCase()}`;

    const destinationAddress = this.normalizeAddress(data.delivery.address);
    const defaultShopAddress = await this.shopAddressService.getDefaultShopAddress();
    const pickupAddress = this.normalizeAddress(defaultShopAddress);
    const courier = data.delivery.courier?.trim() || "Standard";

    const order = await this.orderModel.create({
      orderNumber: orderNumbes,
      userId: new mongoose.Types.ObjectId(data.userId),
      items: data.item.map((item) => {
        const snapshot = productMap.get(item.productId);

        return {
          productId: new mongoose.Types.ObjectId(item.productId),
          variantId: new mongoose.Types.ObjectId(item.variantId),
          size: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
          productName: item.productName || snapshot?.name || "Product",
          image: snapshot?.image,
        };
      }),
      totalAmount: totalAmount,
      orderStatus: "pending",
      paymentStatus: "pending",
      delivery: {
        address: {
          ...destinationAddress,
        },
        pickupAddress: {
          ...pickupAddress,
        },
        destinationAddress: {
          ...destinationAddress,
        },
        deliveryStatus: "preparing",
        trackingNumber,
        courier,
      },
    } as any);

    await CartModel.getModel().findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(data.userId),
        status: "active",
      },
      { status: "inactive" }
    );

    return (await this.enrichOrder(order)) as any;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    await paymentService.reconcilePendingStripePayments([orderId]);

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }
    return (await this.enrichOrder(order)) as any;
  }

  async getAllOrders(
    page = 1,
    limit = 10
  ): Promise<{ data: IOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    try {
      let [orders, total] = await Promise.all([
        this.orderModel
          .find()
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.orderModel.countDocuments(),
      ]);

      await paymentService.reconcilePendingStripePayments(
        orders.map((order) => order._id.toString())
      );

      orders = await this.orderModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      return {
        data: (await this.enrichOrders(orders)) as any,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error("Error fetching orders.");
    }
  }

  async getOrderByUser(userId: string): Promise<IOrder[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    try {
      let orders = await this.orderModel
        .find({ userId: userId as any } as any)
        .sort({ createdAt: -1 })
        .exec();

      await paymentService.reconcilePendingStripePayments(
        orders.map((order) => order._id.toString())
      );

      orders = await this.orderModel
        .find({ userId: userId as any } as any)
        .sort({ createdAt: -1 })
        .exec();

      return (await this.enrichOrders(orders)) as any;
    } catch (error) {
      throw new Error(`Error fetching orders for user: ${error}`);
    }
  }
}

export default new OrderServiceImpl();
