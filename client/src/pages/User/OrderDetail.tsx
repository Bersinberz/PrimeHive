import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin } from "lucide-react";
import { getMyOrderById } from "../../services/storefront/orderService";
import type { MyOrder } from "../../services/storefront/orderService";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:    { bg: "rgba(245,158,11,0.1)",  color: "#d97706" },
  Paid:       { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  Processing: { bg: "rgba(59,130,246,0.1)",  color: "#2563eb" },
  Shipped:    { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed" },
  Delivered:  { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  Cancelled:  { bg: "rgba(239,68,68,0.1)",   color: "#dc2626" },
  Refunded:   { bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<MyOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMyOrderById(id)
      .then(setOrder)
      .catch(() => navigate("/orders"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="container py-4">
        <div className="rounded mb-4" style={{ height: 36, background: "#f0f0f2", width: 120 }} />
        <div className="form-panel" style={{ height: 300 }} />
      </div>
    );
  }

  if (!order) return null;

  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;

  return (
    <div className="container py-4">
      <button className="back-nav-btn mb-4" onClick={() => navigate("/orders")}>
        <ArrowLeft size={16} /> My Orders
      </button>

      <div className="d-flex align-items-center gap-3 mb-4">
        <h2 className="fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>{order.orderId}</h2>
        <span className="badge rounded-pill px-3 py-2" style={{ background: statusStyle.bg, color: statusStyle.color }}>
          {order.status}
        </span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Items */}
          <div className="form-panel mb-4">
            <div className="form-section-title">
              <div className="section-icon" style={{ background: "rgba(255,140,66,0.1)" }}>
                <Package size={16} style={{ color: "var(--prime-orange)" }} />
              </div>
              Order Items
            </div>
            <div className="d-flex flex-column gap-3">
              {order.items.map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-3">
                  <div className="rounded-3 overflow-hidden flex-shrink-0" style={{ width: 60, height: 60, background: "#f0f0f2" }}>
                    {item.image && <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />}
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-semibold" style={{ fontSize: "0.9rem" }}>{item.name}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="fw-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="form-panel">
            <div className="form-section-title">
              <div className="section-icon" style={{ background: "rgba(255,140,66,0.1)" }}>
                <MapPin size={16} style={{ color: "var(--prime-orange)" }} />
              </div>
              Shipping Address
            </div>
            <p className="mb-1 fw-semibold">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="mb-1 text-muted">{order.shippingAddress.line2}</p>}
            <p className="mb-0 text-muted">
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.zip}
            </p>
            <p className="mb-0 text-muted">{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="form-panel" style={{ position: "sticky", top: 90 }}>
            <h6 className="fw-bold mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Placed on</span>
              <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{formatDate(order.createdAt)}</span>
            </div>
            <hr style={{ borderColor: "#f0f0f2" }} />
            <div className="d-flex justify-content-between">
              <span className="fw-bold">Total</span>
              <span className="fw-bold" style={{ color: "var(--prime-deep)", fontSize: "1.1rem" }}>
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
