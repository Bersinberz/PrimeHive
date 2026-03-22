# Implementation Plan: Offers & Promotions

## Overview

Implement product-level offers and order-level coupon codes for PrimeHive. Backend uses TypeScript + Express + Mongoose with `verifyToken` / `superAdminOnly` middleware. Frontend uses React + TypeScript + Bootstrap 5 following existing admin page patterns.

## Tasks

- [x] 1. Create Offer and Coupon Mongoose models + extend Order model
  - [x] 1.1 Create `server/src/models/Offer.ts`
    - Define `IOffer` interface: `label`, `discountType` (`percentage` | `fixed`), `discountValue`, `isActive`, optional `startDate`, `endDate`, `productIds` (ObjectId[] ref Product)
    - Add indexes: `{ isActive: 1 }` and `{ productIds: 1 }`
    - _Requirements: 1.1, 1.6_

  - [x] 1.2 Create `server/src/models/Coupon.ts`
    - Define `ICoupon` interface: `code` (unique, uppercase), `discountType`, `discountValue`, optional `minOrderValue`, `usageLimit`, `usageCount` (default 0), `usedBy` (ObjectId[] ref User), optional `expiryDate`, `isActive`
    - Add indexes: `{ code: 1 }` unique and `{ isActive: 1 }`
    - _Requirements: 9.2, 9.7_

  - [x] 1.3 Extend `server/src/models/Order.ts` with coupon fields
    - Add optional `couponCode?: string` and `couponDiscount?: number` to `IOrder` interface and `OrderSchema`
    - _Requirements: 11.6_

  - [ ]* 1.4 Write property test for discount computation formula (Property 7)
    - **Property 7: Discount price computation correctness**
    - For random `price` and valid `discountValue`, verify `percentage` formula: `round(price * (1 - v/100))` and `fixed` formula: `max(0, price - v)`; for coupon: `round(total * v/100)` and `min(v, total)`
    - **Validates: Requirements 6.6, 10.9**

- [x] 2. Implement admin Offer controller and routes
  - [x] 2.1 Create `server/src/controllers/admin/offerController.ts`
    - Implement `validateOfferFields` helper: checks required fields, percentage range 1–99, fixed ≥ 1, endDate > startDate
    - Implement `createOffer`: validate fields, verify all productIds exist, check no product is already in another active offer (409), persist and return 201
    - Implement `getOffers`: return all offers with `productCount`
    - Implement `getOfferById`: return single offer with full `productIds`, 404 if not found
    - Implement `updateOffer`: validate fields, check active-offer conflict for newly added products, persist, 404 if not found
    - Implement `deleteOffer`: remove offer document, 404 if not found
    - _Requirements: 1.1–1.7, 2.1–2.4, 3.1–3.5, 4.1–4.4, 5.1–5.4_

  - [x] 2.2 Create `server/src/routes/admin/offerRoutes.ts`
    - Wire `verifyToken`, `superAdminOnly` on all routes
    - POST `/` → `createOffer`, GET `/` → `getOffers`, GET `/:id` → `getOfferById`, PUT `/:id` → `updateOffer`, DELETE `/:id` → `deleteOffer`
    - _Requirements: 1.7, 2.4, 3.5, 4.4_

  - [ ]* 2.3 Write property test for offer CRUD round-trip (Property 1)
    - **Property 1: Offer CRUD round-trip**
    - Generate random valid offer payloads, create via controller, retrieve by returned ID, assert all fields match
    - **Validates: Requirements 1.6, 2.2, 3.1, 3.3**

  - [ ]* 2.4 Write property test for offer validation rejects invalid inputs (Property 2)
    - **Property 2: Offer validation rejects invalid inputs**
    - Generate payloads with missing required fields, out-of-range discountValue, and endDate ≤ startDate; assert 400 and no persistence
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 3.2**

  - [ ]* 2.5 Write property test for superadmin-only access on offer endpoints (Property 3)
    - **Property 3: Superadmin-only access for offer management**
    - For each offer endpoint, send requests with staff/user/unauthenticated tokens; assert 403 or 401 and no mutation
    - **Validates: Requirements 1.7, 2.4, 3.5, 4.4**

  - [ ]* 2.6 Write property test for one active offer per product invariant (Property 5)
    - **Property 5: One active offer per product invariant**
    - Create two active offers, attempt to assign the same productId to both; assert 409 on second assignment
    - **Validates: Requirement 5.4**

