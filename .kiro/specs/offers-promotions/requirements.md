# Requirements Document

## Introduction

The Offers & Promotions feature allows the PrimeHive superadmin to create and manage promotional offers that are displayed on products across the storefront. An offer can apply a percentage or fixed discount to one or more products, carry a label (e.g. "Flash Sale", "Limited Deal"), and optionally have an active date range. When an offer is active and linked to a product, the storefront displays the offer badge and the discounted price on the Home page grid, Browse page, and ProductDetail page.

The feature also supports coupon codes — short alphanumeric strings a customer enters at checkout to receive a discount on the entire order total. Coupons are managed by the Superadmin and are independent of product-level offers. A coupon can apply a percentage or fixed discount, enforce a minimum order value, cap total usage, restrict to one use per customer, and carry an expiry date.

## Glossary

- **Offer**: A promotional record created by the Superadmin that defines a discount type, discount value, display label, optional date range, and the set of products it applies to.
- **Offer_Manager**: The backend service responsible for creating, updating, deleting, and retrieving offers.
- **Offer_Badge**: A visual label rendered on a product card or product detail page indicating an active offer (e.g. "Flash Sale – 20% off").
- **Discounted_Price**: The effective price of a product after the offer discount is applied.
- **Superadmin**: The privileged admin role in PrimeHive with full access to all management features.
- **Storefront**: The customer-facing pages of PrimeHive (Home, Browse, ProductDetail).
- **Product**: An item in the PrimeHive catalog with a `price` and optional `comparePrice`.
- **Active_Offer**: An offer whose `isActive` flag is `true` and whose current date falls within its optional `startDate`–`endDate` range (if set).
- **Coupon**: A promotional record created by the Superadmin containing a unique code string, discount type, discount value, optional minimum order value, optional usage limit, optional expiry date, and an `isActive` flag.
- **Coupon_Manager**: The backend service responsible for creating, updating, deleting, validating, and retrieving coupons.
- **Coupon_Code**: The alphanumeric string a customer enters at checkout to apply a Coupon (e.g. "SAVE20").
- **Coupon_Discount**: The monetary amount deducted from the order total when a valid Coupon is applied.
- **Order_Total**: The sum of all cart item prices before any coupon discount is applied.
- **Final_Total**: The Order_Total minus the Coupon_Discount, with a minimum value of zero.

---

## Requirements

### Requirement 1: Create an Offer

**User Story:** As a superadmin, I want to create a new offer with a label, discount type, discount value, and optional date range, so that I can run promotions on selected products.

#### Acceptance Criteria

1. THE Offer_Manager SHALL provide an endpoint to create a new offer accepting: `label` (string), `discountType` (`percentage` | `fixed`), `discountValue` (number), `isActive` (boolean), optional `startDate` (ISO date), optional `endDate` (ISO date), and optional `productIds` (array of product IDs).
2. WHEN a create-offer request is received with a missing `label`, `discountType`, or `discountValue`, THE Offer_Manager SHALL return a 400 error with a descriptive validation message.
3. WHEN `discountType` is `percentage`, THE Offer_Manager SHALL reject `discountValue` values outside the range 1–99 with a 400 error.
4. WHEN `discountType` is `fixed`, THE Offer_Manager SHALL reject `discountValue` values less than 1 with a 400 error.
5. WHEN `startDate` and `endDate` are both provided, THE Offer_Manager SHALL reject requests where `endDate` is not after `startDate` with a 400 error.
6. WHEN a valid create-offer request is received, THE Offer_Manager SHALL persist the offer and return the created offer object with a 201 status.
7. THE Offer_Manager SHALL restrict offer creation to requests authenticated as a Superadmin, returning 403 for any other role.

---

### Requirement 2: List and Retrieve Offers

**User Story:** As a superadmin, I want to view all offers and their details, so that I can manage existing promotions.

#### Acceptance Criteria

1. THE Offer_Manager SHALL provide an endpoint to return a list of all offers, including each offer's `label`, `discountType`, `discountValue`, `isActive`, `startDate`, `endDate`, and the count of linked products.
2. THE Offer_Manager SHALL provide an endpoint to return a single offer by ID, including the full list of linked `productIds`.
3. IF an offer ID does not exist, THEN THE Offer_Manager SHALL return a 404 error.
4. THE Offer_Manager SHALL restrict offer retrieval to requests authenticated as a Superadmin, returning 403 for any other role.

---

### Requirement 3: Update an Offer

**User Story:** As a superadmin, I want to edit an existing offer's details and linked products, so that I can adjust promotions as needed.

#### Acceptance Criteria

1. THE Offer_Manager SHALL provide an endpoint to update any field of an existing offer by ID.
2. WHEN an update request is received, THE Offer_Manager SHALL apply the same validation rules as offer creation to the updated fields.
3. WHEN a valid update request is received, THE Offer_Manager SHALL persist the changes and return the updated offer object.
4. IF the offer ID does not exist, THEN THE Offer_Manager SHALL return a 404 error.
5. THE Offer_Manager SHALL restrict offer updates to requests authenticated as a Superadmin, returning 403 for any other role.

---

