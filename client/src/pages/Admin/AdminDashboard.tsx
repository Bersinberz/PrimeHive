import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats, type DashboardStats } from '../../services/Admin/statsService';
import ToastNotification from '../../components/Admin/ToastNotification';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Paid: '#64748b',
  Processing: '#0ea5e9',
  Shipped: '#3b82f6',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
  Refunded: '#a855f7',
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error: any) {
        setToast({ type: 'error', title: 'Load Failed', message: 'Could not load dashboard data.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      Delivered: 'bg-success bg-opacity-10 text-success',
      Processing: 'bg-info bg-opacity-10 text-info',
      Shipped: 'bg-primary bg-opacity-10 text-primary',
      Pending: 'bg-warning bg-opacity-10 text-warning',
      Paid: 'bg-secondary bg-opacity-10 text-secondary',
      Cancelled: 'bg-danger bg-opacity-10 text-danger',
      Refunded: 'bg-danger bg-opacity-10 text-danger',
    };
    return map[status] || 'bg-light text-dark';
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {!isLoading && (
        <>
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
            <div>
              <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Dashboard Overview</h2>
              <p className="text-muted mb-0">Here's what's happening with your store today.</p>
            </div>
          </div>

          {stats ? (
            <>
              {/* 1️⃣ WIDGETS */}
              <div className="row g-4 mb-5">
                {[
                  { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), iconBg: '#e0f2fe', iconColor: '#0284c7', icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
                  { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), iconBg: '#dcfce7', iconColor: '#16a34a', icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
                  { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), iconBg: '#f3e8ff', iconColor: '#9333ea', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
                  { title: 'Total Products', value: stats.totalProducts.toLocaleString(), iconBg: '#ffedd5', iconColor: '#ea580c', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /> },
                ].map((widget, idx) => (
                  <div className="col-12 col-sm-6 col-xl-3" key={idx}>
                    <div className="card border-0 shadow-sm bg-white h-100 p-4" style={{ borderRadius: '16px' }}>
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div className="p-3 rounded-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: widget.iconBg, color: widget.iconColor }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {widget.icon}
                          </svg>
                        </div>
                      </div>
                      <h6 className="text-muted fw-bold mb-1">{widget.title}</h6>
                      <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-1px' }}>{widget.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2️⃣ CHARTS */}
              <div className="row g-4 mb-5">
                {/* Revenue Area Chart */}
                <div className="col-12 col-lg-8">
                  <div className="card border-0 shadow-sm bg-white h-100 p-4" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bolder mb-4 text-dark">Revenue Analytics</h5>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={stats.revenueByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff8c42" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ff8c42" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                          labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#ff8c42" strokeWidth={3} fill="url(#revenueGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders by Status Donut Chart */}
                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm h-100 p-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <h5 className="fw-bolder mb-3 text-white">Orders by Status</h5>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={stats.ordersByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {stats.ordersByStatus.map((entry: any, i: number) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                      {stats.ordersByStatus.map((s) => (
                        <div key={s.status} className="d-flex align-items-center gap-2">
                          <span style={{ width: '8px', height: '8px', backgroundColor: STATUS_COLORS[s.status] || '#64748b', borderRadius: '50%', display: 'inline-block' }}></span>
                          <span className="text-white-50 small">{s.status} ({s.count})</span>
                        </div>
                      ))}
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
                          {stats.recentOrders.map((order: any) => (
                            <tr key={order._id}>
                              <td className="py-3 border-light">
                                <div className="d-flex align-items-center">
                                  <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3 text-muted" style={{ width: '40px', height: '40px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                  </div>
                                  <div>
                                    <h6 className="mb-0 fw-bold text-dark">{order.orderId}</h6>
                                    <small className="text-muted">{order.customer?.name || 'Unknown'}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 border-light text-muted small fw-medium">{formatTimeAgo(order.createdAt)}</td>
                              <td className="py-3 border-light">
                                <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 border-light text-end fw-bolder text-dark fs-6">₹{order.totalAmount.toLocaleString()}</td>
                            </tr>
                          ))}
                          {stats.recentOrders.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-4 text-muted">No orders yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                  <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bolder mb-0 text-danger d-flex align-items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Low Inventory
                      </h5>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      {stats.lowStockProducts.length > 0 ? stats.lowStockProducts.map((item, i) => (
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
                      )) : (
                        <div className="text-center py-3 text-muted small">All products are well stocked! 🎉</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted fs-5">Failed to load dashboard data. Please try refreshing the page.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AdminDashboard;