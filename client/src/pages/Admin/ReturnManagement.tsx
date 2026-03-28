import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, X, CheckCircle2 } from 'lucide-react';
import { getAdminReturns, processReturn, type AdminReturn } from '../../services/Admin/returnService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import styles from '../../components/Admin/admin.module.css';

const TABS = ['all', 'requested', 'approved', 'rejected', 'completed'] as const;
type Tab = typeof TABS[number];

const statusStyle: Record<string, { color: string; bg: string }> = {
  requested:  { color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  approved:   { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  rejected:   { color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
  completed:  { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
};

const ReturnManagement: React.FC = () => {
  const [tab, setTab] = useState<Tab>('requested');
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminReturns({ status: tab === 'all' ? undefined : tab, limit: 100 });
      setReturns(res.data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load returns' });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handle = async (id: string, status: 'approved' | 'rejected' | 'completed') => {
    setProcessing(id);
    try {
      const updated = await processReturn(id, status, noteMap[id]);
      setReturns(prev => prev.map(r => r._id === id ? updated : r));
      showToast({ type: 'success', title: 'Updated', message: `Return ${status}` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to process return' });
    } finally {
      setProcessing(null);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      <PrimeLoader isLoading={loading} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className={styles.pageLabel}>Management</p>
        <h2 className={styles.pageTitle}>Returns</h2>
        <p className={styles.pageSubtitle}>Review and process customer return requests.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 50, border: 'none', fontWeight: 700,
              fontSize: '0.82rem', cursor: 'pointer', textTransform: 'capitalize',
              background: tab === t ? 'var(--prime-gradient)' : '#f5f5f5',
              color: tab === t ? '#fff' : '#555',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Returns list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {returns.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <RotateCcw size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No {tab === 'all' ? '' : tab} return requests</p>
          </div>
        )}

        {returns.map(ret => {
          const st = statusStyle[ret.status];
          return (
            <div key={ret._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: '#1a1a1a' }}>
                      {(ret.order as any)?.orderId || 'N/A'}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: st.color, background: st.bg, padding: '2px 10px', borderRadius: 20, textTransform: 'capitalize' }}>
                      {ret.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>
                    {ret.customer?.name} · {ret.customer?.email}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#aaa' }}>
                    {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Order Value</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#1a1a1a' }}>
                    {fmt((ret.order as any)?.totalAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div style={{ background: '#fafafa', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Return Items</p>
                {ret.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#555', padding: '4px 0' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 700 }}>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div style={{ background: '#fff8f0', border: '1px solid #ffe4cc', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 800, color: '#c05621', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Reason</p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#555', lineHeight: 1.6 }}>{ret.reason}</p>
              </div>

              {ret.adminNote && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Admin Note</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>{ret.adminNote}</p>
                </div>
              )}

              {/* Actions */}
              {ret.status === 'requested' && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input
                      type="text"
                      placeholder="Optional note to customer..."
                      value={noteMap[ret._id] || ''}
                      onChange={e => setNoteMap(prev => ({ ...prev, [ret._id]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <button
                    disabled={processing === ret._id}
                    onClick={() => handle(ret._id, 'approved')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 50, border: 'none', background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <Check size={14} /> Approve
                  </button>
                  <button
                    disabled={processing === ret._id}
                    onClick={() => handle(ret._id, 'rejected')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 50, border: 'none', background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              )}

              {ret.status === 'approved' && (
                <button
                  disabled={processing === ret._id}
                  onClick={() => handle(ret._id, 'completed')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 50, border: 'none', background: 'rgba(16,185,129,0.1)', color: '#059669', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  <CheckCircle2 size={14} /> Mark Completed
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ReturnManagement;
