import { IProduct } from "@models/product";
import ProductService from "@services/product.service";
import ProductModel from "@models/product";
import ReviewModel from "@models/review";
import UserModel from "@models/user";
import { createProductDTO } from "dtos/request/products/CreateProductDTO.request";
import { UpdateProductDTO } from "dtos/request/products/updateProductDTO";
import mongoose from "mongoose";
import {
  FilterProductDTO,
  PaginatedResult,
} from "dtos/request/products/FilterProductDTO.request";

class ProductServiceImpl implements ProductService {
  private reviewModel = ReviewModel.getModel();
  private userModel = UserModel.getModel();

  private buildProductLookupQuery(id: string): Record<string, unknown> {
    const query: Array<Record<string, unknown>> = [{ productId: id }];

    if (mongoose.Types.ObjectId.isValid(id)) {
      query.push({ _id: id });
    }

    return { $or: query };
  }

  private async buildReviewStats(productIds: string[]): Promise<
    Map<string, { rating: number; reviewCount: number }>
  > {
    const validProductIds = Array.from(
      new Set(productIds.filter((id) => mongoose.Types.ObjectId.isValid(id)))
    );

    if (validProductIds.length === 0) {
      return new Map();
    }

    const stats = await this.reviewModel.aggregate([
      {
        $match: {
          productId: {
            $in: validProductIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      {
        $group: {
          _id: "$productId",
          reviewCount: { $sum: 1 },
          rating: { $avg: "$rating" },
        },
      },
    ]);

    return new Map(
      stats.map((item: any) => [
        item._id.toString(),
        {
          rating: Number(Number(item.rating || 0).toFixed(1)),
          reviewCount: Number(item.reviewCount || 0),
        },
      ])
    );
  }

  private async buildReviewDetails(productId: string): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return [];
    }

    const reviews = await this.reviewModel
      .find({ productId: new mongoose.Types.ObjectId(productId) } as any)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(20)
      .lean();

    if (reviews.length === 0) {
      return [];
    }

    const userIds: string[] = Array.from(
      new Set(
        reviews
          .map((review: any) => review.userId?.toString?.())
          .filter(
            (id: unknown): id is string =>
              typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
          )
      )
    );

    const users = userIds.length
      ? await this.userModel
          .find({
            _id: {
              $in: userIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          } as any)
          .select("fullName firstName lastName")
          .lean()
      : [];

    const userMap = new Map(
      users.map((user: any) => [
        user._id.toString(),
        user.fullName ||
          [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
          "Customer",
      ])
    );

    return reviews.map((review: any) => ({
      id: review._id.toString(),
      userId: review.userId.toString(),
      orderId: review.orderId?.toString?.() || "",
      rating: Number(review.rating || 0),
      comment: review.comment || "",
      userName: userMap.get(review.userId.toString()) || "Customer",
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
  }

  private async enrichProduct(product: any, includeReviews = false): Promise<any> {
    if (!product) {
      return null;
    }

    const plainProduct =
      typeof product.toObject === "function" ? product.toObject() : product;
    const productId = plainProduct._id?.toString?.() || "";
    const [reviewStats, reviews] = await Promise.all([
      this.buildReviewStats([productId]),
      includeReviews ? this.buildReviewDetails(productId) : Promise.resolve([]),
    ]);
    const stats = reviewStats.get(productId);

    return {
      ...plainProduct,
      rating: stats?.rating || 0,
      reviewCount: stats?.reviewCount || 0,
      reviews,
    };
  }

  async createProduct(data: createProductDTO): Promise<IProduct> {
    const productModel = ProductModel.getModel();
    const newProduct = new productModel(data);
    return await newProduct.save();
  }

  async getAllProducts(
    filters?: FilterProductDTO
  ): Promise<PaginatedResult<any>> {
    const productModel = ProductModel.getModel();

    // Build query object
    const query: any = {};

    // Text filters (partial match, case-insensitive)
    if (filters?.name) {
      query.name = { $regex: filters.name, $options: "i" };
    }
    if (filters?.brand) {
      query.brand = { $regex: filters.brand, $options: "i" };
    }
    if (filters?.category) {
      query.category = { $regex: filters.category, $options: "i" };
    }
    if (filters?.status) {
      query.status = filters.status;
    }

    // Filter by variant properties
    if (filters?.size) {
      query["variants.size"] = filters.size;
    }
    if (filters?.color) {
      query["variants.color"] = { $regex: filters.color, $options: "i" };
    }

    // Price range filter
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query["variants.price"] = {};
      if (filters?.minPrice !== undefined) {
        query["variants.price"].$gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        query["variants.price"].$lte = filters.maxPrice;
      }
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    // Execute query with pagination
    const [products, total] = await Promise.all([
      productModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      productModel.countDocuments(query).exec(),
    ]);

    const reviewStats = await this.buildReviewStats(
      products.map((product) => product._id.toString())
    );

    return {
      data: products.map((product) => {
        const plainProduct = product.toObject();
        const stats = reviewStats.get(product._id.toString());

        return {
          ...plainProduct,
          rating: stats?.rating || 0,
          reviewCount: stats?.reviewCount || 0,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string): Promise<any> {
    const productModel = ProductModel.getModel();
    const product = await productModel
      .findOne(this.buildProductLookupQuery(id))
      .exec();
    return this.enrichProduct(product, true);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct> {
    const productModel = ProductModel.getModel();
    const updatedProduct = await productModel
      .findOneAndUpdate(this.buildProductLookupQuery(id), data, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedProduct) {
      throw new Error("Product not found");
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const productModel = ProductModel.getModel();
    const deletedProduct = await productModel
      .findOneAndDelete(this.buildProductLookupQuery(id))
      .exec();

    if (!deletedProduct) {
      throw new Error("Product not found");
    }
  }
}

export default ProductServiceImpl;
