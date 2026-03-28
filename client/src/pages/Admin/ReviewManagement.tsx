import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Check, X, Trash2, RefreshCw } from 'lucide-react';
import { getAdminReviews, moderateReview, deleteAdminReview, type AdminReview } from '../../services/Admin/reviewService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import ActionConfirmModal from '../../components/Admin/ActionConfirmModal';
import styles from '../../components/Admin/admin.module.css';

const TABS = ['all', 'pending', 'approved', 'rejected'] as const;
type Tab = typeof TABS[number];

const statusStyle: Record<string, { color: string; bg: string }> = {
  pending:  { color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  approved: { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  rejected: { color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={13} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
    ))}
  </div>
);

const ReviewManagement: React.FC = () => {
  const [tab, setTab] = useState<Tab>('pending');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminReview | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminReviews({ status: tab === 'all' ? undefined : tab, limit: 100 });
      setReviews(res.data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load reviews' });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    setSaving(id);
    try {
      const updated = await moderateReview(id, status);
      setReviews(prev => prev.map(r => r._id === id ? updated : r));
      showToast({ type: 'success', title: 'Updated', message: `Review ${status}` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update review' });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setSaving(toDelete._id);
    try {
      await deleteAdminReview(toDelete._id);
      setReviews(prev => prev.filter(r => r._id !== toDelete._id));
      showToast({ type: 'success', title: 'Deleted', message: 'Review removed' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete review' });
    } finally {
      setSaving(null);
      setToDelete(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      <PrimeLoader isLoading={loading} />
      <ActionConfirmModal
        isOpen={!!toDelete}
        actionType="delete_product"
        itemName={toDelete?.title ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className={styles.pageLabel}>Moderation</p>
        <h2 className={styles.pageTitle}>Reviews</h2>
        <p className={styles.pageSubtitle}>Approve or reject customer reviews before they appear publicly.</p>
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
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e5e7eb', borderRadius: 50, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <Star size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No {tab === 'all' ? '' : tab} reviews</p>
          </div>
        )}

        {reviews.map(review => {
          const st = statusStyle[review.status];
          return (
            <div key={review._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <StarRating rating={review.rating} />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>{review.title}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: st.color, background: st.bg, padding: '2px 10px', borderRadius: 20, textTransform: 'capitalize' }}>
                      {review.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#555', lineHeight: 1.6 }}>{review.body}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 600 }}>By: {review.userName}</span>
                    {review.product && (
                      <span style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 600 }}>
                        Product: {(review.product as any).name}
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 600 }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {review.status !== 'approved' && (
                    <button
                      disabled={saving === review._id}
                      onClick={() => handleModerate(review._id, 'approved')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 50, border: 'none', background: 'rgba(16,185,129,0.1)', color: '#059669', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <Check size={13} /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      disabled={saving === review._id}
                      onClick={() => handleModerate(review._id, 'rejected')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 50, border: 'none', background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      <X size={13} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => setToDelete(review)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 50, border: '1px solid #f0f0f2', background: '#fff', color: '#aaa', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ReviewManagement;
