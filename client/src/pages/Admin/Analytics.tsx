import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import { getDashboardStats, type DashboardStats } from '../../services/Admin/statsService';
import PrimeLoader from '../../components/PrimeLoader';
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

const Analytics: React.FC = () => {
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
        setToast({ type: 'error', title: 'Load Failed', message: 'Could not load analytics data.' });
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

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Computed metrics
  const avgOrderValue = stats && stats.totalOrders > 0
    ? (stats.totalRevenue / stats.totalOrders)
    : 0;

  const totalItemsSold = stats?.topProducts.reduce((sum, p) => sum + p.sold, 0) || 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {isLoading ? (
        <PrimeLoader isLoading={isLoading} />
      ) : (
        <>
          {/* Header */}
          <motion.div variants={itemVariants} className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
            <div>
              <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Analytics & Reports</h2>
              <p className="text-muted mb-0">Measure your store's performance and track growth.</p>
            </div>
          </motion.div>

          {stats ? (
            <>
              {/* 1️⃣ Top Metrics Row */}
              <motion.div variants={itemVariants} className="row g-4 mb-4">
                {[
                  { label: 'Gross Sales', value: formatCurrency(stats.totalRevenue) },
                  { label: 'Avg Order Value', value: formatCurrency(avgOrderValue) },
                  { label: 'Items Sold', value: totalItemsSold.toLocaleString() },
                  { label: 'Total Orders', value: stats.totalOrders.toLocaleString() },
                ].map((metric, i) => (
                  <div className="col-12 col-sm-6 col-xl-3" key={i}>
                    <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
                      <p className="text-muted fw-bold text-uppercase small tracking-wider mb-2">{metric.label}</p>
                      <h3 className="fw-bolder text-dark mb-0">{metric.value}</h3>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* 2️⃣ Main Charts Row */}
              <motion.div variants={itemVariants} className="row g-4 mb-4">

                {/* Sales Growth Area Chart */}
                <div className="col-12 col-xl-8">
                  <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bolder mb-1 text-dark">Sales Growth</h5>
                    <p className="text-muted small mb-4">Revenue over the last 7 days</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.revenueByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff8c42" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#ff8c42" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          axisLine={false} tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatCurrency(v)}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          axisLine={false} tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                          labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#ff8c42" strokeWidth={3} fill="url(#analyticsGradient)" dot={{ r: 4, fill: '#ff8c42', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ff5722' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders by Status Donut */}
                <div className="col-12 col-xl-4">
                  <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <h5 className="fw-bolder mb-1 text-white">Orders by Status</h5>
                    <p className="text-white-50 small mb-3">Distribution across all orders</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={stats.ordersByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {stats.ordersByStatus.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="d-flex flex-wrap justify-content-center gap-3 mt-1">
                      {stats.ordersByStatus.map((s) => (
                        <div key={s.status} className="d-flex align-items-center gap-2">
                          <span style={{ width: '8px', height: '8px', backgroundColor: STATUS_COLORS[s.status] || '#64748b', borderRadius: '50%', display: 'inline-block' }}></span>
                          <span className="text-white-50 small">{s.status} ({s.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 3️⃣ Secondary Charts & Top Products */}
              <motion.div variants={itemVariants} className="row g-4 mb-5">

                {/* Orders Per Day Bar Chart */}
                <div className="col-12 col-xl-6">
                  <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
                    <h5 className="fw-bolder mb-1 text-dark">Orders Per Day</h5>
                    <p className="text-muted small mb-4">Daily transaction volume (last 7 days)</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.ordersPerDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          formatter={(value: any) => [value, 'Orders']}
                          cursor={{ fill: 'rgba(255,140,66,0.06)' }}
                        />
                        <Bar dataKey="count" fill="#ff8c42" radius={[8, 8, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Products Table */}
                <div className="col-12 col-xl-6">
                  <div className="card border-0 shadow-sm bg-white p-0 h-100 overflow-hidden" style={{ borderRadius: '16px' }}>
                    <div className="p-4 border-bottom">
                      <h5 className="fw-bolder mb-1 text-dark">Top Performing Products</h5>
                      <p className="text-muted small mb-0">Highest revenue drivers this period</p>
                    </div>
                    <div className="table-responsive p-0 m-0">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light bg-opacity-50">
                          <tr>
                            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Product</th>
                            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-center">Sold</th>
                            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.topProducts.map((p, idx) => (
                            <tr key={idx}>
                              <td className="py-3 px-4 border-light">
                                <div className="d-flex align-items-center gap-3">
                                  <span className="fw-bolder text-muted">#{idx + 1}</span>
                                  <span className="fw-bold text-dark">{p.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 border-light text-center fw-medium text-dark">{p.sold}</td>
                              <td className="py-3 px-4 border-light text-end fw-bolder text-success">₹{p.revenue.toLocaleString()}</td>
                            </tr>
                          ))}
                          {stats.topProducts.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-4 text-muted">No sales data yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted fs-5">Failed to load analytics data. Please try refreshing the page.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Analytics;