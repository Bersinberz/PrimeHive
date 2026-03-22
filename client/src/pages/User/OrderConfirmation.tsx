import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ShoppingBag, MapPin, CreditCard, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { storeName } = useSettings();
  const order = location.state?.order;
  const isCustomer = isAuthenticated && user?.role === "user";

  if (!order) { navigate("/"); return null; }

  const fmt = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const addr = order.shippingAddress;
  const addrLine = [addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip, addr?.country]
    .filter(Boolean).join(", ");

  const label = (text: string) => (
    <p className="mb-2 fw-bold" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.7px", color: "#aaa" }}>
      {text}
    </p>
  );

  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Success header */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{ width: 68, height: 68, background: "rgba(16,185,129,0.1)" }}
          >
            <CheckCircle2 size={34} style={{ color: "#059669" }} />
          </motion.div>
          <h2 className="fw-black mb-1" style={{ fontSize: "1.7rem", letterSpacing: "-0.5px" }}>Order Placed!</h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
            Thank you for shopping with {storeName}. A confirmation email has been sent to you.
          </p>
        </div>

        {/* Order ID + date strip */}
        <div className="d-flex align-items-center justify-content-between rounded-3 px-4 py-3 mb-4"
          style={{ background: "rgba(99,102,241,0.06)", border: "1.5px solid rgba(99,102,241,0.18)" }}>
          <div>
            <p className="mb-0" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: "#aaa" }}>Order ID</p>
            <p className="mb-0 fw-black" style={{ fontSize: "1.1rem", color: "#6366f1" }}>{order.orderId}</p>
          </div>
          <div className="text-end">
            <p className="mb-0" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: "#aaa" }}>Placed on</p>
            <p className="mb-0 fw-semibold" style={{ fontSize: "0.9rem", color: "#333" }}>{dateStr}</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="row g-4 align-items-start">

          {/* LEFT — Items */}
          <div className="col-lg-7">
            <div className="form-panel p-0 overflow-hidden">
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #f0f0f2", background: "#fafafa" }}>
                <p className="mb-0 fw-bold" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.7px", color: "#888" }}>
                  Items Ordered ({(order.items || []).length})
                </p>
              </div>
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="d-flex align-items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < order.items.length - 1 ? "1px solid #f0f0f2" : "none" }}>
                  <div className="rounded-3 overflow-hidden flex-shrink-0"
                    style={{ width: 64, height: 64, background: "#f0f0f2", cursor: "pointer" }}
                    onClick={() => navigate(`/products/${item.product}`)}>
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                      : <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                          <Package size={20} style={{ color: "#ccc" }} />
                        </div>
                    }
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: "0.92rem" }}>{item.name}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                      Qty: {item.quantity} &times; {fmt(item.price)}
                    </p>
                  </div>
                  <span className="fw-bold flex-shrink-0" style={{ fontSize: "0.95rem" }}>
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="col-lg-5">
            <div className="form-panel" style={{ position: "sticky", top: 90 }}>

              {/* Bill summary */}
              {label("Bill Summary")}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted" style={{ fontSize: "0.88rem" }}>Subtotal</span>
                <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>{fmt(order.subtotal ?? order.totalAmount)}</span>
              </div>
              {order.couponCode && order.couponDiscount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ fontSize: "0.88rem", color: "#10b981" }}>
                    <Tag size={12} className="me-1" />Coupon ({order.couponCode})
                  </span>
                  <span className="fw-semibold" style={{ fontSize: "0.88rem", color: "#10b981" }}>
                    -{fmt(order.couponDiscount)}
                  </span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted" style={{ fontSize: "0.88rem" }}>Shipping</span>
                <span className="fw-semibold" style={{ fontSize: "0.88rem", color: order.shippingCost === 0 ? "#10b981" : undefined }}>
                  {order.shippingCost === 0 ? "Free" : fmt(order.shippingCost ?? 0)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted" style={{ fontSize: "0.88rem" }}>
                  Tax (GST {order.taxRate ?? 18}%)
                  {order.taxInclusive && <span className="ms-1" style={{ fontSize: "0.72rem" }}>(incl.)</span>}
                </span>
                <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>
                  {order.taxInclusive ? "Included" : fmt(order.tax ?? 0)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-3 mb-4"
                style={{ borderTop: "2px solid #f0f0f2" }}>
                <span className="fw-black" style={{ fontSize: "1rem" }}>Total</span>
                <span className="fw-black" style={{ fontSize: "1.25rem", color: "var(--prime-deep)" }}>
                  {fmt(order.totalAmount)}
                </span>
              </div>

              {/* Deliver to */}
              {label("Deliver To")}
              <div className="d-flex align-items-start gap-2 mb-4">
                <MapPin size={14} className="flex-shrink-0 mt-1" style={{ color: "var(--prime-orange)" }} />
                <p className="mb-0" style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.7 }}>{addrLine}</p>
              </div>

              {/* Payment */}
              {label("Payment")}
              <div className="d-flex align-items-center gap-2 mb-4">
                <CreditCard size={14} style={{ color: "var(--prime-orange)" }} />
                <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>{order.paymentMethod}</span>
                <span className="badge rounded-pill ms-1 px-2 py-1"
                  style={{ background: "rgba(245,158,11,0.1)", color: "#d97706", fontSize: "0.72rem" }}>
                  {order.status}
                </span>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column gap-2">
                {isCustomer && (
                  <Link to="/orders"
                    className="btn rounded-pill py-2 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                    style={{ background: "var(--prime-gradient)", border: "none" }}>
                    <Package size={15} /> Track My Orders
                  </Link>
                )}
                <Link to="/"
                  className="btn rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{ border: "1.5px solid var(--prime-border)", background: "#fff" }}>
                  <ShoppingBag size={15} /> Continue Shopping
                </Link>
              </div>

            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default OrderConfirmation;
