import { Request, Response } from "express";
import mongoose from "mongoose";
import CategoryModel from "@models/category";
import ProductModel from "@models/product";
import BadRequestException from "@exceptions/badRequest.exception";
import ConflictContentException from "@exceptions/conflictContent.exception";
import NotFoundException from "@exceptions/notFound.exception";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

class CategoryController {
  private categoryModel = CategoryModel.getModel();
  private productModel = ProductModel.getModel();

  private getParamId(req: Request) {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private async buildProductCountMap(names: string[]) {
    if (names.length === 0) {
      return new Map<string, number>();
    }

    const rows = await this.productModel.aggregate([
      {
        $match: {
          category: { $in: names },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    return new Map<string, number>(rows.map((row: any) => [row._id, row.count]));
  }

  list = async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";

    const query: Record<string, unknown> = {};
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.categoryModel.countDocuments(query),
    ]);

    const countMap = await this.buildProductCountMap(categories.map((category) => category.name));

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        status: category.status,
        productCount: countMap.get(category.name) || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  };

  getById = async (req: Request, res: Response) => {
    const id = this.getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid category id.");
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    const countMap = await this.buildProductCountMap([category.name]);

    res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        status: category.status,
        productCount: countMap.get(category.name) || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  };

  create = async (req: Request, res: Response) => {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const slug = toSlug(String(req.body.slug || name));
    const status = req.body.status === "inactive" ? "inactive" : "active";

    const existing = await this.categoryModel.findOne({
      $or: [{ name }, { slug }],
    });
    if (existing) {
      throw new ConflictContentException("Category name or slug already exists.");
    }

    const category = await this.categoryModel.create({ name, slug, description, status });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        status: category.status,
        productCount: 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  };

  update = async (req: Request, res: Response) => {
    const id = this.getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid category id.");
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    const name = typeof req.body.name === "string" ? req.body.name.trim() : category.name;
    const slug = toSlug(typeof req.body.slug === "string" ? req.body.slug : name);
    const description = typeof req.body.description === "string" ? req.body.description.trim() : category.description || "";
    const status = req.body.status === "inactive" ? "inactive" : req.body.status === "active" ? "active" : category.status;

    const duplicate = await this.categoryModel.findOne({
      _id: { $ne: category._id },
      $or: [{ name }, { slug }],
    });
    if (duplicate) {
      throw new ConflictContentException("Category name or slug already exists.");
    }

    category.name = name;
    category.slug = slug;
    category.description = description;
    category.status = status;
    await category.save();

    const countMap = await this.buildProductCountMap([category.name]);

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        status: category.status,
        productCount: countMap.get(category.name) || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  };

  remove = async (req: Request, res: Response) => {
    const id = this.getParamId(req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid category id.");
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    const linkedProducts = await this.productModel.countDocuments({ category: category.name });
    if (linkedProducts > 0) {
      throw new BadRequestException("Cannot delete a category that is still used by products.");
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  };
}

export default new CategoryController();
