import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "The Fashion App API",
      version: "1.0.0",
      description: "API documentation for The Fashion App backend",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Auth
        RegisterRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: { type: "string", example: "john_doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", example: "password123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", example: "password123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
                refreshToken: { type: "string" },
              },
            },
          },
        },
        // Product
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            category: { type: "string" },
            images: { type: "array", items: { type: "string" } },
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  size: { type: "string" },
                  color: { type: "string" },
                  stock: { type: "number" },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateProductRequest: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string", example: "Blue T-Shirt" },
            description: {
              type: "string",
              example: "A comfortable blue t-shirt",
            },
            price: { type: "number", example: 29.99 },
            category: { type: "string", example: "T-Shirts" },
            images: { type: "array", items: { type: "string" } },
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  size: { type: "string", example: "M" },
                  color: { type: "string", example: "Blue" },
                  stock: { type: "number", example: 50 },
                },
              },
            },
          },
        },
        // Cart
        AddToCartRequest: {
          type: "object",
          required: ["userId", "productId", "quantity"],
          properties: {
            userId: { type: "string", example: "64abc..." },
            productId: { type: "string", example: "64def..." },
            variantId: { type: "string", example: "64ghi..." },
            quantity: { type: "number", example: 1 },
          },
        },
        // Order
        OrderItem: {
          type: "object",
          required: [
            "productId",
            "variantId",
            "size",
            "color",
            "price",
            "quantity",
            "productName",
          ],
          properties: {
            productId: { type: "string" },
            variantId: { type: "string" },
            size: { type: "string" },
            color: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" },
            productName: { type: "string" },
          },
        },
        CreateOrderRequest: {
          type: "object",
          required: ["userId", "item", "delivery"],
          properties: {
            userId: { type: "string", example: "64abc..." },
            item: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            delivery: {
              type: "object",
              properties: {
                courier: { type: "string", example: "DHL" },
                address: {
                  type: "object",
                  properties: {
                    street: { type: "string", example: "123 Main St" },
                    city: { type: "string", example: "Phnom Penh" },
                    state: { type: "string", example: "Phnom Penh" },
                    postalCode: { type: "string", example: "12000" },
                    country: { type: "string", example: "Cambodia" },
                    location: {
                      type: "object",
                      properties: {
                        coordinates: {
                          type: "array",
                          items: { type: "number" },
                          example: [104.9282, 11.5564],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            orderNumber: { type: "string" },
            userId: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number" },
            orderStatus: {
              type: "string",
              enum: ["pending", "shipped", "delivered", "cancelled"],
            },
            paymentStatus: {
              type: "string",
              enum: ["pending", "completed", "failed"],
            },
            delivery: { type: "object" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // Payment
        CreatePaymentRequest: {
          type: "object",
          required: ["orderId", "amount", "currency"],
          properties: {
            orderId: { type: "string", example: "64abc..." },
            amount: { type: "number", example: 50.0 },
            currency: { type: "string", example: "USD" },
          },
        },
        // OTP
        SendOtpRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["email", "code"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            code: { type: "string", example: "123456" },
          },
        },
        // Common
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Successfully" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "array", items: {} },
            total: { type: "number" },
            page: { type: "number" },
            limit: { type: "number" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
