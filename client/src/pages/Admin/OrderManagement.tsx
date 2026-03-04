import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// --- Types ---
type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface TimelineEvent {
  status: OrderStatus;
  date: string;
  time: string;
  completed: boolean;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  total: string;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItem[];
  timeline: TimelineEvent[];
}

const OrderManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- Mock Data ---
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-9021',
      customerName: 'Emma Wilson',
      customerEmail: 'emma.wilson@example.com',
      customerPhone: '+1 (555) 123-4567',
      date: 'Oct 24, 2025',
      total: '$448.50',
      status: 'Processing',
      paymentMethod: 'Credit Card (ending in 4242)',
      shippingAddress: '4120 Front Street, Suite 201\nSan Francisco, CA 94111\nUnited States',
      items: [
        { id: '1', name: 'Neural Headphones', price: 299.00, qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
        { id: '2', name: 'Mechanical Keyboard v2', price: 149.50, qty: 1, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=100&h=100&fit=crop' }
      ],
      timeline: [
        { status: 'Pending', date: 'Oct 24, 2025', time: '09:15 AM', completed: true },
        { status: 'Paid', date: 'Oct 24, 2025', time: '09:16 AM', completed: true },
        { status: 'Processing', date: 'Oct 24, 2025', time: '11:30 AM', completed: true },
        { status: 'Shipped', date: 'Pending', time: '', completed: false },
        { status: 'Delivered', date: 'Pending', time: '', completed: false },
      ]
    },
    {
      id: 'ORD-9020',
      customerName: 'Liam Brown',
      customerEmail: 'liam.b@example.com',
      customerPhone: '+1 (555) 987-6543',
      date: 'Oct 23, 2025',
      total: '$45.00',
      status: 'Delivered',
      paymentMethod: 'PayPal',
      shippingAddress: '8812 Tech Boulevard\nAustin, TX 78701\nUnited States',
      items: [
        { id: '3', name: 'Focus Timer Z', price: 45.00, qty: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' }
      ],
      timeline: [
        { status: 'Pending', date: 'Oct 20, 2025', time: '02:00 PM', completed: true },
        { status: 'Paid', date: 'Oct 20, 2025', time: '02:05 PM', completed: true },
        { status: 'Processing', date: 'Oct 21, 2025', time: '09:00 AM', completed: true },
        { status: 'Shipped', date: 'Oct 21, 2025', time: '04:30 PM', completed: true },
        { status: 'Delivered', date: 'Oct 23, 2025', time: '11:15 AM', completed: true },
      ]
    },
    {
      id: 'ORD-9019',
      customerName: 'Olivia Jones',
      customerEmail: 'olivia.j@example.com',
      customerPhone: '+1 (555) 456-7890',
      date: 'Oct 22, 2025',
      total: '$129.99',
      status: 'Cancelled',
      paymentMethod: 'Apple Pay',
      shippingAddress: '100 Ocean Drive\nMiami, FL 33139\nUnited States',
      items: [
        { id: '4', name: 'Ergonomic Mouse', price: 129.99, qty: 1, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop' }
      ],
      timeline: [
        { status: 'Pending', date: 'Oct 22, 2025', time: '10:00 AM', completed: true },
        { status: 'Cancelled', date: 'Oct 22, 2025', time: '10:45 AM', completed: true },
      ]
    }
  ]);

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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setView('details');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
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
              <div className="d-flex gap-3">
                <button className="btn bg-white text-dark fw-bold shadow-sm px-4 py-2" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Export CSV
                </button>
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
                      <tr key={o.id}>
                        <td className="py-3 px-4 border-light fw-bold text-dark">{o.id}</td>
                        <td className="py-3 px-4 border-light">
                          <div className="d-flex align-items-center">
                            <img src={`https://ui-avatars.com/api/?name=${o.customerName.replace(' ', '+')}&background=f8fafc&color=475569`} alt={o.customerName} className="rounded-circle me-3 border" width="36" height="36" />
                            <span className="fw-bold text-dark">{o.customerName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-light fw-medium text-secondary">{o.date}</td>
                        <td className="py-3 px-4 border-light fw-medium text-secondary">
                          <span className="d-flex align-items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            {o.paymentMethod.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-light">
                          <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusBadgeClass(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-light text-end fw-bolder text-dark">{o.total}</td>
                        <td className="py-3 px-4 border-light text-end">
                          <button onClick={() => handleViewDetails(o)} className="btn btn-sm btn-light rounded-3 p-2 text-primary border-0" title="View Details">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
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
                  <button onClick={() => setView('list')} className="btn btn-light rounded-circle p-2 border-0 shadow-sm" style={{ width: '40px', height: '40px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </button>
                  <div>
                    <h3 className="fw-bolder mb-1 text-dark d-flex align-items-center gap-3" style={{ letterSpacing: '-0.5px' }}>
                      Order {selectedOrder.id}
                      <span className={`badge rounded-pill fs-6 px-3 py-1 fw-bold ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </h3>
                    <p className="text-muted mb-0">Placed on {selectedOrder.date}</p>
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
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center p-3 border rounded-3 border-light bg-light bg-opacity-50">
                          <div className="d-flex align-items-center gap-3">
                            <img src={item.image} alt={item.name} className="rounded-3 shadow-sm" width="60" height="60" style={{ objectFit: 'cover' }} />
                            <div>
                              <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                              <span className="text-muted small">Qty: {item.qty}</span>
                            </div>
                          </div>
                          <h6 className="fw-bolder text-dark mb-0">${(item.price * item.qty).toFixed(2)}</h6>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                      <span className="fw-bold text-muted">Total Amount</span>
                      <h4 className="fw-bolder text-dark mb-0">{selectedOrder.total}</h4>
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
                            className={`position-absolute top-0 start-0 translate-middle p-2 rounded-circle border border-2 border-white ${event.completed ? 'bg-primary' : 'bg-light'}`}
                            style={{ width: '16px', height: '16px', left: '-1px' }}
                          ></span>
                          <h6 className={`fw-bold mb-1 ${event.completed ? 'text-dark' : 'text-muted'}`}>{event.status}</h6>
                          <small className="text-muted">{event.date} {event.time && `• ${event.time}`}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Customer, Shipping, Actions */}
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                  
                  {/* Change Status Action Box */}
                  <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <h6 className="fw-bolder mb-3 text-white">Update Status</h6>
                    <select className="form-select form-select-lg mb-3 bg-dark border-secondary text-white shadow-none" defaultValue={selectedOrder.status}>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                    <button className="btn w-100 fw-bold py-2 border-0" style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', color: '#fff', borderRadius: '8px' }}>
                      Apply Changes
                    </button>
                  </div>

                  {/* Customer Info */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h6 className="fw-bolder mb-3 text-dark d-flex align-items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Customer Details
                    </h6>
                    <div className="d-flex align-items-center mb-3">
                      <img src={`https://ui-avatars.com/api/?name=${selectedOrder.customerName.replace(' ', '+')}&background=f8fafc&color=475569`} alt="Customer" className="rounded-circle me-3 border" width="48" height="48" />
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{selectedOrder.customerName}</h6>
                        <small className="text-primary fw-medium">View Profile</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 small">
                      <span className="text-secondary d-flex align-items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> {selectedOrder.customerEmail}</span>
                      <span className="text-secondary d-flex align-items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> {selectedOrder.customerPhone}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h6 className="fw-bolder mb-3 text-dark d-flex align-items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      Shipping Address
                    </h6>
                    <p className="text-secondary small mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                    <h6 className="fw-bolder mb-3 text-dark d-flex align-items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                      Payment Details
                    </h6>
                    <p className="text-secondary small fw-bold mb-0">
                      {selectedOrder.paymentMethod}
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