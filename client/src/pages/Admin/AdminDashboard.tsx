import React from 'react';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  // Mock Data
  const recentOrders = [
    { id: '#ORD-092', customer: 'Alice Smith', total: '$120.00', status: 'Processing', date: '2 mins ago' },
    { id: '#ORD-091', customer: 'Bob Johnson', total: '$45.50', status: 'Shipped', date: '1 hour ago' },
    { id: '#ORD-090', customer: 'Charlie Davis', total: '$210.00', status: 'Delivered', date: 'Yesterday' },
    { id: '#ORD-089', customer: 'David Wilson', total: '$89.99', status: 'Processing', date: 'Yesterday' },
    { id: '#ORD-088', customer: 'Sarah Connor', total: '$340.00', status: 'Delivered', date: 'Oct 12' },
  ];

  const recentCustomers = [
    { name: 'Emma Wilson', email: 'emma@example.com', orders: 12, spent: '$1,240' },
    { name: 'Liam Brown', email: 'liam@example.com', orders: 8, spent: '$850' },
    { name: 'Olivia Jones', email: 'olivia@example.com', orders: 3, spent: '$210' },
    { name: 'Noah Miller', email: 'noah@example.com', orders: 1, spent: '$45' },
  ];

  const lowStock = [
    { product: 'Wireless Earbuds Pro', sku: 'WE-PRO-01', stock: 4, status: 'Critical' },
    { product: 'Mechanical Keyboard v2', sku: 'MK-V2-09', stock: 12, status: 'Low' },
    { product: 'Ergonomic Mouse', sku: 'EM-004', stock: 8, status: 'Low' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Dashboard Overview</h2>
          <p className="text-muted mb-0">Here's what's happening with your store today.</p>
        </div>
        <div className="d-flex gap-3">
          <button className="btn bg-white text-dark fw-bold shadow-sm px-4 py-2" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-muted"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Oct 1 - Oct 31
          </button>
          <button className="btn text-white fw-bold shadow-sm px-4 py-2 border-0" style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', borderRadius: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </button>
        </div>
      </div>

      {/* 1️⃣ WIDGETS */}
      <div className="row g-4 mb-5">
        {[
          { title: 'Total Revenue', value: '$45,231.89', change: '+12.5%', isUp: true, iconBg: '#e0f2fe', iconColor: '#0284c7', icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
          { title: 'Total Orders', value: '1,204', change: '+8.2%', isUp: true, iconBg: '#dcfce7', iconColor: '#16a34a', icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
          { title: 'Total Customers', value: '8,430', change: '+2.1%', isUp: true, iconBg: '#f3e8ff', iconColor: '#9333ea', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
          { title: 'Total Products', value: '142', change: '-1.4%', isUp: false, iconBg: '#ffedd5', iconColor: '#ea580c', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /> },
        ].map((widget, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className="card border-0 shadow-sm bg-white h-100 p-4" style={{ borderRadius: '16px' }}>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="p-3 rounded-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: widget.iconBg, color: widget.iconColor }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {widget.icon}
                  </svg>
                </div>
                <span className={`badge rounded-pill bg-opacity-10 fw-bold px-3 py-2 ${widget.isUp ? 'text-success bg-success' : 'text-danger bg-danger'}`}>
                  {widget.isUp ? '↑' : '↓'} {widget.change}
                </span>
              </div>
              <h6 className="text-muted fw-bold mb-1">{widget.title}</h6>
              <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-1px' }}>{widget.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2️⃣ CHARTS */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm bg-white h-100 p-4" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bolder mb-0 text-dark">Revenue Analytics</h5>
              <select className="form-select form-select-sm w-auto shadow-none border-light fw-medium text-muted rounded-3 bg-light">
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="rounded-4 d-flex align-items-center justify-content-center w-100 bg-light" style={{ height: '320px', border: '1px dashed #cbd5e1' }}>
              <span className="text-muted fw-medium d-flex flex-column align-items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                Chart Area (Recharts / Chart.js)
              </span>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 p-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <h5 className="fw-bolder mb-4 text-white">Sales by Category</h5>
            <div className="rounded-4 d-flex align-items-center justify-content-center w-100 h-100" style={{ minHeight: '250px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <span className="text-white-50 fw-medium d-flex flex-column align-items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                Donut Chart
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ ACTIVITY SECTION */}
      <div className="row g-4 pb-5">
        
        {/* Recent Orders */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm bg-white h-100 p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
            <div className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bolder mb-0 text-dark">Recent Transactions</h5>
              <a href="#" className="btn btn-sm btn-light fw-bold text-dark rounded-3 px-3">View All</a>
            </div>
            <div className="table-responsive px-4 pb-4">
              <table className="table table-hover align-middle mb-0">
                <thead className="small text-uppercase text-muted fw-bold">
                  <tr>
                    <th className="py-3 border-bottom-0 text-secondary">Order Details</th>
                    <th className="py-3 border-bottom-0 text-secondary">Date</th>
                    <th className="py-3 border-bottom-0 text-secondary">Status</th>
                    <th className="py-3 border-bottom-0 text-secondary text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td className="py-3 border-light">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3 text-muted" style={{ width: '40px', height: '40px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold text-dark">{order.id}</h6>
                            <small className="text-muted">{order.customer}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 border-light text-muted small fw-medium">{order.date}</td>
                      <td className="py-3 border-light">
                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${order.status === 'Delivered' ? 'bg-success bg-opacity-10 text-success' : order.status === 'Processing' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-info bg-opacity-10 text-info'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 border-light text-end fw-bolder text-dark fs-6">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vertical Stack: Top Customers & Low Stock */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
          
          {/* Top Customers */}
          <div className="card border-0 shadow-sm bg-white flex-grow-1 p-4" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bolder mb-0 text-dark">Top Customers</h5>
            </div>
            <div className="d-flex flex-column gap-4">
              {recentCustomers.slice(0, 3).map((cust, i) => (
                <div key={i} className="d-flex align-items-center">
                  <img src={`https://ui-avatars.com/api/?name=${cust.name.replace(' ', '+')}&background=f8fafc&color=475569`} alt={cust.name} className="rounded-circle me-3 border" width="48" height="48" />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold text-dark">{cust.name}</h6>
                    <small className="text-muted">{cust.orders} Orders</small>
                  </div>
                  <div className="text-end">
                    <h6 className="mb-0 fw-bolder text-dark">{cust.spent}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bolder mb-0 text-danger d-flex align-items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Low Inventory
              </h5>
            </div>
            <div className="d-flex flex-column gap-3">
              {lowStock.map((item, i) => (
                <div key={i} className="p-3 bg-white rounded-4 shadow-sm border-0 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{item.product}</h6>
                    <small className="text-muted d-block">{item.sku}</small>
                  </div>
                  <div className="text-end">
                    <span className={`badge rounded-pill ${item.status === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'} mb-1`}>
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;