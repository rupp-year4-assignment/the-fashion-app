import { Request, Response } from "express";
import ProductServiceImpl from "@services/impl/product.service.impl";
import { FilterProductDTO } from "dtos/request/products/FilterProductDTO.request";

class ProductController {
  private productService: ProductServiceImpl;

  constructor() {
    this.productService = new ProductServiceImpl();
  }

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: FilterProductDTO = {
        name: req.query.name as string,
        brand: req.query.brand as string,
        category: req.query.category as string,
        status: req.query.status as "available" | "out_of_stock",
        size: req.query.size as string,
        color: req.query.color as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.productService.getAllProducts(filters);
      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        message: "Products fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ success: false, message: "Invalid id input." });
        return;
      }

      const product = await this.productService.getProductById(id);

      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
        message: "Product fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching product by id:", error);
      res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ success: false, message: "Invalid id input." });
        return;
      }

      const updatedProduct = await this.productService.updateProduct(id, req.body);

      res.status(200).json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      });
    } catch (error: any) {
      if (error?.message === "Product not found") {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ success: false, message: "Invalid id input." });
        return;
      }

      await this.productService.deleteProduct(id);
      res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
    } catch (error: any) {
      if (error?.message === "Product not found") {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };
}

export default new ProductController();
