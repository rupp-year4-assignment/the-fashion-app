import { CreateOrderDTO } from "@dtos/request/order.request";
import { IOrder } from "@models/orders";

export default interface OrderService {
    createOrder(data: CreateOrderDTO ): Promise<CreateOrderDTO>
    getOrderById(orderId: string): Promise<IOrder>;
    getAllOrders(page?: number, limit?: number): Promise<{
        data: IOrder[];
        total: number;
        page: number;
        limit: number;
    }>;
    getOrderByUser(userId: string):Promise<IOrder[]>;
}