### Requirement 4: Delete an Offer

**User Story:** As a superadmin, I want to delete an offer, so that I can remove promotions that are no longer needed.

#### Acceptance Criteria

1. THE Offer_Manager SHALL provide an endpoint to delete an offer by ID.
2. WHEN an offer is deleted, THE Offer_Manager SHALL remove the offer record and disassociate it from all linked products.
3. IF the offer ID does not exist, THEN THE Offer_Manager SHALL return a 404 error.
4. THE Offer_Manager SHALL restrict offer deletion to requests authenticated as a Superadmin, returning 403 for any other role.

---

### Requirement 5: Assign and Remove Products from an Offer

**User Story:** As a superadmin, I want to assign specific products to an offer and remove them, so that I can control which products are on promotion.

#### Acceptance Criteria

1. THE Offer_Manager SHALL allow a superadmin to assign one or more product IDs to an existing offer via an update or dedicated assign endpoint.
2. THE Offer_Manager SHALL allow a superadmin to remove one or more product IDs from an existing offer.
3. WHEN a product ID that does not exist in the catalog is submitted for assignment, THE Offer_Manager SHALL return a 400 error identifying the invalid product ID.
4. THE Offer_Manager SHALL allow a product to be linked to at most one Active_Offer at a time; attempting to assign a product already linked to another Active_Offer SHALL return a 409 conflict error.

---

### Requirement 6: Expose Active Offer Data on Product Endpoints

**User Story:** As a storefront user, I want to see offer information when browsing products, so that I know which products are on promotion.

#### Acceptance Criteria

1. WHEN the storefront product list endpoint is called, THE Offer_Manager SHALL include each product's Active_Offer data (if any) in the response, containing: `offerId`, `label`, `discountType`, `discountValue`, and the computed `discountedPrice`.
2. WHEN the storefront product detail endpoint is called, THE Offer_Manager SHALL include the product's Active_Offer data (if any) in the response.
3. WHILE an offer's `isActive` is `false`, THE Offer_Manager SHALL NOT include that offer's data in storefront product responses.
4. WHEN an offer has a `startDate` and the current date is before `startDate`, THE Offer_Manager SHALL NOT include that offer's data in storefront product responses.
5. WHEN an offer has an `endDate` and the current date is after `endDate`, THE Offer_Manager SHALL NOT include that offer's data in storefront product responses.
6. THE Offer_Manager SHALL compute `discountedPrice` as: for `percentage` type, `price * (1 - discountValue / 100)` rounded to the nearest integer; for `fixed` type, `max(0, price - discountValue)`.

---

### Requirement 7: Display Offer Badge and Discounted Price on Storefront

**User Story:** As a storefront user, I want to see offer badges and discounted prices on product cards and the product detail page, so that I can identify deals at a glance.

#### Acceptance Criteria

1. WHEN a product has an Active_Offer, THE Storefront SHALL display the Offer_Badge (showing the offer `label`) on the product card in the Home page grid and Browse page.
2. WHEN a product has an Active_Offer, THE Storefront SHALL display the Discounted_Price as the primary price and the original `price` as a strikethrough on the product card.
3. WHEN a product has an Active_Offer, THE Storefront SHALL display the Offer_Badge and Discounted_Price on the ProductDetail page.
4. WHEN a product has both an Active_Offer and a `comparePrice`, THE Storefront SHALL display the Discounted_Price as the primary price, the original `price` as a strikethrough, and hide the `comparePrice` to avoid confusion.
5. WHEN a product has no Active_Offer, THE Storefront SHALL display pricing using the existing `price` and `comparePrice` logic without any offer badge.

---

### Requirement 8: Offer Management UI in Admin Panel

**User Story:** As a superadmin, I want a dedicated Offers management page in the admin panel, so that I can create, edit, and delete offers without using the API directly.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide an "Offers" page accessible only to users with the Superadmin role.
2. THE Admin_Panel SHALL display a list of all offers showing: label, discount type, discount value, active status, date range, and linked product count.
3. THE Admin_Panel SHALL provide a form to create a new offer with fields for label, discount type, discount value, active toggle, optional start/end dates, and a product selector.
4. THE Admin_Panel SHALL provide an edit action for each offer that pre-populates the form with the offer's current data.
5. THE Admin_Panel SHALL provide a delete action for each offer with a confirmation step before deletion.
6. WHEN an offer is saved or deleted, THE Admin_Panel SHALL display a success or error toast notification reflecting the outcome.
7. THE Admin_Panel SHALL add an "Offers" navigation item to the Sidebar visible only to the Superadmin role.

---

### Requirement 9: Coupon Code Management by Superadmin

**User Story:** As a superadmin, I want to create, edit, and delete coupon codes with configurable discount rules, so that I can run order-level promotions for customers.

#### Acceptance Criteria

