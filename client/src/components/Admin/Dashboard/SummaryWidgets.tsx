import React from 'react';
import { motion } from 'framer-motion';

interface SummaryWidgetsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  isStaff?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' }
  }),
};

const SummaryWidgets: React.FC<SummaryWidgetsProps> = ({ stats, isStaff = false }) => {
  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const widgets = [
    {
      title: isStaff ? 'My Revenue' : 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      iconBg: '#e0f2fe', iconColor: '#0284c7',
      icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
    },
    {
      title: isStaff ? 'Orders (My Products)' : 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      iconBg: '#dcfce7', iconColor: '#16a34a',
      icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
    },
    // Staff: show "My Products" instead of "Total Customers"
    isStaff
      ? {
          title: 'My Products',
          value: stats.totalProducts.toLocaleString(),
          iconBg: '#ffedd5', iconColor: '#ea580c',
          icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />,
        }
      : {
          title: 'Total Customers',
          value: stats.totalCustomers.toLocaleString(),
          iconBg: '#f3e8ff', iconColor: '#9333ea',
          icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
        },
    // Superadmin: 4th widget is total products; staff already showed it above, so show low stock count
    isStaff
      ? {
          title: 'Low Stock Items',
          value: '—',
          iconBg: '#fee2e2', iconColor: '#ef4444',
          icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
        }
      : {
          title: 'Total Products',
          value: stats.totalProducts.toLocaleString(),
          iconBg: '#ffedd5', iconColor: '#ea580c',
          icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />,
        },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
      {widgets.map((widget, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          style={{
            background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
          }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: widget.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={widget.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {widget.icon}
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>
              {widget.title}
            </p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', margin: 0 }}>
              {widget.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryWidgets;
