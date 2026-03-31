import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingBag, ChevronRight, Calendar } from "lucide-react";
import { getMyOrders } from "../../services/storefront/orderService";
import type { MyOrder } from "../../services/storefront/orderService";
import { useAuth } from "../../context/AuthContext";

const STATUS_META: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  Pending:    { bg: "rgba(245,158,11,0.1)",  color: "#d97706", dot: "#f59e0b", label: "Order Placed" },
  Paid:       { bg: "rgba(245,158,11,0.1)",  color: "#d97706", dot: "#f59e0b", label: "Order Placed" },
  Processing: { bg: "rgba(59,130,246,0.1)",  color: "#2563eb", dot: "#3b82f6", label: "Sent to Delivery" },
  Shipped:    { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed", dot: "#8b5cf6", label: "Out for Delivery" },
  Delivered:  { bg: "rgba(16,185,129,0.1)",  color: "#059669", dot: "#10b981", label: "Delivered" },
  Cancelled:  { bg: "rgba(239,68,68,0.1)",   color: "#dc2626", dot: "#ef4444", label: "Cancelled" },
  Refunded:   { bg: "rgba(107,114,128,0.1)", color: "#6b7280", dot: "#9ca3af", label: "Refunded" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const isCustomer = isAuthenticated && user?.role === "user";

  useEffect(() => {
    if (!isCustomer) { navigate("/auth"); return; }
    setLoading(true);
    getMyOrders(page)
      .then((res) => {
        setOrders(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, isCustomer, navigate]);

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: 860 }}>
        <h2 className="fw-black mb-4" style={{ letterSpacing: "-0.5px" }}>My Orders</h2>
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="form-panel" style={{ height: 110 }}>
              <div className="rounded-3 mb-3" style={{ height: 14, background: "var(--bg-surface-3)", width: "35%" }} />
              <div className="rounded-3 mb-2" style={{ height: 11, background: "var(--bg-surface-3)", width: "55%" }} />
              <div className="rounded-3" style={{ height: 11, background: "var(--bg-surface-3)", width: "25%" }} />
            </div>
          ))}
        </div>
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
          <button className="btn rounded-pill px-5 py-2 fw-bold text-white"
            style={{ background: "var(--prime-gradient)", border: "none" }}
            onClick={() => navigate("/")}>
            <ShoppingBag size={16} className="me-2" /> Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-black mb-0" style={{ letterSpacing: "-0.5px" }}>My Orders</h2>
        <span className="text-muted" style={{ fontSize: "0.88rem" }}>{total} order{total !== 1 ? "s" : ""}</span>
      </div>

      <div className="d-flex flex-column gap-3">
        {orders.map((order, i) => {
          const s = STATUS_META[order.status] || STATUS_META.Pending;
          const thumbs = order.items.slice(0, 4);
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.18 }}
            >
              <div
                className="form-panel p-0 overflow-hidden"
                style={{ cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }}
                onClick={() => navigate(`/orders/${order._id}`)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = s.dot + "60";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "";
                }}
              >
                {/* Header bar */}
                <div className="d-flex align-items-center justify-content-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-surface-2)" }}>
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <p className="mb-0 fw-black" style={{ fontSize: "0.95rem", letterSpacing: "-0.2px" }}>
                        {order.orderId}
                      </p>
                      <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Calendar size={11} />
                        <span>{fmtDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-pill px-2 py-1 fw-bold"
                      style={{ background: s.bg, color: s.color, fontSize: "0.72rem" }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: s.dot, marginRight: 5, verticalAlign: "middle" }} />
                      {s.label}
                    </span>
                    <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Body */}
                <div className="d-flex align-items-center gap-4 px-4 py-3">
                  {/* Thumbnails */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {thumbs.map((item, idx) => (
                      <div key={idx} className="rounded-3 overflow-hidden flex-shrink-0"
                        style={{ width: 52, height: 52, background: "var(--bg-surface-3)", border: "1px solid var(--border-color)" }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                          : <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                              <Package size={16} style={{ color: "var(--text-muted)" }} />
                            </div>
                        }
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, background: "var(--bg-surface-3)", border: "1px solid var(--border-color)", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Item names */}
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: "0.88rem" }}>
                      {order.items[0]?.name}
                      {order.items.length > 1 && (
                        <span className="text-muted fw-normal"> +{order.items.length - 1} more</span>
                      )}
                    </p>
                    <p className="mb-0" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      {order.paymentMethod && <span className="ms-2">· {order.paymentMethod}</span>}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-end flex-shrink-0">
                    <p className="mb-0 fw-black" style={{ fontSize: "1.05rem", color: "var(--prime-deep)" }}>
                      {fmt(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button className="btn btn-sm rounded-pill px-3 fw-semibold"
            style={{ border: "1.5px solid var(--border-color)", background: "var(--bg-surface)" }}
            disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
          <button className="btn btn-sm rounded-pill px-3 fw-semibold"
            style={{ border: "1.5px solid var(--border-color)", background: "var(--bg-surface)" }}
            disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
