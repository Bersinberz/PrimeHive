import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { getMyOrders } from "../../services/storefront/orderService";
import type { MyOrder } from "../../services/storefront/orderService";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:    { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
  Paid:       { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  Processing: { bg: "rgba(59,130,246,0.1)",  color: "#2563eb" },
  Shipped:    { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed" },
  Delivered:  { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  Cancelled:  { bg: "rgba(239,68,68,0.1)",   color: "#dc2626" },
  Refunded:   { bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
};

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isCustomer = isAuthenticated && user?.role === "user";

  useEffect(() => {
    if (!isCustomer) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    getMyOrders(page)
      .then((res) => {
        setOrders(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, isCustomer, navigate]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="container py-4">
        <h2 className="fw-bold mb-4">My Orders</h2>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="form-panel mb-3" style={{ height: 90 }}>
            <div className="rounded" style={{ height: 14, background: "#f0f0f2", width: "30%", marginBottom: 8 }} />
            <div className="rounded" style={{ height: 12, background: "#f0f0f2", width: "50%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5">
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <Package size={40} style={{ color: "var(--prime-orange)" }} />
          </div>
          <h4 className="fw-bold">No orders yet</h4>
          <p className="text-muted mb-4">Start shopping to see your orders here.</p>
          <button
            className="btn rounded-pill px-5 py-2 fw-bold text-white"
            style={{ background: "var(--prime-gradient)", border: "none" }}
            onClick={() => navigate("/")}
          >
            <ShoppingBag size={16} className="me-2" />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ letterSpacing: "-0.5px" }}>My Orders</h2>

      <div className="d-flex flex-column gap-3">
        {orders.map((order) => {
          const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
          return (
            <div
              key={order._id}
              className="form-panel d-flex align-items-center gap-4"
              style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}
              onClick={() => navigate(`/orders/${order._id}`)}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
            >
              {/* Icon */}
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 52, height: 52, background: "rgba(255,140,66,0.08)" }}
              >
                <Package size={22} style={{ color: "var(--prime-orange)" }} />
              </div>

              {/* Info */}
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="fw-bold" style={{ fontSize: "0.95rem" }}>{order.orderId}</span>
                  <span
                    className="badge rounded-pill px-2 py-1"
                    style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: "0.72rem" }}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mb-0 text-muted" style={{ fontSize: "0.82rem" }}>
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatDate(order.createdAt)}
                </p>
              </div>

              {/* Amount */}
              <div className="text-end flex-shrink-0">
                <p className="mb-0 fw-bold" style={{ color: "var(--prime-deep)" }}>{formatPrice(order.totalAmount)}</p>
              </div>

              <ChevronRight size={18} style={{ color: "#ccc", flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button
            className="btn btn-sm rounded-pill px-3 fw-semibold"
            style={{ border: "1.5px solid var(--prime-border)", background: "#fff" }}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="d-flex align-items-center px-3 text-muted" style={{ fontSize: "0.9rem" }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm rounded-pill px-3 fw-semibold"
            style={{ border: "1.5px solid var(--prime-border)", background: "#fff" }}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
