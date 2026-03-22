# The Fashion App

Single-vendor fashion e-commerce platform with a Flutter customer app, Express/MongoDB backend, and Next.js admin dashboard.

## Overview

The Fashion App is a full-stack project designed to cover the end-to-end commerce flow for one store:

- Customer journey on mobile: onboarding, auth, product discovery, cart, checkout, payment, tracking, reviews.
- Store operations on web admin: dashboard, product/category/order/customer/payment management.
- Central backend API powering both clients.

## Project Structure

```text
.
├── be/                         # Backend (Node.js + Express + TypeScript + MongoDB)
├── fe/
│   ├── mobile/                 # Customer app (Flutter)
│   └── web-admin/
│       └── nextjs-version/     # Admin dashboard (Next.js + Shadcn UI)
└── flow.excalidraw             # Architecture diagram
```

## Core Features

### Customer App (Flutter)

- Email/password authentication
- Social login (Google/Facebook)
- OTP email verification in register flow
- Product listing, detail, variants, colors/sizes
- Wishlist and cart
- Stripe Checkout (test mode)
- Order placement and tracking
- Product rating/review
- Profile, addresses, and account settings

### Admin Dashboard (Next.js)

- Admin sign-in with role-based access
- Dashboard metrics and operational overview
- Product CRUD
- Category CRUD
- Order management and status updates
- Customer management views
- Payment list/status monitoring

### Backend API (Express)

- JWT-based auth + refresh token flow
- OTP send/verify endpoints with email-bound verification
- Stripe Checkout session + webhook handling
- MongoDB models for users/products/orders/payments/reviews
- Redis-backed OTP storage (with in-memory fallback)
- File upload/local media serving (`/uploads`)

## Technology Stack

- Backend: `Node.js`, `Express`, `TypeScript`, `MongoDB`, `Mongoose`, `Redis`, `Stripe`, `Nodemailer`
- Mobile: `Flutter`, `Riverpod`, `http`, `flutter_map`
- Admin Web: `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Shadcn UI`, `Radix UI`

## Architecture

High-level architecture diagram:

- [flow.excalidraw](./flow.excalidraw)

Flow summary:

1. Mobile app and admin dashboard call the backend API.
2. Backend persists business data in MongoDB.
3. OTP verification uses Redis (or memory fallback when Redis unavailable).
4. Stripe Checkout + webhook finalize payment status.
5. Backend returns synchronized state to both mobile and admin.

## Prerequisites

- `Node.js` 18+
- `npm` 9+
- `bun` (required by backend dev scripts)
- `Flutter` 3.x + Dart SDK
- `MongoDB` instance
- `Docker` (optional, for local Redis)

## Environment Configuration

### Backend (`be/.env`)

Use `be/.env.example` as base.

Minimum practical variables for local development:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/theFashionAppDB
MONGO_AUTH_DB=admin
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_APP_USERNAME=your_email@gmail.com
MAIL_APP_PASSWORD=your_app_password

CLIENT_URL=http://localhost:3000
APP_RETURN_SCHEME=fashionapp

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Notes:

- The backend currently reads `MONGO_URI` (not `MONGODB_URI`).
- OTP verification requires SMTP credentials to actually send emails.
- Stripe integration is test-mode oriented in current setup.

### Mobile (`fe/mobile/.env`)

```env
API_BASE_URL=http://10.0.2.2:3000/api/v1
ROUTING_BASE_URL=https://router.project-osrm.org
ROUTING_PROFILE=driving
ROUTING_TIMEOUT_SECONDS=12
```

Use `10.0.2.2` for Android emulator, or your LAN IP for physical devices.

### Admin Web (`fe/web-admin/nextjs-version/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Quick Start

### 1) Backend

```bash
cd be
npm install
npm run redis:up
npm run dev:local-redis
```

Alternative without local Redis container:

```bash
cd be
npm install
npm run dev
```

### 2) Mobile App

```bash
cd fe/mobile
flutter pub get
flutter run
```

### 3) Web Admin

```bash
cd fe/web-admin/nextjs-version
npm install
npm run dev -- --port 3001
```

Open: `http://localhost:3001/sign-in`

## Useful Scripts

### Backend (`be/package.json`)

- `bun run dev` - run backend in watch mode
- `bun run dev:local-redis` - run backend with local Redis env override
- `bun run build` - compile TypeScript
- `bun run start` - build + start compiled server
- `bun run redis:up` - start Redis container
- `bun run redis:down` - stop Redis container
- `bun run seed:catalog` - seed categories/products
- `bun run localize:product-images` - localize product images

### Admin (`fe/web-admin/nextjs-version/package.json`)

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

### Mobile

- `flutter analyze`
- `flutter test`
- `flutter run`

## API Docs

Swagger is available when backend is running:

- `http://localhost:3000/api-docs`

## Payment Notes (Stripe)

- Uses Stripe Checkout Session in test mode.
- Payment confirmation is webhook-driven, not frontend redirect-driven.
- For local webhook testing, run Stripe CLI forwarding to:
  - `POST /api/v1/payments/webhook`

## Known Scope

- Single-vendor architecture (not marketplace).
- Local file upload/storage currently used for media.
- Some template/demo pages remain in the admin project, while operational pages are integrated with this backend.

## Contributing

1. Create a feature branch.
2. Keep changes scoped by module (`be`, `fe/mobile`, `fe/web-admin`).
3. Run module checks before opening PR:
   - Backend: `npm run build`
   - Mobile: `flutter analyze && flutter test`
   - Admin: `npm run lint && npm run build`