- [x] 3. Implement admin Coupon controller and routes
  - [x] 3.1 Create `server/src/controllers/admin/couponController.ts`
    - Implement `validateCouponFields` helper: checks required fields, percentage range 1–99, fixed ≥ 1
    - Implement `createCoupon`: validate, check code uniqueness case-insensitively (409 on duplicate), store code uppercase, return 201
    - Implement `getCoupons`: return all coupons
    - Implement `updateCoupon`: validate, persist, 404 if not found
    - Implement `deleteCoupon`: remove document, return 200, 404 if not found
    - _Requirements: 9.1–9.10_

  - [x] 3.2 Create `server/src/routes/admin/couponRoutes.ts`
    - Wire `verifyToken`, `superAdminOnly` on all routes
    - POST `/` → `createCoupon`, GET `/` → `getCoupons`, PUT `/:id` → `updateCoupon`, DELETE `/:id` → `deleteCoupon`
    - _Requirements: 9.1_

  - [ ]* 3.3 Write property test for coupon code uniqueness and uppercase storage (Property 8)
    - **Property 8: Coupon code uniqueness and uppercase storage**
    - Generate random alphanumeric codes, create coupon, attempt duplicate with varied casing, assert 409; verify stored code is uppercase
    - **Validates: Requirements 9.6, 9.7**

  - [ ]* 3.4 Write property test for coupon CRUD round-trip (Property 9)
    - **Property 9: Coupon CRUD round-trip**
    - Create random valid coupon, retrieve, assert fields match (code uppercase); delete, retrieve, assert 404
    - **Validates: Requirements 9.7, 9.9**

  - [ ]* 3.5 Write property test for superadmin-only access on coupon endpoints (Property 3 — coupon side)
    - **Property 3: Superadmin-only access for coupon management**
    - For each coupon admin endpoint, send requests with non-superadmin tokens; assert 403 or 401
    - **Validates: Requirement 9.1**

- [x] 4. Implement storefront coupon validate endpoint + order placement update
  - [x] 4.1 Add `validateCoupon` handler to `server/src/controllers/admin/couponController.ts` (or a new storefront coupon controller)
    - Accept `code` and `orderTotal` from request body; require `verifyToken`
    - Check existence (404), `isActive` (400), `expiryDate` (400), `usageLimit` (400), `usedBy` contains current user (400), `minOrderValue` (400)
    - Compute `couponDiscount`: percentage → `round(orderTotal * v/100)`, fixed → `min(v, orderTotal)`
    - Return `couponId`, `code`, `discountType`, `discountValue`, `couponDiscount`
    - _Requirements: 10.1–10.9_

  - [x] 4.2 Create `server/src/routes/storefront/couponRoutes.ts`
    - POST `/validate` → `verifyToken`, `validateCoupon`
    - _Requirements: 10.1_

  - [x] 4.3 Modify storefront order placement in `server/src/controllers/storefront/orderController.ts`
    - Accept optional `couponId` and `couponDiscount` in the order payload
    - When `couponId` is present: verify coupon still valid, increment `usageCount`, push customer ID to `usedBy`, store `couponCode`, `couponDiscount` on the order
    - _Requirements: 10.8, 11.5, 11.6_

  - [ ]* 4.4 Write property test for coupon validation enforces all rules (Property 10)
    - **Property 10: Coupon validation enforces all rules**
    - For each invalid coupon state (inactive, expired, limit reached, already used, below minimum), assert correct error message and status code
    - **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

  - [ ]* 4.5 Write property test for coupon usage tracking after order placement (Property 11)
    - **Property 11: Coupon usage tracking after order placement**
    - Place order with valid coupon, verify `usageCount` incremented by 1, customer ID in `usedBy`, order record contains `couponCode`, `couponDiscount`, and coupon ID
    - **Validates: Requirements 10.8, 11.6**

