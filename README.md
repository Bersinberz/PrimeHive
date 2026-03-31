<div align="center">

<img src="https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png" width="90" height="90" />

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=38&pause=1000&color=FF8C42&center=true&vCenter=true&width=520&lines=PrimeHive+%F0%9F%90%9D;Full-Stack+E-Commerce;Built+for+Scale" alt="PrimeHive" />

<br/>

**A production-ready, full-stack e-commerce platform with multi-role management, real-time delivery tracking, Razorpay payments, and a complete order lifecycle.**

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-02042B?style=for-the-badge&logo=razorpay&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?style=for-the-badge&logo=sentry&logoColor=white)
![Framer](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=for-the-badge&logo=framer&logoColor=white)

</div>

---

## ✨ What is PrimeHive?

PrimeHive is a **multi-vendor e-commerce platform** built from the ground up with a focus on real-world production requirements. It supports the complete journey — from a customer browsing products and paying via **Razorpay** or COD, to a delivery partner completing a return pickup back to the seller's store.

---

## 🏗️ Architecture

```
PrimeHive/
├── client/                  # React + TypeScript + Vite
│   └── src/
│       ├── components/      # Admin / Delivery / Storefront UI
│       ├── pages/           # Admin / Delivery / User pages
│       ├── services/        # Axios API layer
│       ├── context/         # Auth, Cart, Settings, Toast
│       └── hooks/           # Custom hooks
│
└── server/                  # Node.js + Express + TypeScript
    └── src/
        ├── controllers/     # Admin / Delivery / Storefront
        ├── models/          # Mongoose schemas
        ├── routes/          # Express routers
        ├── middleware/       # Auth, permissions, validation
        ├── utils/           # Email, auto-assign, helpers
        └── jobs/            # Background jobs (purge, etc.)
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| 🛍️ **Customer** | Browse, cart, checkout (Razorpay / COD), orders, returns, wishlist |
| 👑 **Super Admin** | Full platform control, staff management, analytics, audit log |
| 🏪 **Staff (Seller)** | Products, categories, orders for their own store |
| 🔧 **Admin Staff** | Configurable module-level permissions |
| 🚚 **Delivery Partner** | Delivery panel, earnings, return pickups |

---

## 🚀 Features

### 🛍️ Storefront
- Product browsing with search, filters, and categories
- Cart with coupon codes and real-time price calculation
- Checkout with saved addresses or guest checkout
- **Razorpay** payment gateway with 5-minute timeout — if payment is not completed, the order is automatically cancelled and stock is restored
- Cash on Delivery (COD) support
- Order tracking with live timeline (Order Placed → Picked Up → Out for Delivery → Delivered)
- Refund requests with full return lifecycle
- Wishlist, product reviews, and account management

### 👑 Admin Panel
- Dashboard with revenue charts, low stock alerts, and order stats
- Product & category management with bulk CSV import/export
- Order management with automatic delivery partner assignment
- Customer, staff, and admin staff management with granular permissions
- Returns & refund approval — triggers return pickup assignment on approval
- Offers, coupons, and review moderation
- Audit log and advanced analytics

### 💳 Razorpay Integration
- Razorpay order created on checkout — **no stock deducted until payment is verified**
- HMAC-SHA256 signature verification on every payment
- 5-minute frontend countdown timer — auto-cancels order on timeout
- Customer confirmation email sent only after successful payment
- Staff notification email sent only after successful payment
- Delivery partner assigned only after successful payment

### 🚚 Delivery Partner Panel
- Mobile-first interface with dark mode and online/offline toggle
- Real-time order assignment with Accept / Reject
- OTP-verified delivery confirmation (OTP sent to customer email)
- Return pickup workflow: Accept → Pickup from Customer → Return to Seller Store
- Earnings dashboard with full delivery history
- Settings, support, report issue, and privacy policy

### 📧 Email System
- Customer: order confirmation, status updates, delivery OTP, refund approval
- Staff (Seller): new order notification routed per seller
- Delivery partner: new order assignment notification
- Refund approved/rejected emails to customer
- Welcome emails with secure password setup links (24-hour expiry)

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool |
| Framer Motion | Page & component animations |
| Bootstrap 5 | Layout utilities |
| Lucide React | Icon library |
| Axios | HTTP client |
| React Router v6 | Client-side routing |

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server framework |
| TypeScript | Type safety across the stack |
| MongoDB + Mongoose | Primary database |
| Redis | Session cache (optional) |
| JWT + HTTP-only Cookies | Authentication |
| Nodemailer | Transactional email |
| Cloudinary | Image & media storage |
| **Razorpay** | Payment gateway |
| Sentry | Error monitoring & tracing |

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional)
- Razorpay account (test keys work fine)

### 1. Clone

```bash
git clone https://github.com/your-username/primehive.git
cd primehive
```

### 2. Server setup

```bash
cd server
npm install
cp .env.example .env.development
# Fill in your environment variables (see below)
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

## 🔐 Environment Variables

### Server — `server/.env.development`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/primehive
JWT_SECRET=your_jwt_secret_here
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
SENTRY_DSN=https://your_sentry_dsn
```

### Client — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 📦 Order Lifecycle

```
Customer Places Order
        │
        ├── COD ──────────────────────────────────────────────────────┐
        │                                                              │
        └── Razorpay ──► 5-min timer ──► Payment verified             │
                              │                                        │
                         Timeout? ──► Order Cancelled                  │
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
                                                         Customer requests refund?
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

## 🔒 Security

- JWT access tokens + HTTP-only refresh token cookies
- Rate limiting on all route groups (auth, admin, storefront)
- NoSQL injection sanitization on `req.body` and `req.query`
- **Razorpay HMAC-SHA256 signature verification** on every payment
- Role-based access control with granular per-module permissions
- Password hashing with bcrypt (12 rounds)
- Helmet.js security headers on all responses

---

## 📡 API Overview

| Base Path | Description |
|-----------|-------------|
| `POST /api/v1/auth/login` | Login (all roles) |
| `GET /api/v1/products` | Public product catalog |
| `POST /api/v1/orders` | Place order (COD or Razorpay draft) |
| `POST /api/v1/payments/create-order` | Create Razorpay order |
| `POST /api/v1/payments/verify` | Verify Razorpay payment |
| `POST /api/v1/payments/expire` | Cancel timed-out Razorpay order |
| `GET /api/v1/admin/orders` | Admin order management |
| `GET /api/v1/delivery/orders` | Delivery partner orders |
| `GET /api/v1/delivery/returns` | Delivery partner return pickups |
| `GET /api/v1/delivery/earnings` | Delivery partner earnings |

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
