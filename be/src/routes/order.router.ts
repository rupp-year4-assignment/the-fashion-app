import { Router } from "express";
import orderController   from "@controllers/order.controller";
import { hasRoles } from "@middlewares/hasRoles.middleware";
const route = Router();

route.post("/order" , orderController.createOrder);
route.get("/order" , hasRoles("admin"), orderController.getAllOrders);
route.get("/order/:id" , orderController.getOrdetById)
route.get("/order/users/:id", orderController.getOrderByUser);

export default route;
