import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Lock, Tag, X, Plus, CheckCircle2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { placeOrder } from "../../services/storefront/orderService";
import type { ShippingAddress } from "../../services/storefront/orderService";
import { validateCoupon } from "../../services/storefront/couponService";
import type { CouponValidationResult } from "../../services/storefront/couponService";
import { getAddresses } from "../../services/storefront/accountService";
import type { Address } from "../../services/storefront/accountService";
import { useSettings } from "../../context/SettingsContext";
import PrimeLoader from "../../components/PrimeLoader";

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "UPI", label: "UPI" },
  { value: "Card", label: "Credit / Debit Card" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Ladakh","Puducherry",
];

const emptyAddress: Omit<Address, "_id"> = {
  line1: "", line2: "", city: "", state: "", zip: "", country: "India",
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { standardShippingRate, freeShippingThreshold, taxRate, taxInclusive } = useSettings();

  const isGuest = !isAuthenticated || user?.role !== "user";

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState<Omit<Address, "_id">>(emptyAddress);
  const [addrErrors, setAddrErrors] = useState<Partial<Record<keyof Omit<Address, "_id">, string>>>({});

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestAddress, setGuestAddress] = useState<ShippingAddress>({ line1: "", city: "", state: "", zip: "", country: "India" });
  const [guestErrors, setGuestErrors] = useState<Partial<Record<keyof ShippingAddress | "guestEmail", string>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!isGuest) {
      setAddressesLoading(true);
      getAddresses()
        .then((addrs) => {
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            setSelectedAddressId(addrs[0]._id);
          } else {
            setShowNewForm(true);
          }
        })
        .catch(() => setShowNewForm(true))
        .finally(() => setAddressesLoading(false));
    }
  }, [isGuest]);

  const validateNewAddress = () => {
    const errs: typeof addrErrors = {};
    if (!newAddress.line1.trim()) errs.line1 = "Address line 1 is required";
    if (!newAddress.city.trim()) errs.city = "City is required";
    if (!newAddress.state.trim()) errs.state = "State is required";
    if (!newAddress.zip.trim()) errs.zip = "PIN code is required";
    else if (!/^\d{6}$/.test(newAddress.zip)) errs.zip = "Enter a valid 6-digit PIN";
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateGuest = () => {
    const errs: typeof guestErrors = {};
    if (!guestEmail.trim()) errs.guestEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errs.guestEmail = "Enter a valid email";
    if (!guestAddress.line1.trim()) errs.line1 = "Address line 1 is required";
    if (!guestAddress.city.trim()) errs.city = "City is required";
    if (!guestAddress.state.trim()) errs.state = "State is required";
    if (!guestAddress.zip.trim()) errs.zip = "PIN code is required";
    else if (!/^\d{6}$/.test(guestAddress.zip)) errs.zip = "Enter a valid 6-digit PIN";
    setGuestErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const result = await validateCoupon(couponCode.trim(), totalPrice);
      setAppliedCoupon(result);
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Invalid or expired coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine shipping address
    let shippingAddress: ShippingAddress;

    if (isGuest) {
      if (!validateGuest()) return;
      shippingAddress = guestAddress;
    } else if (showNewForm && !selectedAddressId) {
      if (!validateNewAddress()) return;
      shippingAddress = newAddress;
    } else {
      const sel = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!sel) { setServerError("Please select a delivery address."); return; }
      shippingAddress = { line1: sel.line1, line2: sel.line2, city: sel.city, state: sel.state, zip: sel.zip, country: sel.country };
    }

    if (items.length === 0) return;
    setSubmitting(true);
    setServerError("");

    try {
      const orderItems = items.map((i) => ({ productId: i.product, quantity: i.quantity }));
      const result = await placeOrder({
        items: orderItems,
        shippingAddress,
        paymentMethod,
        ...(isGuest ? { guestEmail } : {}),
        ...(appliedCoupon ? { couponId: appliedCoupon.couponId, couponDiscount: appliedCoupon.couponDiscount } : {}),
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
    <>
      <PrimeLoader isLoading={submitting} message="Placing your order..." />
      <div className="container py-4">
      <button className="back-nav-btn mb-4" onClick={() => navigate("/cart")}>
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h2 className="fw-bold mb-4" style={{ letterSpacing: "-0.5px" }}>Checkout</h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left */}
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
                  <Link to="/auth" className="fw-semibold" style={{ color: "var(--prime-deep)" }}>Sign in</Link> to use saved addresses and track orders.
                </p>
                <div className={`floating-input ${guestErrors.guestEmail ? "has-error" : ""}`}>
                  <label>Email Address</label>
                  <input type="email" placeholder="your@email.com" value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)} />
                  {guestErrors.guestEmail && <div className="field-error">{guestErrors.guestEmail}</div>}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="form-panel mb-4">
              <div className="form-section-title mb-3">
                <div className="section-icon" style={{ background: "rgba(255,140,66,0.1)" }}>
                  <MapPin size={16} style={{ color: "var(--prime-orange)" }} />
                </div>
                Delivery Address
              </div>

              {/* Logged-in: saved address cards */}
              {!isGuest && (
                <>
                  {addressesLoading ? (
                    <div className="text-center py-3">
                      <span className="spinner-border spinner-border-sm" style={{ color: "var(--prime-orange)" }} />
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2 mb-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => { setSelectedAddressId(addr._id); setShowNewForm(false); }}
                          style={{
                            border: `2px solid ${selectedAddressId === addr._id && !showNewForm ? "var(--prime-orange)" : "#e5e7eb"}`,
                            borderRadius: 10,
                            padding: "14px 16px",
                            cursor: "pointer",
                            background: selectedAddressId === addr._id && !showNewForm ? "rgba(255,140,66,0.04)" : "#fff",
                            transition: "all 0.15s",
                          }}
                        >
                          <div className="d-flex align-items-start gap-3">
                            {/* Radio dot */}
                            <div style={{
                              width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                              border: `2px solid ${selectedAddressId === addr._id && !showNewForm ? "var(--prime-orange)" : "#ccc"}`,
                              background: selectedAddressId === addr._id && !showNewForm ? "var(--prime-orange)" : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {selectedAddressId === addr._id && !showNewForm && (
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                              )}
                            </div>
                            <div>
                              <p className="mb-0 fw-semibold" style={{ fontSize: "0.9rem", color: "#111" }}>
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                              </p>
                              <p className="mb-0 text-muted" style={{ fontSize: "0.85rem" }}>
                                {addr.city}, {addr.state} – {addr.zip}
                              </p>
                              <p className="mb-0 text-muted" style={{ fontSize: "0.85rem" }}>{addr.country}</p>
                            </div>
                            {selectedAddressId === addr._id && !showNewForm && (
                              <CheckCircle2 size={16} className="ms-auto flex-shrink-0" style={{ color: "var(--prime-orange)", marginTop: 2 }} />
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add new address toggle */}
                      <div
                        onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                        style={{
                          border: `2px dashed ${showNewForm ? "var(--prime-orange)" : "#e5e7eb"}`,
                          borderRadius: 10,
                          padding: "12px 16px",
                          cursor: "pointer",
                          background: showNewForm ? "rgba(255,140,66,0.04)" : "#fafafa",
                          transition: "all 0.15s",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Plus size={16} style={{ color: "var(--prime-orange)" }} />
                          <span className="fw-semibold" style={{ fontSize: "0.9rem", color: "var(--prime-orange)" }}>
                            Add a new address
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New address form */}
                  <AnimatePresence>
                    {showNewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="row g-3 pt-2">
                          <div className="col-12">
                            <div className={`floating-input ${addrErrors.line1 ? "has-error" : ""}`}>
                              <label>Address Line 1</label>
                              <input type="text" placeholder="House/Flat No., Street, Area"
                                value={newAddress.line1}
                                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                              {addrErrors.line1 && <div className="field-error">{addrErrors.line1}</div>}
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="floating-input">
                              <label>Address Line 2 (Optional)</label>
                              <input type="text" placeholder="Landmark, Colony"
                                value={newAddress.line2 || ""}
                                onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`floating-input ${addrErrors.city ? "has-error" : ""}`}>
                              <label>City</label>
                              <input type="text" placeholder="City"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                              {addrErrors.city && <div className="field-error">{addrErrors.city}</div>}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`floating-input ${addrErrors.state ? "has-error" : ""}`}>
                              <label>State</label>
                              <select value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}>
                                <option value="">Select State</option>
                                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                              {addrErrors.state && <div className="field-error">{addrErrors.state}</div>}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`floating-input ${addrErrors.zip ? "has-error" : ""}`}>
                              <label>PIN Code</label>
                              <input type="text" placeholder="6-digit PIN" maxLength={6}
                                value={newAddress.zip}
                                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value.replace(/\D/g, "") })} />
                              {addrErrors.zip && <div className="field-error">{addrErrors.zip}</div>}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="floating-input">
                              <label>Country</label>
                              <input type="text" value="India" readOnly style={{ background: "#f7f7f8", cursor: "not-allowed" }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Guest address form */}
              {isGuest && (
                <div className="row g-3">
                  <div className="col-12">
                    <div className={`floating-input ${guestErrors.line1 ? "has-error" : ""}`}>
                      <label>Address Line 1</label>
                      <input type="text" placeholder="House/Flat No., Street, Area"
                        value={guestAddress.line1}
                        onChange={(e) => setGuestAddress({ ...guestAddress, line1: e.target.value })} />
                      {guestErrors.line1 && <div className="field-error">{guestErrors.line1}</div>}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="floating-input">
                      <label>Address Line 2 (Optional)</label>
                      <input type="text" placeholder="Landmark, Colony"
                        value={guestAddress.line2 || ""}
                        onChange={(e) => setGuestAddress({ ...guestAddress, line2: e.target.value })} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={`floating-input ${guestErrors.city ? "has-error" : ""}`}>
                      <label>City</label>
                      <input type="text" placeholder="City"
                        value={guestAddress.city}
                        onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })} />
                      {guestErrors.city && <div className="field-error">{guestErrors.city}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={`floating-input ${guestErrors.state ? "has-error" : ""}`}>
                      <label>State</label>
                      <select value={guestAddress.state}
                        onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {guestErrors.state && <div className="field-error">{guestErrors.state}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={`floating-input ${guestErrors.zip ? "has-error" : ""}`}>
                      <label>PIN Code</label>
                      <input type="text" placeholder="6-digit PIN" maxLength={6}
                        value={guestAddress.zip}
                        onChange={(e) => setGuestAddress({ ...guestAddress, zip: e.target.value.replace(/\D/g, "") })} />
                      {guestErrors.zip && <div className="field-error">{guestErrors.zip}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="floating-input">
                      <label>Country</label>
                      <input type="text" value="India" readOnly style={{ background: "#f7f7f8", cursor: "not-allowed" }} />
                    </div>
                  </div>
                </div>
              )}
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
                  <label key={pm.value} className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{
                      border: `1.5px solid ${paymentMethod === pm.value ? "var(--prime-orange)" : "var(--prime-border)"}`,
                      background: paymentMethod === pm.value ? "rgba(255,140,66,0.04)" : "#fff",
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                    <input type="radio" name="paymentMethod" value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="form-check-input m-0"
                      style={{ accentColor: "var(--prime-orange)" }} />
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

              {/* Coupon */}
              {!isGuest && (
                <div className="mb-3">
                  {appliedCoupon ? (
                    <div className="d-flex align-items-center justify-content-between p-2 rounded-3"
                      style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <Tag size={14} style={{ color: "#10b981" }} />
                        <span className="fw-bold" style={{ fontSize: "0.85rem", color: "#10b981" }}>{appliedCoupon.code}</span>
                        <span className="text-muted" style={{ fontSize: "0.78rem" }}>applied</span>
                      </div>
                      <button type="button" className="btn p-0 border-0 bg-transparent" onClick={handleRemoveCoupon}>
                        <X size={14} style={{ color: "#888" }} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex gap-2">
                        <input type="text" className="form-control form-control-sm fw-semibold"
                          placeholder="Coupon code" value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                          style={{ borderRadius: 8, fontSize: "0.85rem" }} />
                        <button type="button" className="btn btn-sm fw-bold flex-shrink-0"
                          style={{ background: "var(--prime-gradient)", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.82rem", whiteSpace: "nowrap" }}
                          onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                          {couponLoading ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> : "Apply"}
                        </button>
                      </div>
                      {couponError && <div className="mt-1 fw-semibold" style={{ fontSize: "0.78rem", color: "#dc2626" }}>{couponError}</div>}
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold">{formatPrice(totalPrice)}</span>
              </div>
              {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "#10b981", fontSize: "0.88rem" }}>Coupon ({appliedCoupon.code})</span>
                  <span className="fw-semibold" style={{ color: "#10b981" }}>−{formatPrice(appliedCoupon.couponDiscount)}</span>
                </div>
              )}
              {(() => {
                const discounted = appliedCoupon ? totalPrice - appliedCoupon.couponDiscount : totalPrice;
                const shipping = discounted >= freeShippingThreshold ? 0 : standardShippingRate;
                const taxAmount = taxInclusive ? 0 : Math.round(discounted * taxRate / 100);
                const grandTotal = discounted + shipping + taxAmount;
                return (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        Shipping
                        {shipping === 0 && (
                          <span className="ms-1 badge rounded-pill" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", fontSize: "0.7rem" }}>FREE</span>
                        )}
                      </span>
                      {shipping === 0 ? (
                        <span className="fw-semibold" style={{ color: "#10b981" }}>Free</span>
                      ) : (
                        <span className="fw-semibold">{formatPrice(shipping)}</span>
                      )}
                    </div>
                    {shipping > 0 && (
                      <div className="mb-2" style={{ fontSize: "0.78rem", color: "#888" }}>
                        Add {formatPrice(freeShippingThreshold - discounted)} more for free shipping
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">
                        Tax (GST {taxRate}%)
                        {taxInclusive && <span className="ms-1" style={{ fontSize: "0.75rem" }}>(incl.)</span>}
                      </span>
                      <span className="fw-semibold">
                        {taxInclusive ? "Included" : formatPrice(taxAmount)}
                      </span>
                    </div>

                    <hr style={{ borderColor: "#f0f0f2" }} />

                    <div className="d-flex justify-content-between mb-4">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold" style={{ fontSize: "1.2rem", color: "var(--prime-deep)" }}>
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </>
                );
              })()}

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
    </>
  );
};

export default CheckoutPage;
