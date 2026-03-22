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
const product_service_impl_1 = __importDefault(require("../services/impl/product.service.impl"));
class ProductController {
    constructor() {
        this.createProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productService.createProduct(req.body);
                res.status(201).json({
                    success: true,
                    message: "Product created successfully",
                    data: product,
                });
            }
            catch (error) {
                console.error("Error creating product:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal Server Error" });
            }
        });
        this.getAllProducts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const filters = {
                    name: req.query.name,
                    brand: req.query.brand,
                    category: req.query.category,
                    status: req.query.status,
                    size: req.query.size,
                    color: req.query.color,
                    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                    page: req.query.page ? Number(req.query.page) : 1,
                    limit: req.query.limit ? Number(req.query.limit) : 10,
                    sortBy: req.query.sortBy,
                    sortOrder: req.query.sortOrder,
                };
                const result = yield this.productService.getAllProducts(filters);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    message: "Products fetched successfully",
                });
            }
            catch (error) {
                console.error("Error fetching products:", error);
                res.status(500).json({
                    success: false,
                    message: error.message || "Internal Server Error",
                });
            }
        });
        this.getProductById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (typeof id !== "string") {
                    res.status(400).json({ success: false, message: "Invalid id input." });
                    return;
                }
                const product = yield this.productService.getProductById(id);
                if (!product) {
                    res.status(404).json({ success: false, message: "Product not found" });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: product,
                    message: "Product fetched successfully",
                });
            }
            catch (error) {
                console.error("Error fetching product by id:", error);
                res.status(500).json({
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
                });
            }
        });
        this.updateProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (typeof id !== "string") {
                    res.status(400).json({ success: false, message: "Invalid id input." });
                    return;
                }
                const updatedProduct = yield this.productService.updateProduct(id, req.body);
                res.status(200).json({
                    success: true,
                    data: updatedProduct,
                    message: "Product updated successfully",
                });
            }
            catch (error) {
                if ((error === null || error === void 0 ? void 0 : error.message) === "Product not found") {
                    res.status(404).json({ success: false, message: "Product not found" });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
                });
            }
        });
        this.deleteProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (typeof id !== "string") {
                    res.status(400).json({ success: false, message: "Invalid id input." });
                    return;
                }
                yield this.productService.deleteProduct(id);
                res
                    .status(200)
                    .json({ success: true, message: "Product deleted successfully" });
            }
            catch (error) {
                if ((error === null || error === void 0 ? void 0 : error.message) === "Product not found") {
                    res.status(404).json({ success: false, message: "Product not found" });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
                });
            }
        });
        this.productService = new product_service_impl_1.default();
    }
}
exports.default = new ProductController();
