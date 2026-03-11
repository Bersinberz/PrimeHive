import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from '../../services/Admin/orderService';
import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';

const OrderManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch orders on mount
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error: any) {
      setToast({ type: 'error', title: 'Load Failed', message: error?.message || 'Could not load orders.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = async (order: Order) => {
    setIsLoading(true);
    try {
      const fullOrder = await getOrderById(order._id);
      setSelectedOrder(fullOrder);
      setNewStatus(fullOrder.status);
      setView('details');
    } catch (error: any) {
      setToast({ type: 'error', title: 'Load Failed', message: 'Could not load order details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus || newStatus === selectedOrder.status) return;

    setIsSaving(true);
    try {
      const updatedOrder = await updateOrderStatus(selectedOrder._id, newStatus as OrderStatus);
      setSelectedOrder(updatedOrder);
      setNewStatus(updatedOrder.status);
      setToast({ type: 'success', title: 'Status Updated', message: `Order moved to "${updatedOrder.status}".` });
      // Also refresh the list data
      fetchOrders();
    } catch (error: any) {
      setToast({ type: 'error', title: 'Update Failed', message: error?.message || 'Could not update status.' });
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
    switch (status) {
      case 'Delivered': return 'bg-success bg-opacity-10 text-success';
      case 'Processing': return 'bg-info bg-opacity-10 text-info';
      case 'Shipped': return 'bg-primary bg-opacity-10 text-primary';
      case 'Pending': return 'bg-warning bg-opacity-10 text-warning';
      case 'Paid': return 'bg-secondary bg-opacity-10 text-secondary';
      case 'Cancelled':
      case 'Refunded': return 'bg-danger bg-opacity-10 text-danger';
      default: return 'bg-light text-dark';
    }
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
      style={{ maxWidth: '1400px' }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          /* =========================================
             VIEW 1: ORDERS LIST
             ========================================= */
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Orders Management</h2>
                <p className="text-muted mb-0">Track, fulfill, and manage customer orders.</p>
              </div>
            </div>

            {/* Table Card */}
            <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '16px' }}>
              <div className="table-responsive p-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light bg-opacity-50">
                    <tr>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Order ID</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Customer</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Date</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Payment</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Status</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Total</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td className="py-3 px-4 border-light fw-bold text-dark">{o.orderId}</td>
                        <td className="py-3 px-4 border-light">
                          <div className="d-flex align-items-center">
                            <img src={`https://ui-avatars.com/api/?name=${(o.customer?.name || 'U').replace(' ', '+')}&background=f8fafc&color=475569`} alt={o.customer?.name} className="rounded-circle me-3 border" width="36" height="36" />
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
                          <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusBadgeClass(o.status)}`}>
                            {o.status}
                          </span>
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
                        <td colSpan={7} className="text-center py-5 text-muted">
                          No orders found.
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
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div className="d-flex align-items-center gap-3">
                  <button onClick={() => { setView('list'); setSelectedOrder(null); }} className="btn btn-light rounded-circle p-2 border-0 shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </button>
                  <div>
                    <h3 className="fw-bolder mb-1 text-dark d-flex align-items-center gap-3" style={{ letterSpacing: '-0.5px' }}>
                      Order {selectedOrder.orderId}
                      <span className={`badge rounded-pill fs-6 px-3 py-1 fw-bold ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </h3>
                    <p className="text-muted mb-0">Placed on {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {/* LEFT COLUMN: Items & Timeline */}
                <div className="col-12 col-xl-8 d-flex flex-column gap-4">

                  {/* Ordered Items */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Items Ordered</h5>
                    <div className="d-flex flex-column gap-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center p-3 border rounded-3 border-light bg-light bg-opacity-50">
                          <div className="d-flex align-items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="rounded-3 shadow-sm" width="60" height="60" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div className="rounded-3 bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
                                <span className="text-muted small">No Img</span>
                              </div>
                            )}
                            <div>
                              <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                              <span className="text-muted small">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <h6 className="fw-bolder text-dark mb-0">₹{(item.price * item.quantity).toFixed(2)}</h6>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                      <span className="fw-bold text-muted">Total Amount</span>
                      <h4 className="fw-bolder text-dark mb-0">₹{selectedOrder.totalAmount.toFixed(2)}</h4>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3 d-flex align-items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Order Timeline
                    </h5>
                    <div className="position-relative ms-3 border-start border-2 border-light pb-2">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={idx} className="position-relative mb-4 ps-4">
                          <span
                            className="position-absolute top-0 start-0 translate-middle p-2 rounded-circle border border-2 border-white bg-primary"
                            style={{ width: '16px', height: '16px', left: '-1px' }}
                          ></span>
                          <h6 className="fw-bold mb-1 text-dark">{event.status}</h6>
                          <small className="text-muted">
                            {formatDate(event.timestamp)} • {formatTime(event.timestamp)}
                          </small>
                          {event.note && <p className="text-muted small mb-0 mt-1 fst-italic">"{event.note}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Customer, Shipping, Status */}
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">

                  {/* Change Status Action Box */}
                  <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <h6 className="fw-bolder mb-3 text-white">Update Status</h6>
                    <select
                      className="form-select form-select-lg mb-3 bg-dark border-secondary text-white shadow-none"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      disabled={isSaving || ['Cancelled', 'Refunded', 'Delivered'].includes(selectedOrder.status)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                    <button
                      className="btn w-100 fw-bold py-2 border-0"
                      style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', color: '#fff', borderRadius: '8px' }}
                      onClick={handleStatusUpdate}
                      disabled={isSaving || newStatus === selectedOrder.status || ['Cancelled', 'Refunded', 'Delivered'].includes(selectedOrder.status)}
                    >
                      {isSaving ? 'Updating...' : 'Apply Changes'}
                    </button>
                    {['Cancelled', 'Refunded', 'Delivered'].includes(selectedOrder.status) && (
                      <small className="text-warning mt-2 d-block">This order is finalized and cannot be changed.</small>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h6 className="fw-bolder mb-3 text-dark d-flex align-items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Customer Details
                    </h6>
                    <div className="d-flex align-items-center mb-3">
                      <img src={`https://ui-avatars.com/api/?name=${(selectedOrder.customer?.name || 'U').replace(' ', '+')}&background=f8fafc&color=475569`} alt="Customer" className="rounded-circle me-3 border" width="48" height="48" />
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{selectedOrder.customer?.name || 'Unknown'}</h6>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 small">
                      <span className="text-secondary d-flex align-items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        {selectedOrder.customer?.email || 'N/A'}
                      </span>
                      <span className="text-secondary d-flex align-items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        {selectedOrder.customer?.phone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h6 className="fw-bolder mb-3 text-dark d-flex align-items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      Shipping Address
                    </h6>
                    <p className="text-secondary small mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                      {formatAddress(selectedOrder.shippingAddress)}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h6 className="fw-bolder mb-3 text-dark d-flex align-items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                      Payment Details
                    </h6>
                    <p className="text-secondary small fw-bold mb-0">
                      {selectedOrder.paymentMethod || 'N/A'}
                    </p>
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