import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, XCircle, Tag, Clock, BarChart2, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Customer, CustomerStats } from '../../../services/admin/customerService';
import { getCustomerStats } from '../../../services/admin/customerService';
import ActionConfirmModal, { type ActionConfirmType } from '../ActionConfirmModal';
import { usePermission } from '../../../hooks/usePermission';
import DeletionCountdown from '../DeletionCountdown';
import { formatPhone } from '../../../utils/formatPhone';

type CustomerStatus = 'active' | 'inactive' | 'deleted';

interface CustomerProfileProps {
  customer: Customer;
  isSaving: boolean;
  onEdit: () => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onDelete: (customerId: string) => void;
  onHardDelete: (customerId: string) => void;
  onRevokeDelete: (customerId: string) => void;
}

const getStatusStyle = (status: CustomerStatus) => {
  switch (status) {
    case 'active':   return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
    case 'inactive': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };
    case 'deleted':  return { color: '#9ca3af', bg: 'rgba(107,114,128,0.08)' };
    default:         return { color: '#999', bg: '#f0f0f2' };
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, isSaving, onEdit, onStatusChange, onDelete, onHardDelete, onRevokeDelete }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    actionType: ActionConfirmType | null;
  }>({ isOpen: false, actionType: null });
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const canEdit = usePermission('customers', 'edit');
  const canDelete = usePermission('customers', 'delete');

  useEffect(() => {
    setStatsLoading(true);
    getCustomerStats(customer._id)
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [customer._id]);

  const handleActionClick = (action: ActionConfirmType) => {
    setModalState({ isOpen: true, actionType: action });
  };

  const handleConfirmAction = () => {
    if (!modalState.actionType) return;
    if (modalState.actionType === 'delete')      { onDelete(customer._id); }
    else if (modalState.actionType === 'hard_delete') { onHardDelete(customer._id); }
    else {
      const statusMap: Record<string, CustomerStatus> = { activate: 'active', deactivate: 'inactive' };
      onStatusChange(customer._id, statusMap[modalState.actionType] as CustomerStatus);
    }
    setModalState({ isOpen: false, actionType: null });
  };

  const isDeleted = customer.status === 'deleted';
  const purgeDate = customer.deletedAt
    ? new Date(new Date(customer.deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      {/* Deletion banner */}
      {isDeleted && customer.deletedAt && (
        <div style={{
          background: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.18)',
          borderRadius: 16, padding: '14px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trash2 size={16} color="#9ca3af" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.88rem', fontWeight: 800, color: '#6b7280' }}>Account scheduled for deletion</p>
            <DeletionCountdown deletedAt={customer.deletedAt} />
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        {/* Left: Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2',
            padding: '32px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: isDeleted ? '#e5e7eb' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.4rem', color: isDeleted ? '#9ca3af' : '#64748b', margin: '0 auto 16px',
              overflow: 'hidden', filter: isDeleted ? 'grayscale(1)' : 'none',
            }}>
              {customer.profilePicture ? (
                <img src={customer.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            <h4 style={{ fontWeight: 800, color: '#1a1a1a', marginBottom: '6px' }}>{customer.name}</h4>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700,
              color: getStatusStyle(customer.status as CustomerStatus).color,
              background: getStatusStyle(customer.status as CustomerStatus).bg,
              padding: '4px 14px', borderRadius: '20px', textTransform: 'capitalize',
            }}>
              {customer.status}
            </span>

            <div style={{ marginTop: '28px', borderTop: '1px solid #f0f0f2', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              {[
                { label: 'Email', value: customer.email },
                { label: 'Phone', value: formatPhone(customer.phone) },
                { label: 'Date of Birth', value: customer.dateOfBirth ? formatDate(customer.dateOfBirth) : 'Not specified' },
                { label: 'Gender', value: customer.gender || 'Not specified' },
                { label: 'Member Since', value: formatDate(customer.createdAt) },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '0px', display: 'flex', gap: '12px' }}>
              {canEdit && customer.status !== 'deleted' && (
              <button
                  onClick={onEdit}
                  disabled={isSaving}
                  style={{
                      flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e8e8e8',
                      background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--prime-orange)'; e.currentTarget.style.color = 'var(--prime-orange)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#1a1a1a'; }}
              >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Customer
              </button>
              )}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Customer Stats Card ── */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={18} color="#6366f1" strokeWidth={2.5} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>Purchase Overview</h5>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa' }}>Lifetime activity for this customer</p>
              </div>
            </div>
            <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />

            {statsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: 52, borderRadius: 12, background: '#f5f5f7', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <>
                {/* 4 stat tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { icon: <ShoppingBag size={16} color="var(--prime-orange)" strokeWidth={2.5} />, bg: 'rgba(255,140,66,0.08)', label: 'Total Orders', value: (stats?.totalOrders ?? 0).toLocaleString(), color: 'var(--prime-orange)' },
                    { icon: <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />, bg: 'rgba(16,185,129,0.08)', label: 'Total Spent', value: `₹${(stats?.totalSpent ?? 0).toLocaleString('en-IN')}`, color: '#10b981' },
                    { icon: <BarChart2 size={16} color="#6366f1" strokeWidth={2.5} />, bg: 'rgba(99,102,241,0.08)', label: 'Avg Order Value', value: `₹${Math.round(stats?.avgOrderValue ?? 0).toLocaleString('en-IN')}`, color: '#6366f1' },
                    { icon: <XCircle size={16} color="#ef4444" strokeWidth={2.5} />, bg: 'rgba(239,68,68,0.08)', label: 'Cancelled', value: (stats?.cancelledOrders ?? 0).toLocaleString(), color: '#ef4444' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#fafafa', borderRadius: 14, border: '1px solid #f0f0f2', padding: '14px 16px' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        {stat.icon}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{stat.label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Last order + top category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats?.lastOrderId && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#f8f9ff', border: '1px solid #e8eaff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="#6366f1" strokeWidth={2.5} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#555' }}>Last Order</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1a1a1a' }}>{stats.lastOrderId}</div>
                        <div style={{ fontSize: '0.72rem', color: '#aaa' }}>
                          {stats.lastOrderDate ? formatDate(stats.lastOrderDate) : ''} · {stats.lastOrderStatus}
                        </div>
                      </div>
                    </div>
                  )}
                  {stats?.topCategory && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag size={14} color="#f59e0b" strokeWidth={2.5} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#555' }}>Favourite Category</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>{stats.topCategory}</span>
                    </div>
                  )}
                  {stats?.totalOrders === 0 && (
                    <div style={{ padding: '14px 16px', borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f2', textAlign: 'center' }}>
                      <ShoppingBag size={20} color="#ddd" strokeWidth={1.5} style={{ marginBottom: 6 }} />
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#bbb', fontWeight: 600 }}>No orders placed yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── NOT DELETED: Account Actions + Danger Zone ── */}
          {!isDeleted && (
            <>
              {customer.status !== 'deleted' && (
              <div style={{
                background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '28px',
              }}>
                <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '4px' }}>Account Actions</h5>
                <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Change the customer's account status</p>
                <div style={{ height: '1px', background: '#f0f0f2', marginBottom: '20px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customer.status !== 'active' && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Activate Account</div>
                        <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Restore full access to log in and make purchases</div>
                      </div>
                      <button
                        onClick={() => handleActionClick('activate')} disabled={isSaving}
                        style={{
                          padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(16, 185, 129, 0.3)',
                          background: 'rgba(16, 185, 129, 0.06)', color: '#10b981', fontWeight: 700,
                          fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)'; e.currentTarget.style.color = '#10b981'; }}
                      >Activate</button>
                    </div>
                  )}

                  {customer.status !== 'inactive' && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Deactivate Account</div>
                        <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Temporarily suspend login and purchase ability</div>
                      </div>
                      <button
                        onClick={() => handleActionClick('deactivate')} disabled={isSaving}
                        style={{
                          padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(245, 158, 11, 0.3)',
                          background: 'rgba(245, 158, 11, 0.06)', color: '#f59e0b', fontWeight: 700,
                          fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.06)'; e.currentTarget.style.color = '#f59e0b'; }}
                      >Deactivate</button>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Danger Zone */}
              {canDelete && (
              <div style={{
                background: 'rgba(239,68,68,0.02)', borderRadius: '20px',
                border: '1px solid rgba(239,68,68,0.12)', padding: '28px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <AlertTriangle size={17} color="#ef4444" strokeWidth={2.5} />
                  <h5 style={{ fontWeight: 800, color: '#ef4444', fontSize: '1rem', margin: 0 }}>Danger Zone</h5>
                </div>
                <p style={{ color: '#999', fontSize: '0.82rem', margin: '0 0 18px', lineHeight: 1.6 }}>
                  Permanently delete this customer account. This cannot be undone.
                </p>
                <button
                  onClick={() => handleActionClick('delete')} disabled={isSaving}
                  style={{
                    padding: '10px 22px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.4)',
                    background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                >
                  <Trash2 size={14} strokeWidth={2.5} /> Delete Customer Account
                </button>
              </div>
              )}
            </>
          )}

          {/* ── DELETED: Deletion Timeline ── */}
          {isDeleted && customer.deletedAt && (
            <div style={{ background: 'rgba(107,114,128,0.03)', borderRadius: 20, border: '1px solid rgba(107,114,128,0.15)', padding: 28 }}>
              <h5 style={{ fontWeight: 800, color: '#6b7280', fontSize: '1rem', marginBottom: 4 }}>Deletion Timeline</h5>
              <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                This account is in the 30-day retention window and will be automatically purged.
              </p>
              <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 14, border: '1px solid rgba(107,114,128,0.12)', background: '#fafafa', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Scheduled purge</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6b7280' }}>{purgeDate}</div>
                </div>
                <DeletionCountdown deletedAt={customer.deletedAt} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <button onClick={() => onRevokeDelete(customer._id)} disabled={isSaving} style={{
                  width: '100%', padding: '10px 22px', borderRadius: 10,
                  border: '1.5px solid rgba(16,185,129,0.4)',
                  background: 'transparent', color: '#10b981',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.borderColor = '#10b981'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; }}
                >
                  <RefreshCw size={14} strokeWidth={2.5} /> Restore Account
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(239,68,68,0.1)', paddingTop: 20 }}>
                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0 0 14px', lineHeight: 1.6 }}>
                  Skip the retention window and erase this account immediately.
                </p>
                <button onClick={() => handleActionClick('hard_delete')} disabled={isSaving} style={{
                  padding: '10px 22px', borderRadius: 10,
                  border: '1.5px solid rgba(239,68,68,0.4)',
                  background: 'transparent', color: '#ef4444',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                >
                  <Trash2 size={14} strokeWidth={2.5} /> Delete Permanently Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ActionConfirmModal
        isOpen={modalState.isOpen}
        actionType={modalState.actionType}
        itemName={customer.name}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalState({ isOpen: false, actionType: null })}
      />
    </>
  );
};

export default CustomerProfile;