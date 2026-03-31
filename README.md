<div align="center">

<img src="https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png" width="90" height="90" />

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=38&pause=1000&color=FF8C42&center=true&vCenter=true&width=520&lines=PrimeHive+%F0%9F%90%9D;Full-Stack+E-Commerce;Built+for+Scale" alt="PrimeHive" />

<br/>

**A production-ready, full-stack e-commerce platform with multi-role management, real-time delivery tracking, Razorpay payments, and a complete order lifecycle.**

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-02042B?style=for-the-badge&logo=razorpay&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?style=for-the-badge&logo=sentry&logoColor=white)

</div>

---

## What is PrimeHive?

PrimeHive is a **full-stack e-commerce platform** built for real-world production use. It covers the complete journey — from a customer browsing products and paying via **Razorpay** or COD, to a delivery partner completing a return pickup back to the seller's store.

---

## Architecture

```
PrimeHive/
├── client/                  # React 19 + TypeScript + Vite 7
│   └── src/
│       ├── components/      # Admin / Delivery / Storefront UI
│       ├── pages/           # Admin / Delivery / User pages
│       ├── services/        # Axios API layer
│       ├── context/         # Auth, Cart, Settings, Theme, Toast
│       └── hooks/           # Custom hooks (usePermission)
│
├── server/                  # Node.js + Express 5 + TypeScript
│   └── src/
│       ├── controllers/     # Admin / Delivery / Storefront
│       ├── models/          # 14 Mongoose schemas
│       ├── routes/          # Express routers (versioned /api/v1)
│       ├── middleware/       # Auth, permissions, validation, audit
│       ├── config/          # DB, Redis, Cloudinary, Mailer, Sentry
│       ├── utils/           # Email templates, validators, helpers
│       ├── schemas/         # Zod validation schemas
│       ├── jobs/            # Background jobs (purge deleted users)
│       └── types/           # TypeScript definitions
│
├── nginx/                   # Reverse proxy config (SSL, rate limiting)
├── scripts/                 # deploy.sh, mongo-init.js
├── docker-compose.yml       # Production orchestration
├── docker-compose.dev.yml   # Development orchestration
└── Makefile                 # Convenience commands
```

---

## User Roles

| Role | Access |
|------|--------|
| 🛍️ **Customer** | Browse, cart, checkout (Razorpay / COD), orders, returns, wishlist, reviews |
| 👑 **Super Admin** | Full platform control, staff management, analytics, audit log |
| 🏪 **Staff (Seller)** | Products, categories, orders scoped to their own store |
| 🔧 **Admin Staff** | Configurable module-level permissions |
| 🚚 **Delivery Partner** | Delivery panel, earnings, return pickups |

---

## Features

### Storefront
- Product browsing with search, filters, and categories
- Cart with coupon codes and real-time price calculation
- Checkout with saved addresses
- **Razorpay** payment gateway with 5-minute timeout — unpaid orders are auto-cancelled and stock is restored
- Cash on Delivery (COD) support
- Order tracking with live timeline (Placed → Picked Up → Out for Delivery → Delivered)
- Return requests with full return lifecycle
- Wishlist, product reviews, and account management

### Admin Panel
- Dashboard with revenue charts (Recharts), low stock alerts, and order stats
- Product & category management with bulk CSV import/export
- Order management with automatic delivery partner assignment
- Customer, staff, and admin staff management with granular per-module permissions
- Returns & refund approval — triggers return pickup assignment on approval
- Offers, coupons, and review moderation
- Audit log and advanced analytics
- Store profile and settings management

### Razorpay Integration
- Razorpay order created on checkout — **no stock deducted until payment is verified**
- HMAC-SHA256 signature verification on every payment callback
- 5-minute frontend countdown timer — auto-cancels order on timeout
- Confirmation emails sent only after successful payment verification
- Delivery partner assigned only after successful payment

### Delivery Partner Panel
- Mobile-first interface with dark mode and online/offline toggle
- Real-time order assignment with Accept / Reject
- OTP-verified delivery confirmation (OTP sent to customer email)
- Return pickup workflow: Accept → Pickup from Customer → Return to Seller Store
- Earnings dashboard with full delivery history
- Settings, support, report issue, and privacy policy pages

