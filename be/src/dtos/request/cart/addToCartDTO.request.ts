export interface AddToCartDTO {
    userId: string;
    productId: string;
    variantId: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
}