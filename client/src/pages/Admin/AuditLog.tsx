import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, RefreshCw } from 'lucide-react';
import { getAuditLogs, type AuditLog } from '../../services/Admin/auditLogService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import styles from '../../components/Admin/admin.module.css';

const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  'product.create':       { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  'product.update':       { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  'product.delete':       { color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
  'order.status_update':  { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  'order.refund_decision':{ color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
};

const getActionStyle = (action: string) =>
  ACTION_COLORS[action] || { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: 50,
        action: search || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setLogs(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load audit logs' });
    } finally {
      setLoading(false);
    }
  }, [page, search, from, to]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

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
        <p className={styles.pageLabel}>Security</p>
        <h2 className={styles.pageTitle}>Audit Log</h2>
        <p className={styles.pageSubtitle}>Track all admin actions. Logs are retained for 90 days.</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Action</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              type="text"
              placeholder="e.g. product.create"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 34px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }} />
        </div>
        <button type="submit"
          style={{ padding: '10px 20px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={13} /> Filter
        </button>
        <button type="button" onClick={() => { setSearch(''); setFrom(''); setTo(''); setPage(1); }}
          style={{ padding: '10px 16px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#fff', color: '#666', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Reset
        </button>
      </form>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', overflow: 'hidden' }}>
        {logs.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <Shield size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No audit logs found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  {['Timestamp', 'Actor', 'Action', 'Target', 'IP', 'Details'].map(h => (
                    <th key={h} className="py-3 px-4 border-0"
                      style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const as = getActionStyle(log.action);
                  return (
                    <tr key={log._id}>
                      <td className="py-3 px-4 border-light" style={{ whiteSpace: 'nowrap', color: '#666', fontSize: '0.8rem' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 border-light">
                        <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.85rem' }}>{log.actorName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'capitalize' }}>{log.role}</div>
                      </td>
                      <td className="py-3 px-4 border-light">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: as.color, background: as.bg, padding: '3px 10px', borderRadius: 20 }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-light" style={{ color: '#555', fontWeight: 600 }}>
                        {log.target}
                        {log.targetId && <div style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: 'monospace' }}>{log.targetId.slice(-8)}</div>}
                      </td>
                      <td className="py-3 px-4 border-light" style={{ color: '#aaa', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                        {log.ip || '—'}
                      </td>
                      <td className="py-3 px-4 border-light" style={{ color: '#888', fontSize: '0.78rem', maxWidth: 200 }}>
                        {log.metadata ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', background: '#f5f5f7', padding: '2px 8px', borderRadius: 6 }}>
                            {JSON.stringify(log.metadata)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '8px 16px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: page === 1 ? 0.5 : 1 }}>
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            style={{ padding: '8px 16px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: page === totalPages ? 0.5 : 1 }}>
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AuditLogPage;
