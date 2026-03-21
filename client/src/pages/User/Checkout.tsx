import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Lock } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { placeOrder } from "../../services/storefront/orderService";
import type { ShippingAddress } from "../../services/storefront/orderService";

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "UPI", label: "UPI" },
  { value: "Card", label: "Credit / Debit Card" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const emptyAddress: ShippingAddress = {
  line1: "", line2: "", city: "", state: "", zip: "", country: "India",
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [guestEmail, setGuestEmail] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress | "guestEmail", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const isGuest = !isAuthenticated || user?.role !== "user";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const validate = () => {
    const errs: typeof errors = {};
    if (!address.line1.trim()) errs.line1 = "Address line 1 is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State is required";
    if (!address.zip.trim()) errs.zip = "PIN code is required";
    else if (!/^\d{6}$/.test(address.zip)) errs.zip = "Enter a valid 6-digit PIN code";
    if (isGuest && !guestEmail.trim()) errs.guestEmail = "Email is required for guest checkout";
    else if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errs.guestEmail = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setSubmitting(true);
    setServerError("");

    try {
      const orderItems = items.map((i) => ({ productId: i.product, quantity: i.quantity }));
      const result = await placeOrder({
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        ...(isGuest ? { guestEmail } : {}),
      });

      await clearCart();
      navigate(`/order-confirmation/${result._id}`, { state: { order: result } });
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <ShoppingBag size={48} className="mb-3" style={{ color: "var(--prime-orange)" }} />
        <h4 className="fw-bold">Your cart is empty</h4>
        <Link to="/" className="btn rounded-pill px-4 mt-3 fw-semibold text-white" style={{ background: "var(--prime-gradient)", border: "none" }}>
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button className="back-nav-btn mb-4" onClick={() => navigate("/cart")}>
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h2 className="fw-bold mb-4" style={{ letterSpacing: "-0.5px" }}>Checkout</h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left: Shipping + Payment */}
          <div className="col-lg-7">
            {/* Guest email */}
            {isGuest && (
              <div className="form-panel mb-4">
                <div className="form-section-title">
                  <div className="section-icon" style={{ background: "rgba(255,140,66,0.1)" }}>
                    <Lock size={16} style={{ color: "var(--prime-orange)" }} />
                  </div>
                  Guest Checkout
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Checking out as guest. <Link to="/auth" className="fw-semibold" style={{ color: "var(--prime-deep)" }}>Sign in</Link> to track your orders.
                </p>
                <div className={`floating-input ${errors.guestEmail ? "has-error" : ""}`}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                  {errors.guestEmail && <div className="field-error">{errors.guestEmail}</div>}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="form-panel mb-4">
              <div className="form-section-title">
                <div className="section-icon" style={{ background: "rgba(255,140,66,0.1)" }}>
                  <MapPin size={16} style={{ color: "var(--prime-orange)" }} />
                </div>
                Shipping Address
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <div className={`floating-input ${errors.line1 ? "has-error" : ""}`}>
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      placeholder="House/Flat No., Street, Area"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    />
                    {errors.line1 && <div className="field-error">{errors.line1}</div>}
                  </div>
                </div>
                <div className="col-12">
                  <div className="floating-input">
                    <label>Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Landmark, Colony"
                      value={address.line2 || ""}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={`floating-input ${errors.city ? "has-error" : ""}`}>
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                    {errors.city && <div className="field-error">{errors.city}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={`floating-input ${errors.state ? "has-error" : ""}`}>
                    <label>State</label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <div className="field-error">{errors.state}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={`floating-input ${errors.zip ? "has-error" : ""}`}>
                    <label>PIN Code</label>
                    <input
                      type="text"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value.replace(/\D/g, "") })}
                    />
                    {errors.zip && <div className="field-error">{errors.zip}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="floating-input">
                    <label>Country</label>
                    <input type="text" value="India" readOnly style={{ background: "#f7f7f8", cursor: "not-allowed" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-panel">
              <div className="form-section-title">
                <div className="section-icon" style={{ background: "rgba(255,140,66,0.1)" }}>
                  <CreditCard size={16} style={{ color: "var(--prime-orange)" }} />
                </div>
                Payment Method
              </div>
              <div className="d-flex flex-column gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className="d-flex align-items-center gap-3 p-3 rounded-3 cursor-pointer"
                    style={{
                      border: `1.5px solid ${paymentMethod === pm.value ? "var(--prime-orange)" : "var(--prime-border)"}`,
                      background: paymentMethod === pm.value ? "rgba(255,140,66,0.04)" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="form-check-input m-0"
                      style={{ accentColor: "var(--prime-orange)" }}
                    />
                    <span className="fw-semibold" style={{ fontSize: "0.95rem" }}>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="col-lg-5">
            <div className="form-panel" style={{ position: "sticky", top: 90 }}>
              <h5 className="fw-bold mb-4">Order Summary</h5>

              <div className="d-flex flex-column gap-3 mb-4">
                {items.map((item) => (
                  <div key={item.product} className="d-flex align-items-center gap-3">
                    <div className="rounded-3 overflow-hidden flex-shrink-0" style={{ width: 52, height: 52, background: "#f0f0f2" }}>
                      {item.image && <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />}
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: "0.85rem" }}>{item.name}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>Qty: {item.quantity}</p>
                    </div>
                    <span className="fw-bold flex-shrink-0" style={{ fontSize: "0.9rem" }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <hr style={{ borderColor: "#f0f0f2" }} />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="fw-semibold text-success">Calculated by server</span>
              </div>

              <hr style={{ borderColor: "#f0f0f2" }} />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">Total</span>
                <span className="fw-bold" style={{ fontSize: "1.2rem", color: "var(--prime-deep)" }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {serverError && (
                <div className="alert rounded-3 border-0 mb-3" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", fontSize: "0.875rem" }}>
                  {serverError}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn w-100 rounded-pill py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                style={{ background: "var(--prime-gradient)", border: "none" }}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm" /> Placing Order...</>
                ) : (
                  <><ShoppingBag size={16} /> Place Order</>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
