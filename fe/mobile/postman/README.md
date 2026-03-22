# Postman Setup

Files:
- `postman/The-Fashion-App.postman_collection.json`
- `postman/The-Fashion-App.local.postman_environment.json`

## Import
1. Open Postman.
2. Import both files.
3. Select environment **The Fashion App - Local**.

## Suggested run order
1. `Auth -> Register`
2. `Auth -> Login` (auto-saves `accessToken` and `refreshToken`)
3. `Products -> Create Product` (auto-saves `productId`, `mongoProductId`, `variantId`)
4. `Orders -> Create Order` (auto-saves `orderId`)
5. `Payments -> Create Payment` (auto-saves `paymentId`)

## Notes
- `src/server.ts` currently mounts: `auth`, `otp`, `wishlist`.
- `src/app.ts` currently mounts: `auth`, `otp`, `products`, `cart`, `order`, `payment`.
- Wishlist requests are included in the collection but only work when the server entrypoint mounts `wishlist`.
- `DELETE /api/v1/wishlist` appears inconsistent in current code (route has no param, validator expects `productId` param).