1. THE Coupon_Manager SHALL provide endpoints to create, retrieve (list and single), update, and delete coupons, restricted to requests authenticated as a Superadmin, returning 403 for any other role.
2. WHEN a create-coupon request is received, THE Coupon_Manager SHALL accept: `code` (string, unique, case-insensitive), `discountType` (`percentage` | `fixed`), `discountValue` (number), optional `minOrderValue` (number ≥ 0), optional `usageLimit` (positive integer), optional `expiryDate` (ISO date), and `isActive` (boolean).
3. WHEN a create-coupon request is received with a missing `code`, `discountType`, or `discountValue`, THE Coupon_Manager SHALL return a 400 error with a descriptive validation message.
4. WHEN `discountType` is `percentage`, THE Coupon_Manager SHALL reject `discountValue` values outside the range 1–99 with a 400 error.
5. WHEN `discountType` is `fixed`, THE Coupon_Manager SHALL reject `discountValue` values less than 1 with a 400 error.
6. WHEN a create-coupon request contains a `code` that already exists (case-insensitive), THE Coupon_Manager SHALL return a 409 conflict error.
7. WHEN a valid create-coupon request is received, THE Coupon_Manager SHALL persist the coupon, store the `code` in uppercase, and return the created coupon object with a 201 status.
8. WHEN a valid update-coupon request is received, THE Coupon_Manager SHALL apply the same validation rules as coupon creation to the updated fields and return the updated coupon object.
9. WHEN a coupon is deleted, THE Coupon_Manager SHALL remove the coupon record and return a 200 status.
10. IF a coupon ID does not exist on retrieve, update, or delete, THEN THE Coupon_Manager SHALL return a 404 error.

---

### Requirement 10: Customer Applies a Coupon Code at Checkout

**User Story:** As a customer, I want to enter a coupon code at checkout and have the discount applied to my order total, so that I can benefit from promotions.

#### Acceptance Criteria

1. THE Coupon_Manager SHALL provide a validate-coupon endpoint that accepts a `code` and the current `orderTotal`, and returns the `couponId`, `discountType`, `discountValue`, and computed `couponDiscount` when the coupon is valid.
2. WHEN the validate-coupon endpoint is called with a `code` that does not exist, THE Coupon_Manager SHALL return a 404 error with the message "Coupon code not found."
3. WHEN the validate-coupon endpoint is called with a coupon whose `isActive` is `false`, THE Coupon_Manager SHALL return a 400 error with the message "This coupon is no longer active."
4. WHEN the validate-coupon endpoint is called with a coupon whose `expiryDate` is before the current date, THE Coupon_Manager SHALL return a 400 error with the message "This coupon has expired."
5. WHEN the validate-coupon endpoint is called with a coupon whose `usageLimit` has been reached, THE Coupon_Manager SHALL return a 400 error with the message "This coupon has reached its usage limit."
6. WHEN the validate-coupon endpoint is called by an authenticated customer who has already used the same coupon, THE Coupon_Manager SHALL return a 400 error with the message "You have already used this coupon."
7. WHEN the validate-coupon endpoint is called with an `orderTotal` below the coupon's `minOrderValue`, THE Coupon_Manager SHALL return a 400 error stating the minimum order value required.
8. WHEN a valid coupon is applied and an order is placed, THE Coupon_Manager SHALL increment the coupon's `usageCount` by 1 and record the authenticated customer's ID (or guest identifier) as having used the coupon.
9. THE Coupon_Manager SHALL compute `couponDiscount` as: for `percentage` type, `orderTotal * (discountValue / 100)` rounded to the nearest integer; for `fixed` type, `min(discountValue, orderTotal)`.

---

### Requirement 11: Checkout Page Displays Applied Coupon and Final Total

**User Story:** As a customer, I want to see the applied coupon, the discount amount, and the final reduced total on the checkout page, so that I can confirm my savings before placing the order.

#### Acceptance Criteria

1. THE Storefront SHALL display a coupon input field on the checkout page that allows the customer to enter a Coupon_Code and apply it.
2. WHEN a coupon is successfully validated, THE Storefront SHALL display the applied Coupon_Code, the Coupon_Discount amount as a separate line item (e.g. "Coupon SAVE20: −₹200"), and the Final_Total in the order summary.
3. WHEN a coupon validation fails, THE Storefront SHALL display the error message returned by the Coupon_Manager below the coupon input field without clearing the entered code.
4. THE Storefront SHALL provide a way for the customer to remove an applied coupon, restoring the Order_Total as the payable amount.
5. WHEN the customer places an order with an applied coupon, THE Storefront SHALL include the `couponId` and `couponDiscount` in the order placement request so the server records the discount.
6. WHEN an order is placed with an applied coupon, THE Coupon_Manager SHALL store the `couponId`, `couponDiscount`, and `couponCode` on the order record for reference.
7. THE Admin_Panel SHALL provide a "Coupons" tab on the Offers page (or a dedicated Coupons page) accessible only to the Superadmin role, listing all coupons with their code, discount type, discount value, usage count, usage limit, expiry date, and active status.
8. THE Admin_Panel SHALL provide a form to create and edit coupons with fields for code, discount type, discount value, minimum order value, usage limit, expiry date, and active toggle.
9. THE Admin_Panel SHALL provide a delete action for each coupon with a confirmation step before deletion.
10. WHEN a coupon is saved or deleted, THE Admin_Panel SHALL display a success or error toast notification reflecting the outcome.
