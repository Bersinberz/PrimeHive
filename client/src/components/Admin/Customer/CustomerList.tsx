import React from 'react';
import { motion } from 'framer-motion';
import type { Customer } from '../../../services/admin/customerService';


type CustomerStatus = 'active' | 'inactive';

interface CustomerListProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  searchQuery: string;
  isLoading: boolean;
  onViewProfile: (customer: Customer) => void;
}

const getStatusStyle = (status: CustomerStatus) => {
  switch (status) {
    case 'active': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
    case 'inactive': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };

    default: return { color: '#999', bg: '#f0f0f2' };
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const CustomerList: React.FC<CustomerListProps> = ({ customers, filteredCustomers, searchQuery, isLoading, onViewProfile }) => {
  if (customers.length === 0 && !isLoading) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '8px' }}>
          No customers yet
        </h3>
        <p style={{ color: '#999', fontSize: '0.95rem', maxWidth: '360px', lineHeight: 1.6 }}>
          Customers will appear here once they register on your store.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      border: '1px solid #f0f0f2',
      overflow: 'hidden',
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px',
        padding: '14px 24px', borderBottom: '1px solid #f0f0f2', background: '#fafafa',
      }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Joined</span>
      </div>

      {/* Rows */}
      {filteredCustomers.map((c, i) => {
        const statusStyle = getStatusStyle(c.status as CustomerStatus);
        return (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            onClick={() => onViewProfile(c)}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px',
              padding: '16px 24px', alignItems: 'center', cursor: 'pointer',
              borderBottom: i < filteredCustomers.length - 1 ? '1px solid #f5f5f7' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Name + Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {c.profilePicture ? (
                  <img src={c.profilePicture} alt={c.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #f0f0f2' }} />
              ) : (
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.8rem', color: '#64748b', flexShrink: 0,
                  }}>
                    {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
              </div>
            </div>

            {/* Phone */}
            <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>{c.phone}</div>

            {/* Status */}
            <div>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: statusStyle.color, background: statusStyle.bg,
                padding: '4px 12px', borderRadius: '20px', textTransform: 'capitalize',
              }}>
                {c.status}
              </span>
            </div>

            {/* Joined */}
            <div style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 500, textAlign: 'right' }}>
              {formatDate(c.createdAt)}
            </div>
          </motion.div>
        );
      })}

      {filteredCustomers.length === 0 && customers.length > 0 && (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
            No customers match "<strong>{searchQuery}</strong>"
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerList;