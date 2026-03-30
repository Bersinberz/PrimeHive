import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from '../../services/admin/orderService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import { getInitialsAvatar } from '../../utils/avatarUtils';

const OrderManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const PIPELINE_STEPS: OrderStatus[] = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered'];
  const DANGER_STEPS: OrderStatus[] = ['Cancelled', 'Refunded'];

  const getStepIndex = (status: OrderStatus) => PIPELINE_STEPS.indexOf(status);

  const isFinalized = (status: OrderStatus) =>
    ['Cancelled', 'Refunded', 'Delivered'].includes(status);
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error: any) {
      showToast({ type: 'error', title: 'Couldn\'t load orders', message: error?.message || 'Something went wrong. Please refresh and try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = async (order: Order) => {
    setIsLoading(true);
    try {
      const fullOrder = await getOrderById(order._id);
      setSelectedOrder(fullOrder);
      setNewStatus(fullOrder.status);
      setView('details');
    } catch (error: any) {
      showToast({ type: 'error', title: 'Couldn\'t load order', message: 'We couldn\'t fetch the order details. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (targetStatus?: OrderStatus) => {
    const statusToApply = targetStatus || (newStatus as OrderStatus);
    if (!selectedOrder || !statusToApply || statusToApply === selectedOrder.status) return;

    setIsSaving(true);
    try {
      const updatedOrder = await updateOrderStatus(selectedOrder._id, statusToApply);
      setSelectedOrder(updatedOrder);
      setNewStatus(updatedOrder.status);
      showToast({ type: 'success', title: 'Status updated', message: `Order is now marked as "${updatedOrder.status}".` });
      fetchOrders();
    } catch (error: any) {
      showToast({ type: 'error', title: 'Couldn\'t update status', message: error?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Framer Motion Variants
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  // Helper for Status Badge Styling
  const getStatusBadgeClass = (status: OrderStatus) => {
    const map: Record<string, { color: string; bg: string }> = {
      Delivered: { color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
      Processing: { color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
      Shipped: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
      Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
      Paid: { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
      Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
      Refunded: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    };
    return map[status] || { color: '#999', bg: '#f5f5f7' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatAddress = (addr: any) => {
    if (!addr) return 'N/A';
    const parts = [addr.line1, addr.line2, `${addr.city}, ${addr.state} ${addr.zip}`, addr.country].filter(Boolean);
    return parts.join('\n');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{
        maxWidth: '1400px',
        minHeight: '80vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          /* =========================================
             VIEW 1: ORDERS LIST
             ========================================= */
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
                Management
              </p>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', margin: '0 0 6px' }}>
                Orders
              </h2>
              <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                Track, fulfill, and manage customer orders.
              </p>
            </div>

            {/* Table Card */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', overflow: 'hidden' }}>
              <div className="table-responsive p-0">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ background: '#fafafa' }}>
                    <tr>
                      {['Order ID', 'Customer', 'Date', 'Payment', 'Status', 'Total', 'Actions'].map((h, i) => (
                        <th key={h} className={`py-3 px-4 border-0 ${i === 5 || i === 6 ? 'text-end' : ''}`}
                          style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td className="py-3 px-4 border-light fw-bold text-dark">{o.orderId}</td>
                        <td className="py-3 px-4 border-light">
                          <div className="d-flex align-items-center">
                            <img src={getInitialsAvatar(o.customer?.name || 'U', '#f8fafc', '#475569')} alt={o.customer?.name} className="rounded-circle me-3 border" width="36" height="36" />
                            <span className="fw-bold text-dark">{o.customer?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-light fw-medium text-secondary">{formatDate(o.createdAt)}</td>
                        <td className="py-3 px-4 border-light fw-medium text-secondary">
                          <span className="d-flex align-items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            {o.paymentMethod?.split(' ')[0] || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-light">
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700,
                            color: getStatusBadgeClass(o.status).color,
                            background: getStatusBadgeClass(o.status).bg,
                            padding: '4px 12px', borderRadius: '20px',
                          }}>
                            {o.status}
                          </span>
                          {o.refundStatus === 'pending_refund' && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '20px', marginLeft: 4 }}>
                              Refund Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 border-light text-end fw-bolder text-dark">₹{o.totalAmount?.toFixed(2)}</td>
                        <td className="py-3 px-4 border-light text-end">
                          <button onClick={() => handleViewDetails(o)} className="btn btn-sm btn-light rounded-3 p-2 text-primary border-0" title="View Details">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && orders.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                          <p style={{ color: '#bbb', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                            No orders yet — they'll appear here once customers start placing them.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =========================================
             VIEW 2: ORDER DETAILS
             ========================================= */
          selectedOrder && (
            <motion.div key="details" variants={pageVariants} initial="initial" animate="animate" exit="exit">

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => { setView('list'); setSelectedOrder(null); }}
                    className="back-nav-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Orders
                  </button>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.6rem', letterSpacing: '-0.5px', margin: 0 }}>
                      {selectedOrder.orderId}
                    </h3>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      color: getStatusBadgeClass(selectedOrder.status).color,
                      background: getStatusBadgeClass(selectedOrder.status).bg,
                      padding: '5px 14px', borderRadius: '20px',
                    }}>{selectedOrder.status}</span>
                  </div>
                  <p style={{ color: '#999', fontSize: '0.88rem', fontWeight: 500, margin: '4px 0 0' }}>
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {/* LEFT COLUMN: Items & Timeline */}
                <div className="col-12 col-xl-8 d-flex flex-column gap-4">

                  {/* Ordered Items */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '24px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
                      Summary
                    </p>
                    <h5 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.1rem', margin: '0 0 20px', letterSpacing: '-0.3px' }}>
                      Items Ordered
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #f0f0f2' }} />
                            ) : (
                              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f0f0f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#bbb', fontSize: '0.7rem', fontWeight: 600 }}>No img</span>
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>{item.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#bbb', fontWeight: 500, marginTop: '2px' }}>Qty: {item.quantity}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '0.95rem' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f2' }}>
                      <span style={{ fontWeight: 700, color: '#aaa', fontSize: '0.85rem' }}>Total</span>
                      <h4 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.4rem', letterSpacing: '-0.5px', margin: 0 }}>₹{selectedOrder.totalAmount.toFixed(2)}</h4>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '24px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
                      History
                    </p>
                    <h5 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.1rem', margin: '0 0 20px', letterSpacing: '-0.3px' }}>
                      Order Timeline
                    </h5>
                    <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #f0f0f2' }}>
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={idx} style={{ position: 'relative', marginBottom: '20px', paddingLeft: '20px' }}>
                          <span style={{
                            position: 'absolute', left: '-27px', top: '2px',
                            width: '14px', height: '14px', borderRadius: '50%',
                            background: 'var(--prime-orange)', border: '2px solid #fff',
                            display: 'block',
                          }} />
                          <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>{event.status}</div>
                          <div style={{ fontSize: '0.75rem', color: '#bbb', fontWeight: 500, marginTop: '2px' }}>
                            {formatDate(event.timestamp)} · {formatTime(event.timestamp)}
                          </div>
                          {event.note && <p style={{ color: '#999', fontSize: '0.8rem', fontStyle: 'italic', margin: '4px 0 0' }}>"{event.note}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Customer, Shipping, Status */}
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">

                  {/* Change Status Action Box */}
                  <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '24px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
                      Actions
                    </p>
                    <h6 style={{ fontWeight: 900, color: '#fff', fontSize: '1rem', margin: '0 0 20px' }}>Update Status</h6>

                    {isFinalized(selectedOrder.status) ? (
                      <p style={{ color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600, margin: 0, textAlign: 'center', padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px' }}>
                        This order is finalized and can't be changed.
                      </p>
                    ) : (
                      <>
                        {/* Main pipeline steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {PIPELINE_STEPS.map((step, idx) => {
                            const currentIdx = getStepIndex(selectedOrder.status);
                            const isDone = idx < currentIdx;
                            const isCurrent = step === selectedOrder.status;
                            const isNext = idx === currentIdx + 1;
                            const isFuture = idx > currentIdx + 1;

                            return (
                              <button
                                key={step}
                                disabled={isSaving || isCurrent || isDone || isFuture}
                                onClick={() => isNext ? handleStatusUpdate(step) : undefined}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  padding: '10px 14px', borderRadius: '10px', border: 'none',
                                  cursor: isNext ? 'pointer' : 'default',
                                  background: isCurrent
                                    ? 'var(--prime-orange)'
                                    : isDone
                                      ? 'rgba(255,255,255,0.06)'
                                      : isNext
                                        ? 'rgba(255,255,255,0.12)'
                                        : 'rgba(255,255,255,0.03)',
                                  opacity: isFuture ? 0.35 : 1,
                                  transition: 'all 0.2s',
                                }}
                              >
                                {/* Step indicator */}
                                <span style={{
                                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.65rem', fontWeight: 800,
                                  background: isCurrent
                                    ? 'rgba(255,255,255,0.3)'
                                    : isDone
                                      ? 'rgba(16,185,129,0.3)'
                                      : isNext
                                        ? 'rgba(255,255,255,0.2)'
                                        : 'rgba(255,255,255,0.08)',
                                  color: isDone ? '#10b981' : '#fff',
                                }}>
                                  {isDone ? '✓' : idx + 1}
                                </span>
                                <span style={{
                                  fontSize: '0.85rem', fontWeight: 700,
                                  color: isCurrent ? '#fff' : isDone ? 'rgba(255,255,255,0.5)' : isNext ? '#fff' : 'rgba(255,255,255,0.3)',
                                  flex: 1, textAlign: 'left',
                                }}>
                                  {step}
                                </span>
                                {isCurrent && (
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '20px' }}>
                                    CURRENT
                                  </span>
                                )}
                                {isNext && !isSaving && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Danger actions */}
                        {!['Cancelled', 'Refunded'].includes(selectedOrder.status) && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', gap: '8px' }}>
                            {DANGER_STEPS.map(step => (
                              <button
                                key={step}
                                disabled={isSaving}
                                onClick={() => handleStatusUpdate(step)}
                                style={{
                                  flex: 1, padding: '9px 10px', borderRadius: '10px',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  background: 'rgba(239,68,68,0.08)',
                                  color: '#f87171', fontWeight: 700, fontSize: '0.78rem',
                                  cursor: 'pointer', transition: 'all 0.2s',
                                }}
                              >
                                {step}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Customer</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <img src={getInitialsAvatar(selectedOrder.customer?.name || 'U', '#f8fafc', '#475569')} alt="Customer" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #f0f0f2' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>{selectedOrder.customer?.name || 'Unknown'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#999', fontWeight: 500 }}>{selectedOrder.customer?.email || 'N/A'}</span>
                      <span style={{ fontSize: '0.82rem', color: '#999', fontWeight: 500 }}>{selectedOrder.customer?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Shipping Address</p>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.88rem', fontWeight: 500, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                      {formatAddress(selectedOrder.shippingAddress)}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Payment</p>
                    </div>
                    <p style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                      {selectedOrder.paymentMethod || 'N/A'}
                    </p>
                    {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'none' && (
                      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: selectedOrder.refundStatus === 'pending_refund' ? 'rgba(245,158,11,0.08)' : selectedOrder.refundStatus === 'refunded' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${selectedOrder.refundStatus === 'pending_refund' ? 'rgba(245,158,11,0.2)' : selectedOrder.refundStatus === 'refunded' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: selectedOrder.refundStatus === 'pending_refund' ? '#d97706' : selectedOrder.refundStatus === 'refunded' ? '#059669' : '#dc2626' }}>
                          Refund {selectedOrder.refundStatus.replace('_', ' ')}
                        </p>
                        {selectedOrder.refundReason && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#666' }}>{selectedOrder.refundReason}</p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderManagement;