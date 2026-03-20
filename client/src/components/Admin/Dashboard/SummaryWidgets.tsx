import React from 'react';

interface SummaryWidgetsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
}

const SummaryWidgets: React.FC<SummaryWidgetsProps> = ({ stats }) => {
  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const widgets = [
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), iconBg: '#e0f2fe', iconColor: '#0284c7', icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), iconBg: '#dcfce7', iconColor: '#16a34a', icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
    { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), iconBg: '#f3e8ff', iconColor: '#9333ea', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
    { title: 'Total Products', value: stats.totalProducts.toLocaleString(), iconBg: '#ffedd5', iconColor: '#ea580c', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /> },
  ];

  return (
    <div className="row g-4 mb-5">
      {widgets.map((widget, idx) => (
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
  );
};

export default SummaryWidgets;