- [x] 5. Enrich storefront product endpoints with activeOffer data
  - [x] 5.1 Modify `server/src/controllers/storefront/productController.ts` — `getProducts`
    - After fetching products, collect all product IDs; query `Offer.find({ productIds: { $in: ids }, isActive: true })`; filter by date range in application code
    - Build `Map<productId, activeOffer>` and attach `activeOffer` (with computed `discountedPrice`) to each product in the response
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

  - [x] 5.2 Modify `server/src/controllers/storefront/productController.ts` — `getProductById`
    - Same enrichment logic for a single product
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 5.3 Write property test for storefront product enrichment (Property 6)
    - **Property 6: Storefront product responses include active offer data**
    - Create product + active offer, call list and detail endpoints, assert `activeOffer` present with correct `discountedPrice`; set `isActive=false`, assert `activeOffer` absent; set expired `endDate`, assert absent
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

  - [ ]* 5.4 Write property test for offer delete removes and disassociates (Property 4)
    - **Property 4: Offer delete removes and disassociates**
    - Create offer linked to products, delete offer, assert 404 on retrieval and no `activeOffer` in storefront product responses
    - **Validates: Requirements 4.1, 4.2**

- [ ] 6. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Register new routes in `server/src/server.ts`
  - Import `adminOfferRoutes`, `adminCouponRoutes`, `storefrontCouponRoutes`
  - Mount: `app.use("/api/v1/admin/offers", adminLimiter, adminOfferRoutes)`
  - Mount: `app.use("/api/v1/admin/coupons", adminLimiter, adminCouponRoutes)`
  - Mount: `app.use("/api/v1/coupons", storefrontLimiter, storefrontCouponRoutes)`
  - _Requirements: 1.1, 9.1, 10.1_

- [x] 8. Create frontend admin services
  - [x] 8.1 Create `client/src/services/admin/offerService.ts`
    - Define `Offer` and `OfferPayload` interfaces matching the backend model
    - Implement `getOffers()`, `getOfferById(id)`, `createOffer(data)`, `updateOffer(id, data)`, `deleteOffer(id)` using `axiosInstance` at `admin/offers`
    - _Requirements: 2.1, 2.2, 8.3, 8.4_

  - [x] 8.2 Create `client/src/services/admin/couponService.ts`
    - Define `Coupon` and `CouponPayload` interfaces
    - Implement `getCoupons()`, `createCoupon(data)`, `updateCoupon(id, data)`, `deleteCoupon(id)` using `axiosInstance` at `admin/coupons`
    - _Requirements: 9.1, 11.7, 11.8_

- [x] 9. Create frontend storefront coupon service
  - Create `client/src/services/storefront/couponService.ts`
  - Define `CouponValidationResult` interface: `couponId`, `code`, `discountType`, `discountValue`, `couponDiscount`
  - Implement `validateCoupon(code, orderTotal)` posting to `/coupons/validate`
  - _Requirements: 10.1, 11.1_

- [x] 10. Extend `StorefrontProduct` type and `PlaceOrderPayload`
  - In `client/src/services/storefront/productService.ts`, add `ActiveOffer` interface and optional `activeOffer?: ActiveOffer` to `StorefrontProduct`
  - In `client/src/services/storefront/orderService.ts`, add optional `couponId?: string` and `couponDiscount?: number` to `PlaceOrderPayload`
  - _Requirements: 6.1, 6.2, 11.5_