### Email System (Nodemailer)
- Customer: order confirmation, status updates, delivery OTP, refund approval/rejection
- Staff (Seller): new order notification routed per seller
- Delivery partner: new assignment notification
- Welcome emails with secure password setup links (24-hour expiry)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI framework |
| Vite 7 | Build tool |
| React Router v7 | Client-side routing |
| Framer Motion | Page & component animations |
| Bootstrap 5 + Bootstrap Icons | Layout & icons |
| Lucide React | Additional icon library |
| Recharts | Dashboard charts |
| Axios | HTTP client |
| React Avatar Editor | Profile image cropping |
| Sentry (React) | Frontend error monitoring |
| Vitest + Testing Library | Unit & component tests |

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js + Express 5 | Server framework |
| TypeScript | Type safety across the stack |
| MongoDB 7 + Mongoose | Primary database |
| Redis 7 (ioredis) | Session cache |
| JWT + HTTP-only Cookies | Authentication (access + refresh tokens) |
| Nodemailer | Transactional email |
| Cloudinary + Multer | Image & media storage |
| Razorpay | Payment gateway |
| Zod | Request validation schemas |
| Winston + Morgan | Structured logging |
| Helmet.js | Security headers |
| express-rate-limit | Route-level rate limiting |
| bcryptjs (12 rounds) | Password hashing |
| Sentry (Node) | Backend error monitoring & tracing |
| Vitest | Unit tests |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| Docker + Docker Compose | Container orchestration |
| Nginx 1.25 | Reverse proxy, SSL termination, rate limiting |
| MongoDB 7.0 | Database container |
| Redis 7.2 Alpine | Cache container |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional but recommended)
- Razorpay account (test keys work fine)
- Cloudinary account

### 1. Clone

```bash
git clone https://github.com/your-username/primehive.git
cd primehive
```

### 2. Server setup

```bash
cd server
npm install
cp .env.production.example .env.development
# Fill in your environment variables
npm run dev
```

### 3. Client setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

---

## Environment Variables

### Root `.env` (Docker Compose)

```env
MONGO_ROOT_USER=primehive_admin
MONGO_ROOT_PASS=change_this_strong_password
REDIS_PASSWORD=change_this_redis_password
VITE_API_URL=https://yourdomain.com/api/v1
```

### Server `server/.env.development`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/primehive
JWT_SECRET=your_jwt_secret_min_64_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another_long_random_secret
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Sentry (optional)
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
```

### Client `client/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Docker (Production)

```bash
# Configure environment
cp .env.example .env
cp server/.env.production.example server/.env.production
# Edit both files with your values

# Deploy
make deploy
# or
bash scripts/deploy.sh

# Useful commands
make status        # Show running containers
make health        # Check API health
make logs          # Tail all logs
make db-backup     # Backup MongoDB
make rollback      # Rollback to previous version
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full production deployment guide including SSL setup with Let's Encrypt.

---

## Order Lifecycle

```
Customer Places Order
        │
        ├── COD ──────────────────────────────────────────────────────┐
        │                                                              │
        └── Razorpay ──► 5-min timer ──► Payment verified             │
                              │                                        │
                         Timeout? ──► Order Cancelled + Stock Restored │
                                                                       ▼
                                                              Stock deducted
                                                              Cart cleared
                                                              Emails sent
                                                                       │
                                                                       ▼
                                                         Auto-assign Delivery Partner
                                                                       │
                                                         Partner Accepts ──► [Processing]
                                                                       │
                                                         Out for Delivery ──► [Shipped]
                                                                       │
                                                         OTP Verified ──► [Delivered]
                                                                       │
                                                         Customer requests return?
                                                                       │
                                                         Admin approves ──► Email to customer
                                                                       │
                                                         Return pickup auto-assigned
                                                                       │
                                                         Partner picks up from customer
                                                                       │
                                                         Returned to Seller Store ──► [Refunded] ✅
```

---

## Security

- JWT access tokens (15m) + HTTP-only refresh token cookies (7d)
- Rate limiting on all route groups (auth: 10r/m, api: 30r/m via Nginx)
- NoSQL injection sanitization on `req.body` and `req.query`
- Razorpay HMAC-SHA256 signature verification on every payment
- Role-based access control with granular per-module permissions
- Password hashing with bcrypt (12 rounds)
- Helmet.js security headers on all responses
- Zod schema validation on all incoming requests

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/login` | Login (all roles) |
| `GET` | `/api/v1/products` | Public product catalog |
| `POST` | `/api/v1/orders` | Place order (COD or Razorpay draft) |
| `POST` | `/api/v1/payments/create-order` | Create Razorpay order |
| `POST` | `/api/v1/payments/verify` | Verify Razorpay payment |
| `POST` | `/api/v1/payments/expire` | Cancel timed-out Razorpay order |
| `GET` | `/api/v1/admin/orders` | Admin order management |
| `GET` | `/api/v1/admin/stats` | Dashboard analytics |
| `GET` | `/api/v1/delivery/orders` | Delivery partner orders |
| `GET` | `/api/v1/delivery/returns` | Delivery partner return pickups |
| `GET` | `/api/v1/delivery/earnings` | Delivery partner earnings |
| `GET` | `/api/v1/health` | Health check |

---

## Database Models

User · Product · Category · Order · Cart · Address · Return · Review · Coupon · Offer · Wishlist · AuditLog · Settings · Counter

---

<div align="center">

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=15&pause=1000&color=FF8C42&center=true&vCenter=true&width=520&lines=Built+with+%E2%9D%A4%EF%B8%8F+%7C+Production-Ready+%7C+Scalable+%7C+Secure;Razorpay+%7C+MongoDB+%7C+React+%7C+Node.js" alt="footer typing" />

<br/><br/>

![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success.svg?style=flat-square)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B?style=flat-square&logo=razorpay)

</div>
