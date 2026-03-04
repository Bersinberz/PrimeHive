import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('This Month');

  // --- Mock Data for Top Products ---
  const topProducts = [
    { id: '1', name: 'Neural Headphones', category: 'Electronics', sold: 342, revenue: '$102,258' },
    { id: '2', name: 'Ergonomic Mouse', category: 'Accessories', sold: 289, revenue: '$37,567' },
    { id: '3', name: 'Mechanical Keyboard v2', category: 'Accessories', sold: 215, revenue: '$32,142' },
    { id: '4', name: 'Focus Timer Z', category: 'Office', sold: 180, revenue: '$8,100' },
  ];

  // Framer Motion Variants
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Analytics & Reports</h2>
          <p className="text-muted mb-0">Measure your store's performance and track growth.</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="dropdown">
            <select 
              className="form-select bg-white fw-bold shadow-sm border-0 py-2" 
              style={{ borderRadius: '10px', color: '#475569', cursor: 'pointer' }}
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          <button className="btn text-white fw-bold shadow-sm px-4 py-2 border-0" style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', borderRadius: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Report
          </button>
        </div>
      </motion.div>

      {/* 1️⃣ Top Metrics Row */}
      <motion.div variants={itemVariants} className="row g-4 mb-4">
        {[
          { label: 'Gross Sales', value: '$124,563.00', trend: '+14.2%', up: true },
          { label: 'Avg Order Value', value: '$84.50', trend: '+5.4%', up: true },
          { label: 'Conversion Rate', value: '3.2%', trend: '-0.4%', up: false },
          { label: 'Total Orders', value: '1,482', trend: '+12.1%', up: true },
        ].map((metric, i) => (
          <div className="col-12 col-sm-6 col-xl-3" key={i}>
            <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
              <p className="text-muted fw-bold text-uppercase small tracking-wider mb-2">{metric.label}</p>
              <h3 className="fw-bolder text-dark mb-3">{metric.value}</h3>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge rounded-pill px-2 py-1 ${metric.up ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                    {metric.up ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline> : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>}
                    {metric.up ? <polyline points="17 6 23 6 23 12"></polyline> : <polyline points="17 18 23 18 23 12"></polyline>}
                  </svg>
                  {metric.trend}
                </span>
                <span className="text-muted small">vs last period</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* 2️⃣ Main Charts Row */}
      <motion.div variants={itemVariants} className="row g-4 mb-4">
        
        {/* Sales Growth Line Chart */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bolder mb-1 text-dark">Sales Growth</h5>
            <p className="text-muted small mb-4">Revenue over time for {timeframe.toLowerCase()}</p>
            
            {/* 📈 Placeholder for Recharts <LineChart> */}
            <div className="w-100 rounded-4 bg-light position-relative overflow-hidden d-flex align-items-end px-3 pt-4 pb-2" style={{ height: '300px', border: '1px solid #e2e8f0' }}>
              {/* Decorative Mock Chart Background */}
              <div className="position-absolute bottom-0 start-0 w-100 h-100 opacity-25" style={{ background: 'linear-gradient(180deg, rgba(255,140,66,0.2) 0%, rgba(255,140,66,0) 100%)' }}></div>
              <svg viewBox="0 0 800 200" className="w-100 h-100 position-absolute bottom-0 start-0 stroke-primary" preserveAspectRatio="none">
                <path d="M0,150 C100,100 200,180 300,90 C400,0 500,120 600,50 C700,-20 800,80 800,80" fill="none" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Drop Recharts Component Here Later */}
              <div className="position-absolute top-50 start-50 translate-middle text-center bg-white p-3 rounded-3 shadow-sm border" style={{ zIndex: 10 }}>
                <span className="fw-bold text-muted small d-block mb-1">Chart Component Target</span>
                <code className="text-primary small">{'<AreaChart data={salesData} />'}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Category Donut Chart */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <h5 className="fw-bolder mb-1 text-white">Revenue by Category</h5>
            <p className="text-white-50 small mb-4">Distribution across catalog</p>
            
            {/* 🍩 Placeholder for Recharts <PieChart> */}
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center position-relative" style={{ minHeight: '300px' }}>
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '180px', height: '180px' }}>
                <svg viewBox="0 0 36 36" className="w-100 h-100 overflow-visible">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ff8c42" strokeWidth="4" strokeDasharray="60, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-60" />
                </svg>
                <div className="position-absolute text-center">
                  <span className="text-white-50 small fw-bold d-block">Top</span>
                  <span className="text-white fw-bolder fs-5">60%</span>
                </div>
              </div>
              <div className="mt-4 w-100 d-flex justify-content-center gap-4">
                <div className="d-flex align-items-center gap-2"><span style={{ width: '10px', height: '10px', backgroundColor: '#ff8c42', borderRadius: '50%' }}></span><span className="text-white-50 small">Electronics</span></div>
                <div className="d-flex align-items-center gap-2"><span style={{ width: '10px', height: '10px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></span><span className="text-white-50 small">Accessories</span></div>
              </div>
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
            <p className="text-muted small mb-4">Daily transaction volume</p>
            
            {/* 📊 Placeholder for Recharts <BarChart> */}
            <div className="w-100 rounded-4 bg-light d-flex align-items-end justify-content-between p-4" style={{ height: '250px', border: '1px solid #e2e8f0' }}>
              {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                <div key={i} className="w-100 mx-1 rounded-top" style={{ height: `${height}%`, background: i === 6 ? '#ff8c42' : '#cbd5e1', maxWidth: '40px', transition: 'all 0.3s ease' }}></div>
              ))}
            </div>
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
                  {topProducts.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 border-light">
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bolder text-muted">#{idx + 1}</span>
                          <div>
                            <span className="fw-bold text-dark d-block">{p.name}</span>
                            <span className="text-muted small">{p.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-light text-center fw-medium text-dark">{p.sold}</td>
                      <td className="py-3 px-4 border-light text-end fw-bolder text-success">{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Analytics;