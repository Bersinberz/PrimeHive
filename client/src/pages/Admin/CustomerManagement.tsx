import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  getCustomers,
  updateCustomerStatus,
  deleteCustomer,
  type Customer,
} from '../../services/Admin/customerService';
import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';

type CustomerStatus = 'active' | 'inactive' | 'banned';

const CustomerManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      setToast({ type: 'error', title: 'Load Failed', message: 'Could not load customers.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (customerId: string, status: CustomerStatus) => {
    setIsSaving(true);
    try {
      const updated = await updateCustomerStatus(customerId, status);
      setCustomers(prev => prev.map(c => c._id === customerId ? updated : c));
      if (selectedCustomer?._id === customerId) {
        setSelectedCustomer(updated);
      }
      const label = status === 'active' ? 'Activated' : status === 'inactive' ? 'Deactivated' : 'Banned';
      setToast({ type: 'success', title: label, message: `Customer status updated to ${status}.` });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not update status.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer?')) return;
    setIsSaving(true);
    try {
      await deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c._id !== customerId));
      if (selectedCustomer?._id === customerId) {
        setView('list');
        setSelectedCustomer(null);
      }
      setToast({ type: 'success', title: 'Deleted', message: 'Customer removed permanently.' });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not delete customer.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setView('profile');
  };

  // Status badge colors
  const getStatusStyle = (status: CustomerStatus) => {
    switch (status) {
      case 'active': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
      case 'inactive': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };
      case 'banned': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '1400px', minHeight: '80vh', margin: '0 auto', position: 'relative', paddingBottom: '40px' }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">

            {/* Command Bar Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="command-bar"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                    Customers
                  </h2>
                  <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0' }}>
                    Manage your store's customer base and account statuses
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                  <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                    <span className="stat-dot" style={{ background: '#6366f1' }} />
                    <span className="stat-count">{customers.length}</span>
                    Total
                  </motion.div>
                  <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                    <span className="stat-dot" style={{ background: '#10b981' }} />
                    <span className="stat-count">{customers.filter(c => c.status === 'active').length}</span>
                    Active
                  </motion.div>
                  <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                    <span className="stat-dot" style={{ background: '#f59e0b' }} />
                    <span className="stat-count">{customers.filter(c => c.status === 'inactive').length}</span>
                    Inactive
                  </motion.div>
                  <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                    <span className="stat-dot" style={{ background: '#ef4444' }} />
                    <span className="stat-count">{customers.filter(c => c.status === 'banned').length}</span>
                    Banned
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Customer List */}
            {customers.length === 0 && !isLoading ? (
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
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                border: '1px solid #f0f0f2',
                overflow: 'hidden',
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 100px',
                  padding: '14px 24px',
                  borderBottom: '1px solid #f0f0f2',
                  background: '#fafafa',
                }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Joined</span>
                </div>

                {/* Rows */}
                {filtered.map((c, i) => {
                  const statusStyle = getStatusStyle(c.status as CustomerStatus);
                  return (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      onClick={() => handleViewProfile(c)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 100px',
                        padding: '16px 24px',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f7' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Name + Email */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: '#64748b',
                          flexShrink: 0,
                        }}>
                          {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
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
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: statusStyle.color,
                          background: statusStyle.bg,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          textTransform: 'capitalize',
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

                {filtered.length === 0 && customers.length > 0 && (
                  <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                      No customers match "<strong>{searchQuery}</strong>"
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

        ) : (
          /* ── CUSTOMER PROFILE VIEW ── */
          selectedCustomer && (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {/* Back Button + Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: '24px' }}
              >
                <button className="back-nav-btn" onClick={() => setView('list')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Customers
                </button>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', marginTop: '16px', marginBottom: '4px' }}>
                  Customer Profile
                </h2>
                <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                  View details and manage account status
                </p>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
                {/* Left: Identity Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    border: '1px solid #f0f0f2',
                    padding: '32px 24px',
                    textAlign: 'center',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.4rem',
                      color: '#64748b',
                      margin: '0 auto 16px',
                    }}>
                      {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>

                    <h4 style={{ fontWeight: 800, color: '#1a1a1a', marginBottom: '6px' }}>{selectedCustomer.name}</h4>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: getStatusStyle(selectedCustomer.status).color,
                      background: getStatusStyle(selectedCustomer.status).bg,
                      padding: '4px 14px',
                      borderRadius: '20px',
                      textTransform: 'capitalize',
                    }}>
                      {selectedCustomer.status}
                    </span>

                    {/* Details */}
                    <div style={{ marginTop: '28px', borderTop: '1px solid #f0f0f2', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                      {[
                        { label: 'Email', value: selectedCustomer.email },
                        { label: 'Phone', value: selectedCustomer.phone },
                        { label: 'Member Since', value: formatDate(selectedCustomer.createdAt) },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Quick Actions */}
                  <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    border: '1px solid #f0f0f2',
                    padding: '28px',
                  }}>
                    <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '4px' }}>Account Actions</h5>
                    <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Change the customer's account status</p>
                    <div style={{ height: '1px', background: '#f0f0f2', marginBottom: '20px' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Activate */}
                      {selectedCustomer.status !== 'active' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: '1px solid #f0f0f2',
                          background: '#fafafa',
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Activate Account</div>
                            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Restore full access to log in and make purchases</div>
                          </div>
                          <button
                            onClick={() => handleStatusChange(selectedCustomer._id, 'active')}
                            disabled={isSaving}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '10px',
                              border: '1.5px solid rgba(16, 185, 129, 0.3)',
                              background: 'rgba(16, 185, 129, 0.06)',
                              color: '#10b981',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)'; e.currentTarget.style.color = '#10b981'; }}
                          >
                            Activate
                          </button>
                        </div>
                      )}

                      {/* Deactivate */}
                      {selectedCustomer.status !== 'inactive' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: '1px solid #f0f0f2',
                          background: '#fafafa',
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Deactivate Account</div>
                            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Temporarily suspend login and purchase ability</div>
                          </div>
                          <button
                            onClick={() => handleStatusChange(selectedCustomer._id, 'inactive')}
                            disabled={isSaving}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '10px',
                              border: '1.5px solid rgba(245, 158, 11, 0.3)',
                              background: 'rgba(245, 158, 11, 0.06)',
                              color: '#f59e0b',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.06)'; e.currentTarget.style.color = '#f59e0b'; }}
                          >
                            Deactivate
                          </button>
                        </div>
                      )}

                      {/* Ban */}
                      {selectedCustomer.status !== 'banned' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: '1px solid #f0f0f2',
                          background: '#fafafa',
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Ban Customer</div>
                            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Permanently revoke access and blacklist this account</div>
                          </div>
                          <button
                            onClick={() => handleStatusChange(selectedCustomer._id, 'banned')}
                            disabled={isSaving}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '10px',
                              border: '1.5px solid rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.05)',
                              color: '#ef4444',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#ef4444'; }}
                          >
                            Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(239, 68, 68, 0.12)',
                    padding: '28px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <h5 style={{ fontWeight: 800, color: '#ef4444', fontSize: '1rem', margin: 0 }}>Danger Zone</h5>
                    </div>
                    <p style={{ color: '#999', fontSize: '0.82rem', marginBottom: '16px' }}>
                      This action is permanent and cannot be undone. All customer data will be erased.
                    </p>
                    <button
                      onClick={() => handleDelete(selectedCustomer._id)}
                      disabled={isSaving}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: '1.5px solid #ef4444',
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete Customer Permanently
                    </button>
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

export default CustomerManagement;