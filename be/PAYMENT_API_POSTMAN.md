# Payment API - Postman Test Guide

## Base URL

```
http://localhost:3000/api/v1
```

---

## 1. Create Payment

**POST** `/payment`

### Request Body:

```json
{
  "orderId": "676d1234567890abcdef1234",
  "method": "BAKONG",
  "amount": 50000,
  "currency": "KHR"
}
```

### Response (201):

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "676d9876543210fedcba9876", 
    "orderId": "676d1234567890abcdef1234",
    "method": "BAKONG",
    "amount": 50000,
    "currency": "KHR",
    "khqrString": "00020101021229370...",
    "md5Hash": "a1b2c3d4e5f6...",
    "status": "CREATED",
    "paidAt": null,
    "expiresAt": "2025-12-31T08:15:00.000Z",
    "createdAt": "2025-12-31T08:00:00.000Z",
    "updatedAt": "2025-12-31T08:00:00.000Z"
  }
}
```

---

## 2. Get Payment by ID

**GET** `/payment/:paymentId`

### Example:

```
GET /payment/676d9876543210fedcba9876
```

### Response (200):

```json
{
  "success": true,
  "data": {
    "id": "676d9876543210fedcba9876",
    "orderId": "676d1234567890abcdef1234",
    "method": "BAKONG",
    "amount": 50000,
    "currency": "KHR",
    "khqrString": "00020101021229370...",
    "status": "CREATED"
  }
}
```

---

## 3. Get Payment by Order ID

**GET** `/payment/order/:orderId`

### Example:

```
GET /payment/order/676d1234567890abcdef1234
```

---

## 4. Get All Payments

**GET** `/payments`

### Query Parameters (optional):

```
GET /payments?status=CREATED&currency=KHR&minAmount=10000
```

Available filters:

- `status`: CREATED, PENDING, COMPLETED, FAILED, EXPIRED
- `method`: BAKONG
- `minAmount`, `maxAmount`: number
- `startDate`, `endDate`: ISO date string

---

## 5. Update Payment Status

**PATCH** `/payment/:paymentId/status`

### Request Body:

```json
{
  "status": "PENDING"
}
```

### With transaction reference:

```json
{
  "status": "COMPLETED",
  "transactionRef": "BAKONG-TXN-123456",
  "paidAt": "2025-12-31T08:10:00.000Z"
}
```

---

## 6. Complete Payment

**POST** `/payment/:paymentId/complete`

### Request Body:

```json
{
  "transactionRef": "BAKONG-TXN-123456"
}
```

### Response (200):

```json
{
  "success": true,
  "message": "Payment completed successfully",
  "data": {
    "id": "676d9876543210fedcba9876",
    "status": "COMPLETED",
    "transactionRef": "BAKONG-TXN-123456",
    "paidAt": "2025-12-31T08:10:00.000Z"
  }
}
```

---

## 7. Fail Payment

**POST** `/payment/:paymentId/fail`

### Request Body (reason is optional):

```json
{
  "reason": "Insufficient balance"
}
```

Or empty:

```json
{}
```

---

## 8. Expire Payment

**POST** `/payment/:paymentId/expire`

### Request Body:

```json
{}
```

---

## 9. Generate KHQR Only

**POST** `/payment/generate-khqr`

### Request Body:

```json
{
  "amount": 25000,
  "currency": "KHR",
  "orderId": "676d1234567890abcdef1234"
}
```

### Response (200):

```json
{
  "success": true,
  "data": {
    "khqrString": "00020101021229370010A000000324010..."
  }
}
```

---

## 10. Verify Payment

**POST** `/payment/verify`

### Request Body:

```json
{
  "khqrString": "00020101021229370010A000000324010...",
  "transactionRef": "BAKONG-TXN-123456",
  "orderId": "676d1234567890abcdef1234"
}
```

### Response (200):

```json
{
  "success": true,
  "verified": true
}
```

---

## 11. Check Expired Payments (Cron Job)

**POST** `/payment/check-expired`

### Request Body:

```json
{}
```

### Response (200):

```json
{
  "success": true,
  "message": "Expired payments checked and updated"
}
```

---

## Testing Flow

### Step 1: Create an Order First

You need a valid order ID. Create an order using your order API:

```
POST /api/v1/order
```

### Step 2: Create Payment

Use the order ID from step 1:

```json
{
  "orderId": "YOUR_ORDER_ID_HERE",
  "method": "BAKONG",
  "amount": 50000,
  "currency": "KHR"
}
```

### Step 3: Get Payment Details

```
GET /payment/{paymentId}
```

### Step 4: Verify Payment

```json
{
  "khqrString": "COPY_FROM_CREATE_RESPONSE",
  "transactionRef": "BAKONG-TXN-123456",
  "orderId": "YOUR_ORDER_ID"
}
```

### Step 5: Complete Payment

```json
{
  "transactionRef": "BAKONG-TXN-123456"
}
```

---

## Important Notes

1. **Order ID Format**: Must be a valid 24-character MongoDB ObjectID
2. **Currency**: Only "KHR" or "USD" accepted
3. **Amount**: Number (decimals for USD, whole numbers for KHR)
4. **KHQR**: Generated as STATIC QR (no pre-filled amount) to avoid expiration issues
5. **Status Flow**: CREATED → PENDING → COMPLETED (or FAILED/EXPIRED)

---

## Error Responses

### 404 Not Found:

```json
{
  "success": false,
  "message": "Payment not found"
}
```

### 500 Internal Server Error:

```json
{
  "success": false,
  "message": "Failed to generate KHQR: ..."
}
```

### Example:

```
GET /payment/order/676d1234567890abcdef1234
```

---

## 4. Get All Payments (with filters)

**GET** `/payments`

### Query Parameters (all optional):

```
GET /payments?status=CREATED&currency=KHR&minAmount=10000&maxAmount=100000
```

### Available Filters:

- `status`: CREATED | PENDING | COMPLETED | FAILED | EXPIRED
- `method`: BAKONG
- `minAmount`: number
- `maxAmount`: number
- `startDate`: ISO date string
- `endDate`: ISO date string

### Response (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "676d9876543210fedcba9876",
      "orderId": "676d1234567890abcdef1234",
      "method": "BAKONG",
      "amount": 50000,
      "currency": "KHR",
      "status": "CREATED",
      ...
    }
  ]
}
```

---

## 5. Update Payment Status

**PATCH** `/payment/:paymentId/status`

### Request Body:

```json
{
  "status": "PENDING"
}
```

### With transaction reference:

```json
{
  "status": "COMPLETED",
  "transactionRef": "BAKONG-TXN-123456",
  "paidAt": "2025-12-30T08:10:00.000Z"
}
```

### Available Status Values:

- PENDING
- COMPLETED
- FAILED
- EXPIRED

---

## 6. Complete Payment

**POST** `/payment/:paymentId/complete`

### Request Body:

```json
{
  "transactionRef": "BAKONG-TXN-123456"
}
```

### Response (200):

```json
{
  "success": true,
  "message": "Payment completed successfully",
  "data": {
    "id": "676d9876543210fedcba9876",
    "status": "COMPLETED",
    "transactionRef": "BAKONG-TXN-123456",
    "paidAt": "2025-12-30T08:10:00.000Z",
    ...
  }
}
```

---

## 7. Fail Payment

**POST** `/payment/:paymentId/fail`

### Request Body (optional reason):

```json
{
  "reason": "Insufficient balance"
}
```

### Or just empty:

```json
{}
```

---

## 8. Expire Payment

**POST** `/payment/:paymentId/expire`

### Request Body:

```json
{}
```

---

## 9. Generate KHQR Only

**POST** `/payment/generate-khqr`

### Request Body:

```json
{
  "amount": 25000,
  "currency": "KHR",
  "orderId": "676d1234567890abcdef1234"
}
```

### Response (200):

```json
{
  "success": true,
  "data": {
    "khqrString": "00020101021229370010A000000324010..."
  }
}
```

---

## 10. Verify Payment

**POST** `/payment/verify`

### Request Body:

```json
{
  "transactionRef": "BAKONG-TXN-123456",
  "orderId": "676d1234567890abcdef1234"
}
```

### Response (200):

```json
{
  "success": true,
  "verified": true
}
```

---

## 11. Check Expired Payments (Cron Job)

**POST** `/payment/check-expired`

### Request Body:

```json
{}
```

### Response (200):

```json
{
  "success": true,
  "message": "Expired payments checked and updated"
}
```

---

## Error Responses

### 404 Not Found:

```json
{
  "success": false,
  "message": "Payment not found"
}
```

### 500 Internal Server Error:

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Notes:

1. Replace `676d1234567890abcdef1234` with actual MongoDB ObjectIDs
2. Make sure you have created an order first before creating a payment
3. The `orderId` must be a valid 24-character hex string (MongoDB ObjectID)
4. Currency must be either "KHR" or "USD"
5. Amount should be a number (decimals for USD, whole numbers for KHR)
6. The KHQR string is automatically generated by the Bakong SDK
