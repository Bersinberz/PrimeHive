import React from 'react';
import { motion } from 'framer-motion';

interface LowStockAlertsProps {
  products: any[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
      style={{
        background: '#fff', borderRadius: '20px',
        border: '1px solid rgba(239,68,68,0.15)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(239,68,68,0.1)', background: 'rgba(239,68,68,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Needs Attention
            </p>
            <h5 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1rem', margin: 0, letterSpacing: '-0.3px' }}>
              Low Stock
            </h5>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {products.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#10b981', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>
              All products are well stocked — nothing to worry about!
            </p>
          </div>
        ) : (
          products.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: '14px',
                background: item.status === 'Critical' ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
                border: `1px solid ${item.status === 'Critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.88rem' }}>{item.product}</div>
                <div style={{ fontSize: '0.72rem', color: '#bbb', fontWeight: 600, marginTop: '2px' }}>{item.sku}</div>
              </div>
              <span style={{
                fontSize: '0.72rem', fontWeight: 800,
                color: item.status === 'Critical' ? '#ef4444' : '#f59e0b',
                background: item.status === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                padding: '4px 12px', borderRadius: '20px',
              }}>
                {item.stock} left
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default LowStockAlerts;
