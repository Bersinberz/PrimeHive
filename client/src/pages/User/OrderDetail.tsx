import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Package, MapPin, CreditCard, Tag,
  XCircle, RotateCcw, AlertTriangle,
  ShoppingBag, Settings, Truck, CheckCircle2,
} from "lucide-react";
import { getMyOrderById, cancelOrder, requestRefund } from "../../services/storefront/orderService";
import type { MyOrder } from "../../services/storefront/orderService";

const STATUS_META: Record<string, { bg: string; color: string; dot: string }> = {
  Pending:    { bg: "rgba(245,158,11,0.1)",  color: "#d97706", dot: "#f59e0b" },
  Paid:       { bg: "rgba(16,185,129,0.1)",  color: "#059669", dot: "#10b981" },
  Processing: { bg: "rgba(59,130,246,0.1)",  color: "#2563eb", dot: "#3b82f6" },
  Shipped:    { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed", dot: "#8b5cf6" },
  Delivered:  { bg: "rgba(16,185,129,0.1)",  color: "#059669", dot: "#10b981" },
  Cancelled:  { bg: "rgba(239,68,68,0.1)",   color: "#dc2626", dot: "#ef4444" },
  Refunded:   { bg: "rgba(107,114,128,0.1)", color: "#6b7280", dot: "#9ca3af" },
};

const STATUS_LABELS: Record<string, string> = {
  Pending:    "Order Placed",
  Paid:       "Order Placed",
  Processing: "Sent to Delivery",
  Shipped:    "Out for Delivery",
  Delivered:  "Delivered",
  Cancelled:  "Cancelled",
  Refunded:   "Refunded",
};

const PIPELINE: { key: string; label: string; sub: string; Icon: React.FC<any> }[] = [
  { key: "Pending",    label: "Order Placed",      sub: "We've received your order",     Icon: ShoppingBag },
  { key: "Processing", label: "Sent to Delivery",  sub: "Preparing your items",          Icon: Settings },
  { key: "Shipped",    label: "Out for Delivery",  sub: "On the way to you",             Icon: Truck },
  { key: "Delivered",  label: "Delivered",         sub: "Enjoy your purchase!",          Icon: CheckCircle2 },
];

const REFUND_PIPELINE: { key: string; label: string; sub: string; Icon: React.FC<any> }[] = [
  { key: "refund_requested", label: "Refund Requested", sub: "Waiting for admin review",   Icon: RotateCcw },
  { key: "refund_accepted",  label: "Refund Accepted",  sub: "Admin approved your refund", Icon: CheckCircle2 },
  { key: "refund_pickup",    label: "Picked Up",        sub: "Item collected",             Icon: Truck },
  { key: "Refunded",         label: "Refunded",         sub: "Amount will be credited",    Icon: CheckCircle2 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<MyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<null | 'cancel' | 'refund'>(null);
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    if (!id) return;
    getMyOrderById(id)
      .then(setOrder)
      .catch(() => navigate("/orders"))
      .finally(() => setLoading(false));
  }, [id]);

  // Poll every 30s to reflect delivery partner updates in real time
  useEffect(() => {
    if (!id) return;
    const poll = setInterval(() => {
      getMyOrderById(id).then(setOrder).catch(() => {});
    }, 30000);
    return () => clearInterval(poll);
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await cancelOrder(order._id);
      setOrder(prev => prev ? {
        ...prev,
        status: "Cancelled",
        timeline: [...(prev.timeline || []), { status: "Cancelled", timestamp: new Date().toISOString(), note: "Cancelled by customer" }],
      } : prev);
      setModal(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not cancel order. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await requestRefund(order._id, refundReason || undefined);
      setOrder(prev => prev ? {
        ...prev,
        status: "Refunded",
        timeline: [...(prev.timeline || []), { status: "Refunded", timestamp: new Date().toISOString(), note: refundReason || "Refund requested by customer" }],
      } : prev);
      setModal(null);
      setRefundReason("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not submit refund request. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: 1100 }}>
        <div className="rounded mb-4" style={{ height: 36, background: "var(--bg-surface-3)", width: 120 }} />
        <div className="row g-4">
          <div className="col-lg-7"><div className="form-panel" style={{ height: 400 }} /></div>
          <div className="col-lg-5"><div className="form-panel" style={{ height: 400 }} /></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const s = STATUS_META[order.status] || STATUS_META.Pending;
  const isCancelledOrRefunded = order.status === "Cancelled" || order.status === "Refunded";

  // Build timeline from order.timeline or fallback
  const timeline = order.timeline && order.timeline.length > 0
    ? order.timeline
    : [{ status: order.status, timestamp: order.createdAt }];

  const pipelineIdx = PIPELINE.findIndex(p => p.key === order.status);

  // Refund pipeline index based on refundStatus
  const refundPipelineIdx = (() => {
    if (order.status !== "Refunded" && order.refundStatus !== "pending_refund" && order.refundStatus !== "refunded") return -1;
    if (order.refundStatus === "pending_refund") return 0;
    if (order.refundStatus === "refunded" && order.status !== "Refunded") return 1;
    if (order.status === "Refunded") return 3;
    return 0;
  })();

  const isRefundFlow = order.refundStatus === "pending_refund" || order.refundStatus === "refunded" || order.status === "Refunded";

  const addr = order.shippingAddress;

  const label = (text: string) => (
    <p className="mb-2 fw-bold" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text-muted)" }}>
      {text}
    </p>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <button className="back-nav-btn mb-4" onClick={() => navigate("/orders")}>
        <ArrowLeft size={16} /> My Orders
      </button>

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h2 className="fw-black mb-0" style={{ letterSpacing: "-0.5px", fontSize: "1.4rem" }}>{order.orderId}</h2>
        <span className="badge rounded-pill px-3 py-2 fw-bold"
          style={{ background: s.bg, color: s.color, fontSize: "0.8rem" }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: s.dot, marginRight: 6, verticalAlign: "middle" }} />
          {order.status}
        </span>
        <span className="text-muted ms-auto" style={{ fontSize: "0.82rem" }}>
          Placed on {fmtDate(order.createdAt)}
        </span>
      </div>

      {/* ── NORMAL ORDER STEPPER ── */}
      {!isCancelledOrRefunded && !isRefundFlow && pipelineIdx >= 0 && (
        <div className="form-panel mb-4" style={{ padding: '28px 24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 22, left: '10%', right: '10%', height: 3, background: 'var(--bg-surface-3)', borderRadius: 4, zIndex: 0 }} />
            <motion.div initial={{ width: 0 }} animate={{ width: `${(pipelineIdx / (PIPELINE.length - 1)) * 80}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ position: 'absolute', top: 22, left: '10%', height: 3, background: 'var(--prime-gradient)', borderRadius: 4, zIndex: 1 }} />
            <div className="d-flex justify-content-between" style={{ position: 'relative', zIndex: 2 }}>
              {PIPELINE.map(({ key, label, sub, Icon }, idx) => {
                const done = idx < pipelineIdx; const active = idx === pipelineIdx; const future = idx > pipelineIdx;
                const event = order.timeline?.find(t => t.status === key);
                return (
                  <div key={key} className="d-flex flex-column align-items-center" style={{ flex: 1, gap: 10 }}>
                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.08 }}
                      style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || active ? 'var(--prime-gradient)' : 'var(--bg-surface-3)', border: active ? '3px solid var(--prime-orange)' : '3px solid transparent', boxShadow: active ? '0 0 0 5px rgba(255,140,66,0.15)' : done ? '0 2px 8px rgba(255,140,66,0.25)' : 'none', transition: 'all 0.3s' }}>
                      <Icon size={18} color={future ? 'var(--text-muted)' : '#fff'} />
                    </motion.div>
                    <div className="text-center" style={{ maxWidth: 90 }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: active ? 800 : done ? 700 : 500, color: active ? 'var(--prime-orange)' : done ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.3 }}>{label}</p>
                      {event
                        ? <p style={{ margin: '3px 0 0', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>{new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        : <p style={{ margin: '3px 0 0', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>{future ? sub : ''}</p>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{PIPELINE[pipelineIdx]?.sub}</p>
          </div>
        </div>
      )}

      {/* ── REFUND STEPPER ── */}
      {isRefundFlow && (
        <div className="form-panel mb-4" style={{ padding: '28px 24px', border: '1.5px solid rgba(107,114,128,0.2)', background: 'rgba(107,114,128,0.02)' }}>
          <p style={{ margin: '0 0 20px', fontSize: '0.72rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Refund Progress</p>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 22, left: '12%', right: '12%', height: 3, background: 'var(--bg-surface-3)', borderRadius: 4, zIndex: 0 }} />
            <motion.div initial={{ width: 0 }} animate={{ width: `${(refundPipelineIdx / (REFUND_PIPELINE.length - 1)) * 76}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ position: 'absolute', top: 22, left: '12%', height: 3, background: 'linear-gradient(90deg,#6b7280,#9ca3af)', borderRadius: 4, zIndex: 1 }} />
            <div className="d-flex justify-content-between" style={{ position: 'relative', zIndex: 2 }}>
              {REFUND_PIPELINE.map(({ key, label, sub, Icon }, idx) => {
                const done = idx < refundPipelineIdx; const active = idx === refundPipelineIdx; const future = idx > refundPipelineIdx;
                return (
                  <div key={key} className="d-flex flex-column align-items-center" style={{ flex: 1, gap: 10 }}>
                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.08 }}
                      style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || active ? 'linear-gradient(135deg,#6b7280,#9ca3af)' : 'var(--bg-surface-3)', border: active ? '3px solid #6b7280' : '3px solid transparent', boxShadow: active ? '0 0 0 5px rgba(107,114,128,0.15)' : 'none', transition: 'all 0.3s' }}>
                      <Icon size={18} color={future ? 'var(--text-muted)' : '#fff'} />
                    </motion.div>
                    <div className="text-center" style={{ maxWidth: 90 }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: active ? 800 : done ? 700 : 500, color: active ? '#6b7280' : done ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.3 }}>{label}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>{future ? sub : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>{REFUND_PIPELINE[refundPipelineIdx]?.sub}</p>
          </div>
        </div>
      )}

      {/* ── CANCELLED BANNER ── */}
      {order.status === 'Cancelled' && (
        <div className="form-panel mb-4 d-flex align-items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <XCircle size={22} color="#dc2626" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#dc2626' }}>Order Cancelled</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{order.timeline?.slice(-1)[0]?.note || 'This order has been cancelled.'}</p>
          </div>
        </div>
      )}

      <div className="row g-4 align-items-start">

        {/* LEFT — Items */}
        <div className="col-lg-7">
          <div className="form-panel p-0 overflow-hidden mb-4">
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-surface-2)" }}>
              <p className="mb-0 fw-bold" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text-muted)" }}>
                Items Ordered ({order.items.length})
              </p>
            </div>
            {order.items.map((item, i) => (
              <div key={i} className="d-flex align-items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < order.items.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                <div className="rounded-3 overflow-hidden flex-shrink-0"
                  style={{ width: 64, height: 64, background: "var(--bg-surface-3)", cursor: item.product ? "pointer" : "default" }}
                  onClick={() => item.product && navigate(`/products/${item.product}`)}>
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                    : <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        <Package size={20} style={{ color: "var(--text-muted)" }} />
                      </div>
                  }
                </div>
                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: "0.92rem" }}>{item.name}</p>
                  <p className="mb-0" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {fmt(item.price)} &times; {item.quantity}
                  </p>
                </div>
                <span className="fw-bold flex-shrink-0" style={{ fontSize: "0.95rem" }}>
                  {fmt(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Activity Log */}
          <div className="form-panel">
            <p className="mb-3 fw-bold" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text-muted)" }}>
              Activity
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[...timeline].reverse()
                .filter(event => event.status !== 'Paid')
                .map((event, idx) => {
                const es = STATUS_META[event.status] || STATUS_META.Pending;
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ display: 'flex', gap: 14, paddingBottom: 20, position: 'relative' }}
                  >
                    {/* Vertical connector */}
                    {idx < timeline.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 11, top: 24, bottom: 0,
                        width: 2, background: 'var(--bg-surface-3)',
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: isFirst ? es.dot : 'var(--bg-surface-3)',
                      border: `2px solid ${isFirst ? es.dot : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isFirst ? `0 0 0 4px ${es.dot}22` : 'none',
                      zIndex: 1,
                    }}>
                      {isFirst && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingTop: 2 }}>
                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isFirst ? es.color : 'var(--text-secondary)' }}>
                          {STATUS_LABELS[event.status] || event.status}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {fmtDate(event.timestamp)}
                        </span>
                      </div>
                      {event.note && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{event.note}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — Summary */}
        <div className="col-lg-5">
          <div className="form-panel" style={{ position: "sticky", top: 90 }}>

            {/* Bill */}
            {label("Bill Summary")}
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Subtotal</span>
              <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>{fmt(order.subtotal ?? order.totalAmount)}</span>
            </div>
            {order.couponCode && (order.couponDiscount ?? 0) > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span style={{ fontSize: "0.88rem", color: "#10b981" }}>
                  <Tag size={12} className="me-1" />Coupon ({order.couponCode})
                </span>
                <span className="fw-semibold" style={{ fontSize: "0.88rem", color: "#10b981" }}>
                  -{fmt(order.couponDiscount!)}
                </span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Shipping</span>
              <span className="fw-semibold" style={{ fontSize: "0.88rem", color: (order.shippingCost ?? 0) === 0 ? "#10b981" : undefined }}>
                {(order.shippingCost ?? 0) === 0 ? "Free" : fmt(order.shippingCost!)}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Tax (GST {order.taxRate ?? 18}%)
                {order.taxInclusive && <span className="ms-1" style={{ fontSize: "0.72rem" }}>(incl.)</span>}
              </span>
              <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>
                {order.taxInclusive ? "Included" : fmt(order.tax ?? 0)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center pt-3 mb-4"
              style={{ borderTop: "2px solid var(--border-color)" }}>
              <span className="fw-black" style={{ fontSize: "1rem" }}>Total</span>
              <span className="fw-black" style={{ fontSize: "1.25rem", color: "var(--prime-deep)" }}>
                {fmt(order.totalAmount)}
              </span>
            </div>

            {/* Payment */}
            {label("Payment Method")}
            <div className="d-flex align-items-center gap-2 mb-4">
              <CreditCard size={14} style={{ color: "var(--prime-orange)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>{order.paymentMethod || "—"}</span>
            </div>

            {/* Address */}
            {label("Deliver To")}
            <div className="d-flex align-items-start gap-2">
              <MapPin size={14} className="flex-shrink-0 mt-1" style={{ color: "var(--prime-orange)" }} />
              <p className="mb-0" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {[addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip, addr?.country].filter(Boolean).join(", ")}
              </p>
            </div>

            {/* Cancel button — only for Pending/Paid/Processing */}
            {["Pending", "Paid", "Processing"].includes(order.status) && (
              <button
                className="btn w-100 mt-4 fw-bold rounded-3"
                style={{ border: "1.5px solid #ef4444", color: "#ef4444", background: "rgba(239,68,68,0.05)", padding: "10px" }}
                onClick={() => setModal('cancel')}
              >
                <XCircle size={15} className="me-2" />Cancel Order
              </button>
            )}

            {/* Refund button — only after Delivered */}
            {order.status === "Delivered" && (
              <button
                className="btn w-100 mt-4 fw-bold rounded-3"
                style={{ border: "1.5px solid var(--prime-orange)", color: "var(--prime-orange)", background: "rgba(255,107,53,0.05)", padding: "10px" }}
                onClick={() => setModal('refund')}
              >
                <RotateCcw size={15} className="me-2" />Request Refund
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
            }}
            onClick={() => !actionLoading && setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="form-panel"
              style={{ maxWidth: 420, width: "100%", padding: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: modal === 'cancel' ? "rgba(239,68,68,0.1)" : "rgba(255,107,53,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertTriangle size={20} style={{ color: modal === 'cancel' ? "#ef4444" : "var(--prime-orange)" }} />
                </div>
                <div>
                  <h5 className="fw-black mb-0" style={{ fontSize: "1rem" }}>
                    {modal === 'cancel' ? "Cancel Order?" : "Request Refund?"}
                  </h5>
                  <p className="mb-0" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {modal === 'cancel'
                      ? "This action cannot be undone."
                      : "Tell us why you'd like a refund."}
                  </p>
                </div>
              </div>

              {modal === 'cancel' && (
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                  Are you sure you want to cancel order <strong>{order.orderId}</strong>? Your items will be restocked and you'll receive a confirmation email.
                </p>
              )}

              {modal === 'refund' && (
                <div className="mb-4">
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 12 }}>
                    You're requesting a refund for order <strong>{order.orderId}</strong>. Our team will review it within 2–3 business days.
                  </p>
                  <textarea
                    className="form-control rounded-3"
                    rows={3}
                    placeholder="Reason for refund (optional)"
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    style={{ fontSize: "0.88rem", resize: "none" }}
                  />
                </div>
              )}

              <div className="d-flex gap-2">
                <button
                  className="btn flex-grow-1 fw-semibold rounded-3"
                  style={{ border: "1.5px solid var(--border-color)", background: "var(--bg-surface)", color: "var(--text-primary)" }}
                  onClick={() => setModal(null)}
                  disabled={actionLoading}
                >
                  Go Back
                </button>
                <button
                  className="btn flex-grow-1 fw-bold rounded-3 text-white"
                  style={{
                    background: modal === 'cancel' ? "#ef4444" : "var(--prime-gradient)",
                    border: "none",
                  }}
                  onClick={modal === 'cancel' ? handleCancel : handleRefund}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Processing..."
                    : modal === 'cancel' ? "Yes, Cancel" : "Submit Request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetailPage;
