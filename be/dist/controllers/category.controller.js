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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const category_1 = __importDefault(require("../models/category"));
const product_1 = __importDefault(require("../models/product"));
const badRequest_exception_1 = __importDefault(require("../exceptions/badRequest.exception"));
const conflictContent_exception_1 = __importDefault(require("../exceptions/conflictContent.exception"));
const notFound_exception_1 = __importDefault(require("../exceptions/notFound.exception"));
function toSlug(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
class CategoryController {
    constructor() {
        this.categoryModel = category_1.default.getModel();
        this.productModel = product_1.default.getModel();
        this.list = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.max(Number(req.query.limit) || 20, 1);
            const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
            const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
            const query = {};
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
            const [categories, total] = yield Promise.all([
                this.categoryModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit),
                this.categoryModel.countDocuments(query),
            ]);
            const countMap = yield this.buildProductCountMap(categories.map((category) => category.name));
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
        });
        this.getById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = this.getParamId(req);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new badRequest_exception_1.default("Invalid category id.");
            }
            const category = yield this.categoryModel.findById(id);
            if (!category) {
                throw new notFound_exception_1.default("Category not found.");
            }
            const countMap = yield this.buildProductCountMap([category.name]);
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
        });
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const name = String(req.body.name || "").trim();
            const description = String(req.body.description || "").trim();
            const slug = toSlug(String(req.body.slug || name));
            const status = req.body.status === "inactive" ? "inactive" : "active";
            const existing = yield this.categoryModel.findOne({
                $or: [{ name }, { slug }],
            });
            if (existing) {
                throw new conflictContent_exception_1.default("Category name or slug already exists.");
            }
            const category = yield this.categoryModel.create({ name, slug, description, status });
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
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = this.getParamId(req);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new badRequest_exception_1.default("Invalid category id.");
            }
            const category = yield this.categoryModel.findById(id);
            if (!category) {
                throw new notFound_exception_1.default("Category not found.");
            }
            const name = typeof req.body.name === "string" ? req.body.name.trim() : category.name;
            const slug = toSlug(typeof req.body.slug === "string" ? req.body.slug : name);
            const description = typeof req.body.description === "string" ? req.body.description.trim() : category.description || "";
            const status = req.body.status === "inactive" ? "inactive" : req.body.status === "active" ? "active" : category.status;
            const duplicate = yield this.categoryModel.findOne({
                _id: { $ne: category._id },
                $or: [{ name }, { slug }],
            });
            if (duplicate) {
                throw new conflictContent_exception_1.default("Category name or slug already exists.");
            }
            category.name = name;
            category.slug = slug;
            category.description = description;
            category.status = status;
            yield category.save();
            const countMap = yield this.buildProductCountMap([category.name]);
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
        });
        this.remove = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = this.getParamId(req);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new badRequest_exception_1.default("Invalid category id.");
            }
            const category = yield this.categoryModel.findById(id);
            if (!category) {
                throw new notFound_exception_1.default("Category not found.");
            }
            const linkedProducts = yield this.productModel.countDocuments({ category: category.name });
            if (linkedProducts > 0) {
                throw new badRequest_exception_1.default("Cannot delete a category that is still used by products.");
            }
            yield category.deleteOne();
            res.status(200).json({
                success: true,
                message: "Category deleted successfully.",
            });
        });
    }
    getParamId(req) {
        return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    }
    buildProductCountMap(names) {
        return __awaiter(this, void 0, void 0, function* () {
            if (names.length === 0) {
                return new Map();
            }
            const rows = yield this.productModel.aggregate([
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
            return new Map(rows.map((row) => [row._id, row.count]));
        });
    }
}
exports.default = new CategoryController();
