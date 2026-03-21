import React from 'react';
import { motion } from 'framer-motion';

interface RecentTransactionsProps {
  orders: any[];
}

const getStatusStyle = (status: string) => {
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

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ orders }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', overflow: 'hidden', height: '100%' }}
    >
      <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f0f0f2' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
          Latest Activity
        </p>
        <h5 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.1rem', margin: 0, letterSpacing: '-0.3px' }}>
          Recent Orders
        </h5>
      </div>

      {/* Table Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
        padding: '12px 28px', background: '#fafafa', borderBottom: '1px solid #f0f0f2',
      }}>
        {['Order', 'When', 'Status', 'Amount'].map(h => (
          <span key={h} style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', textAlign: h === 'Amount' ? 'right' : 'left' }}>
            {h}
          </span>
        ))}
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#bbb', fontSize: '0.9rem', fontWeight: 600 }}>No orders yet — they'll show up here once customers start buying.</p>
        </div>
      ) : (
        orders.map((order: any, i: number) => {
          const st = getStatusStyle(order.status);
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '14px 28px', alignItems: 'center',
                borderBottom: i < orders.length - 1 ? '1px solid #f5f5f7' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a' }}>{order.orderId}</div>
                <div style={{ fontSize: '0.75rem', color: '#bbb', fontWeight: 500 }}>{order.customer?.name || 'Unknown'}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: 500 }}>{formatTimeAgo(order.createdAt)}</div>
              <div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, color: st.color, background: st.bg,
                  padding: '4px 10px', borderRadius: '20px',
                }}>{order.status}</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1a1a1a', textAlign: 'right' }}>
                ₹{order.totalAmount.toLocaleString()}
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
};

export default RecentTransactions;
