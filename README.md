<div align="center">

<img src="https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png" width="90" height="90" style="border-radius:20px" />

<br/>

<h1>
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=36&pause=1000&color=FF8C42&center=true&vCenter=true&width=500&lines=PrimeHive+🐝;Full-Stack+E-Commerce;Built+for+Scale" alt="PrimeHive" />
</h1>

<p align="center">
  <strong>A production-ready, full-stack e-commerce platform with multi-role management, real-time delivery tracking, and a complete order lifecycle.</strong>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Razorpay-Payment-02042B?style=for-the-badge&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Sentry-Monitoring-362D59?style=for-the-badge&logo=sentry&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-Animation-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
</p>

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

</div>

<br/>

## ✨ What is PrimeHive?

PrimeHive is a **multi-vendor e-commerce platform** built from the ground up with a focus on real-world production requirements. It supports the complete journey — from a customer browsing products to a delivery partner completing a return pickup.

<br/>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=800&color=FF6B2B&center=true&vCenter=true&width=600&lines=🛍️+Storefront+%2B+Cart+%2B+Checkout;👑+Super+Admin+%2B+Staff+%2B+Admin+Staff;🚚+Delivery+Partner+Panel;💳+Razorpay+%2B+COD+Payments;📦+Full+Order+%26+Return+Lifecycle;🔔+Real-time+Notifications+%26+Emails" alt="Features" />
</div>

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 🏗️ Architecture

```
PrimeHive/
├── client/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   │   ├── Admin/       # Admin panel components
│   │   │   ├── Delivery/    # Delivery panel components
│   │   │   └── Storefront/  # Customer-facing components
│   │   ├── pages/
│   │   │   ├── Admin/       # Admin pages
│   │   │   ├── Delivery/    # Delivery partner pages
│   │   │   └── User/        # Customer pages
│   │   ├── services/        # API service layer
│   │   ├── context/         # React context providers
│   │   └── hooks/           # Custom hooks
│
└── server/                  # Node.js + Express + TypeScript
    └── src/
        ├── controllers/     # Route handlers
        │   ├── admin/       # Admin controllers
        │   ├── delivery/    # Delivery controllers
        │   └── storefront/  # Customer controllers
        ├── models/          # Mongoose models
        ├── routes/          # Express routers
        ├── middleware/      # Auth, permissions, validation
        ├── utils/           # Email, helpers, auto-assign
        └── jobs/            # Background jobs
```

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 👥 User Roles

| Role | Access |
|------|--------|
| 🛍️ **Customer** | Browse, cart, checkout, orders, returns, wishlist |
| 👑 **Super Admin** | Full platform control, staff management, analytics |
| 🏪 **Staff (Seller)** | Products, categories, orders for their store |
| 🔧 **Admin Staff** | Configurable permissions per module |
| 🚚 **Delivery Partner** | Delivery panel, earnings, return pickups |

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 🚀 Features

<details>
<summary><b>🛍️ Storefront</b></summary>

- Product browsing with search, filters, and categories
- Cart with coupon codes and real-time price calculation
- Checkout with saved addresses (logged-in) or guest checkout
- Razorpay payment with 5-minute timeout + COD
- Order tracking with live timeline updates
- Refund requests with full return lifecycle
- Wishlist, reviews, and account management

</details>

<details>
<summary><b>👑 Admin Panel</b></summary>

- Dashboard with revenue charts, low stock alerts, order stats
- Product & category management with bulk import/export
- Order management with auto delivery assignment
- Customer, staff, and admin staff management
- Granular permission system per admin staff member
- Returns & refund approval workflow
- Offers, coupons, and review moderation
- Audit log and advanced analytics

</details>

<details>
<summary><b>🚚 Delivery Partner Panel</b></summary>

- Mobile-first PWA-style interface with dark mode
- Online/Offline toggle synced to backend
- Real-time order assignment with Accept/Reject
- OTP-verified delivery confirmation
- Return pickup workflow (Accept → Pickup → Return to Seller)
- Earnings dashboard with full delivery history
- Notifications, support, and report issue

</details>

<details>
<summary><b>📧 Email System</b></summary>

- Customer order confirmation, status updates, OTP
- Staff new order notifications (per-seller routing)
- Delivery partner assignment notifications
- Refund approval/rejection emails
- Welcome emails with secure password setup links

</details>

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Framer Motion | Animations |
| Bootstrap 5 | Layout utilities |
| Lucide React | Icons |
| Axios | HTTP client |
| React Router v6 | Routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server framework |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| Redis | Session/cache |
| JWT + Cookies | Authentication |
| Nodemailer | Email delivery |
| Cloudinary | Image storage |
| Razorpay | Payment gateway |
| Sentry | Error monitoring |

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional but recommended)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/primehive.git
cd primehive
```

### 2. Setup the server

```bash
cd server
npm install
cp .env.example .env.development
# Fill in your environment variables
npm run dev
```

### 3. Setup the client

```bash
cd client
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 🔐 Environment Variables

### Server (`server/.env.development`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/primehive
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 📦 Order Lifecycle

```
Customer Places Order
        │
        ▼
   [Pending] ──── Razorpay ────► [Paid] ──► Stock deducted
        │                                         │
        │ COD                                     │
        ▼                                         ▼
  Stock deducted                    Auto-assign Delivery Partner
        │                                         │
        └──────────────────┬──────────────────────┘
                           ▼
                    [Processing] ← Delivery Partner Accepts
                           │
                           ▼
                      [Shipped] ← Out for Delivery
                           │
                           ▼
                     [Delivered] ← OTP Verified
                           │
                    Customer requests refund?
                           │
                           ▼
                   [Refund Requested]
                           │
                    Admin approves?
                           │
                           ▼
                   [Refund Accepted]
                           │
                    Return Pickup Assigned
                           │
                           ▼
                  Delivery Partner Picks Up
                           │
                           ▼
                  Returned to Seller Store
                           │
                           ▼
                      [Refunded] ✅
```

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 🔒 Security

- JWT access tokens + HTTP-only refresh token cookies
- Rate limiting on all routes (auth, admin, storefront)
- NoSQL injection sanitization on all inputs
- HMAC-SHA256 Razorpay signature verification
- Role-based access control with granular permissions
- Password hashing with bcrypt (12 rounds)
- Helmet.js security headers

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

## 📊 API Overview

| Base Path | Description |
|-----------|-------------|
| `/api/v1/auth` | Authentication (login, signup, refresh) |
| `/api/v1/products` | Product catalog |
| `/api/v1/orders` | Customer orders |
| `/api/v1/payments` | Razorpay integration |
| `/api/v1/admin/*` | Admin management endpoints |
| `/api/v1/delivery/*` | Delivery partner endpoints |
| `/api/v1/settings` | Public store settings |

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

<div align="center">

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1000&color=FF8C42&center=true&vCenter=true&width=500&lines=Built+with+❤️+by+the+PrimeHive+Team;Production-Ready+%7C+Scalable+%7C+Secure" alt="Footer" />

<br/>

<p>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=flat-square" />
</p>

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

</div>