- [x] 11. Build `OffersManagement` admin page
  - [x] 11.1 Create `client/src/pages/Admin/OffersManagement.tsx` — Offers tab
    - Fetch and display all offers in a table: label, discount type, discount value, active status, date range, product count
    - Provide create/edit form (modal or inline panel) with fields: label, discountType, discountValue, isActive toggle, startDate, endDate, product multi-select (fetched from `admin/products/get`)
    - Wire save to `offerService.createOffer` / `offerService.updateOffer`; show toast on success/error
    - Provide delete action using `ActionConfirmModal`; wire to `offerService.deleteOffer`; show toast on success/error
    - _Requirements: 8.1–8.6_

  - [x] 11.2 Add Coupons tab to `OffersManagement.tsx`
    - Fetch and display all coupons: code, discount type, discount value, usage count, usage limit, expiry date, active status
    - Provide create/edit form with fields: code, discountType, discountValue, minOrderValue, usageLimit, expiryDate, isActive toggle
    - Wire save to `couponService.createCoupon` / `couponService.updateCoupon`; show toast on success/error
    - Provide delete action using `ActionConfirmModal`; wire to `couponService.deleteCoupon`; show toast on success/error
    - _Requirements: 11.7–11.10_

- [x] 12. Register `OffersManagement` route in `App.tsx` and update Sidebar
  - [x] 12.1 Add route in `client/src/App.tsx`
    - Import `OffersManagement` and add `<Route path="/admin/offers" element={<OffersManagement />} />` inside the admin protected route block
    - _Requirements: 8.1_

  - [x] 12.2 Add "Offers & Coupons" nav item to `client/src/components/Admin/Sidebar.tsx`
    - Add entry to `allMenuItems` with `name: 'Offers & Coupons'`, `path: '/admin/offers'`, `superAdminOnly: true`, and a tag/percent SVG icon
    - _Requirements: 8.7_

- [x] 13. Update storefront product cards in `Home.tsx` and `Browse.tsx`
  - [x] 13.1 Modify `client/src/pages/User/Home.tsx` product card rendering
    - When `product.activeOffer` is present: render offer label badge, show `activeOffer.discountedPrice` as primary price, show original `product.price` with strikethrough, hide `comparePrice`
    - When no `activeOffer`: keep existing `price` / `comparePrice` logic
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 13.2 Modify `client/src/pages/User/Browse.tsx` product card rendering
    - Same offer badge and discounted price logic as Home.tsx
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [x] 14. Update `ProductDetail.tsx` offer display
  - In `client/src/pages/User/ProductDetail.tsx`, modify the price section
  - When `product.activeOffer` is present: render offer label badge above price, show `activeOffer.discountedPrice` as primary price (red), show original `product.price` with strikethrough, hide `comparePrice`
  - When no `activeOffer`: keep existing price + comparePrice logic
  - _Requirements: 7.3, 7.4, 7.5_

- [x] 15. Add coupon input and discount display to `Checkout.tsx`
  - In `client/src/pages/User/Checkout.tsx`:
    - Add state: `couponCode`, `appliedCoupon` (`CouponValidationResult | null`), `couponError`, `couponLoading`
    - Add coupon input section above the order total in the Order Summary panel: text input + "Apply" button; on apply call `validateCoupon(couponCode, totalPrice)`, set `appliedCoupon` on success or `couponError` on failure (do not clear input on error)
    - Add "×" remove button to clear `appliedCoupon` and restore original total
    - Show coupon discount as a separate line item: `Coupon {code}: −₹{couponDiscount}`
    - Show `finalTotal` (totalPrice − couponDiscount) as the payable total
    - Extend `handleSubmit` to include `couponId` and `couponDiscount` in the `placeOrder` call when `appliedCoupon` is set
    - _Requirements: 11.1–11.5_

- [ ] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests require `mongodb-memory-server` and a test Express app instance; each test seeds and cleans up its own data
- Each property test should run a minimum of 100 iterations using `fast-check`
- Tag format for each property test: `// Feature: offers-promotions, Property {N}: {property_text}`
- The "one active offer per product" constraint is enforced at the controller level, not via a DB unique index
- Guest checkout is not eligible for coupon use — the validate endpoint requires `verifyToken`
