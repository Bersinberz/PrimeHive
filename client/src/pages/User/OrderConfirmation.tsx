import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const order = location.state?.order;

  const isCustomer = isAuthenticated && user?.role === "user";

  if (!order) {
    navigate("/");
    return null;
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="form-panel text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle"
              style={{ width: 80, height: 80, background: "rgba(16,185,129,0.1)" }}
            >
              <CheckCircle size={40} style={{ color: "#059669" }} />
            </motion.div>

            <h2 className="fw-bold mb-2">Order Placed!</h2>
            <p className="text-muted mb-4">
              Thank you for your order. We'll process it right away.
            </p>

            {/* Order ID */}
            <div
              className="rounded-3 p-3 mb-4 d-inline-block"
              style={{ background: "rgba(255,140,66,0.08)", border: "1.5px dashed var(--prime-orange)" }}
            >
              <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>Order ID</p>
              <p className="mb-0 fw-bold" style={{ fontSize: "1.1rem", color: "var(--prime-deep)" }}>
                {order.orderId}
              </p>
            </div>

            {/* Details */}
            <div className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-4" style={{ background: "#f7f7f8" }}>
              <div className="text-start">
                <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>Total Amount</p>
                <p className="mb-0 fw-bold" style={{ fontSize: "1.1rem" }}>{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="text-end">
                <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>Status</p>
                <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex flex-column gap-2">
              {isCustomer && (
                <Link
                  to="/orders"
                  className="btn rounded-pill py-2 fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
                  style={{ background: "var(--prime-gradient)", border: "none" }}
                >
                  <Package size={16} /> Track My Orders
                </Link>
              )}
              <Link
                to="/"
                className="btn rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{ border: "1.5px solid var(--prime-border)", background: "#fff" }}
              >
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
