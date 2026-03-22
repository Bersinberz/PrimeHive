import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Trash2, AlertTriangle, RotateCcw, Edit2, Store, MapPin, Phone, FileText, ShoppingBag, TrendingUp, Package, BarChart2, RefreshCw } from 'lucide-react';
import type { Staff, StaffStoreStats } from '../../../services/admin/staffService';
import { resendStaffSetupEmail, getStaffStoreStats } from '../../../services/admin/staffService';
import ActionConfirmModal, { type ActionConfirmType } from '../ActionConfirmModal';
import DeletionCountdown from '../DeletionCountdown';
import { useToast } from '../../../context/ToastContext';
import { formatPhone } from '../../../utils/formatPhone';

type StaffStatus = 'active' | 'inactive';

interface StaffProfileProps {
    staff: Staff;
    isSaving: boolean;
    onBack: () => void;
    onEdit: () => void;
    onStatusChange: (id: string, status: StaffStatus) => void;
    onDelete: (id: string) => void;
    onHardDelete: (id: string) => void;
    onRevokeDelete: (id: string) => void;
}

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const getStatusStyle = (s: string) => {
    if (s === 'active')   return { color: '#10b981', bg: 'rgba(16,185,129,0.08)' };
    if (s === 'inactive') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
    if (s === 'deleted')  return { color: '#9ca3af', bg: 'rgba(107,114,128,0.08)' };
    return { color: '#999', bg: '#f0f0f2' };
};

const StaffProfile: React.FC<StaffProfileProps> = ({
    staff, isSaving, onBack, onEdit, onStatusChange, onDelete, onHardDelete, onRevokeDelete,
}) => {
    const [modal, setModal] = React.useState<{ open: boolean; type: ActionConfirmType | null }>({ open: false, type: null });
    const [resending, setResending] = React.useState(false);
    const [storeStats, setStoreStats] = React.useState<StaffStoreStats | null>(null);
    const [statsLoading, setStatsLoading] = React.useState(true);
    const { showToast } = useToast();

    React.useEffect(() => {
        setStatsLoading(true);
        getStaffStoreStats(staff._id)
            .then(setStoreStats)
            .catch(() => {})
            .finally(() => setStatsLoading(false));
    }, [staff._id]);

    const isDeleted = staff.status === 'deleted';
    const st = getStatusStyle(staff.status);

    const openModal = (type: ActionConfirmType) => setModal({ open: true, type });
    const closeModal = () => setModal({ open: false, type: null });

    const handleConfirm = () => {
        if (!modal.type) return;
        closeModal();
        if (modal.type === 'delete')      { onDelete(staff._id); return; }
        if (modal.type === 'hard_delete') { onHardDelete(staff._id); return; }
        const map: Record<string, StaffStatus> = { activate: 'active', deactivate: 'inactive' };
        onStatusChange(staff._id, map[modal.type] as StaffStatus);
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await resendStaffSetupEmail(staff.email);
            showToast({ type: 'success', title: 'Email sent', message: `A new setup link has been sent to ${staff.email}.` });
        } catch {
            showToast({ type: 'error', title: 'Failed to send', message: 'Could not resend the setup email. Please try again.' });
        } finally {
            setResending(false);
        }
    };

    const purgeDate = staff.deletedAt
        ? new Date(new Date(staff.deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    return (
        <>
            {/* Back + heading */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 24 }}>
                <button className="back-nav-btn" onClick={onBack}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Staff
                </button>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', marginTop: 16, marginBottom: 4 }}>Staff Profile</h2>
                <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>View details and manage access</p>
            </motion.div>

            {/* Password not set banner */}
            {!staff.isPasswordSet && !isDeleted && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 16, padding: '16px 20px', marginBottom: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Lock size={16} color="#f59e0b" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 800, color: '#92400e' }}>Password not set</p>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#b45309', fontWeight: 500 }}>This user hasn't set their password yet.</p>
                        </div>
                    </div>
                    <button onClick={handleResend} disabled={resending} style={{
                        padding: '9px 16px', borderRadius: 10, border: '1.5px solid rgba(245,158,11,0.4)',
                        background: resending ? 'transparent' : '#f59e0b', color: resending ? '#f59e0b' : '#fff',
                        fontWeight: 700, fontSize: '0.8rem', cursor: resending ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <RotateCcw size={13} strokeWidth={2.5} />
                        {resending ? 'Sending…' : 'Resend Email'}
                    </button>
                </motion.div>
            )}

            {/* Deletion banner */}
            {isDeleted && staff.deletedAt && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.18)',
                    borderRadius: 16, padding: '14px 20px', marginBottom: 20,
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trash2 size={16} color="#9ca3af" strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px', fontSize: '0.88rem', fontWeight: 800, color: '#6b7280' }}>Account scheduled for deletion</p>
                        <DeletionCountdown deletedAt={staff.deletedAt} />
                    </div>
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
                {/* Left: Identity card */}
                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: isDeleted ? '#e5e7eb' : 'linear-gradient(135deg,#ff8c42,#ff5722)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.4rem', color: isDeleted ? '#9ca3af' : '#fff',
                        margin: '0 auto 16px', overflow: 'hidden',
                        filter: isDeleted ? 'grayscale(1)' : 'none',
                    }}>
                        {staff.profilePicture
                            ? <img src={staff.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                        }
                    </div>
                    <h4 style={{ fontWeight: 800, color: isDeleted ? '#9ca3af' : '#1a1a1a', marginBottom: 6, textDecoration: isDeleted ? 'line-through' : 'none' }}>{staff.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: st.color, background: st.bg, padding: '4px 14px', borderRadius: 20, textTransform: 'capitalize' }}>{staff.status}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', padding: '4px 14px', borderRadius: 20 }}>staff</span>
                    </div>

                    <div style={{ marginTop: 28, borderTop: '1px solid #f0f0f2', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
                        {[
                            { label: 'Email',       value: staff.email },
                            { label: 'Phone',       value: formatPhone(staff.phone) },
                            { label: 'Date of Birth', value: staff.dateOfBirth ? formatDate(staff.dateOfBirth) : 'Not Provided' },
                            { label: 'Gender',      value: staff.gender || 'Not Provided' },
                            { label: 'Joined',      value: formatDate(staff.createdAt) },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {!isDeleted && (
                        <div style={{ marginTop: 24 }}>
                            <button onClick={onEdit} disabled={isSaving} style={{
                                width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #e8e8e8',
                                background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: '0.9rem',
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--prime-orange)'; e.currentTarget.style.color = 'var(--prime-orange)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#1a1a1a'; }}
                            >
                                <Edit2 size={16} strokeWidth={2} /> Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── Store & Stats Card ── */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Store size={18} color="#6366f1" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>Store & Performance</h5>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa' }}>Store profile and sales overview</p>
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
                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                    {[
                                        { icon: <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />, bg: 'rgba(16,185,129,0.08)', label: 'Total Revenue', value: `₹${(storeStats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, color: '#10b981' },
                                        { icon: <ShoppingBag size={16} color="var(--prime-orange)" strokeWidth={2.5} />, bg: 'rgba(255,140,66,0.08)', label: 'Total Orders', value: (storeStats?.totalOrders ?? 0).toLocaleString(), color: 'var(--prime-orange)' },
                                        { icon: <Package size={16} color="#6366f1" strokeWidth={2.5} />, bg: 'rgba(99,102,241,0.08)', label: 'Products Listed', value: (storeStats?.totalProducts ?? 0).toLocaleString(), color: '#6366f1' },
                                        { icon: <BarChart2 size={16} color="#f59e0b" strokeWidth={2.5} />, bg: 'rgba(245,158,11,0.08)', label: 'Units Sold', value: (storeStats?.totalUnitsSold ?? 0).toLocaleString(), color: '#f59e0b' },
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

                                {/* Store details */}
                                {storeStats?.storeName ? (
                                    <div style={{ background: '#f8f9ff', border: '1px solid #e8eaff', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Store size={14} color="#6366f1" strokeWidth={2.5} />
                                            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1a1a1a' }}>{storeStats.storeName}</span>
                                        </div>
                                        {storeStats.storeDescription && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                                <FileText size={13} color="#aaa" strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>{storeStats.storeDescription}</p>
                                            </div>
                                        )}
                                        {storeStats.storeLocation && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <MapPin size={13} color="#aaa" strokeWidth={2} />
                                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{storeStats.storeLocation}</span>
                                            </div>
                                        )}
                                        {storeStats.storePhone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Phone size={13} color="#aaa" strokeWidth={2} />
                                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{storeStats.storePhone}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ background: '#fafafa', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Store size={15} color="#ccc" strokeWidth={2} />
                                        <span style={{ fontSize: '0.82rem', color: '#bbb', fontWeight: 600 }}>Store profile not set up yet</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── NOT DELETED: Account Actions + Danger Zone ── */}
                    {!isDeleted && (
                        <>
                            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                                <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: 4 }}>Account Actions</h5>
                                <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Change staff account status</p>
                                <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {staff.status !== 'active' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 14, border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Activate Account</div>
                                                <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 2 }}>Restore full admin access</div>
                                            </div>
                                            <button onClick={() => openModal('activate')} disabled={isSaving} style={{
                                                padding: '9px 18px', borderRadius: 10, border: '1.5px solid rgba(16,185,129,0.3)',
                                                background: 'rgba(16,185,129,0.06)', color: '#10b981', fontWeight: 700,
                                                fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.color = '#10b981'; }}
                                            >
                                                <Unlock size={13} strokeWidth={2.5} /> Activate
                                            </button>
                                        </div>
                                    )}
                                    {staff.status !== 'inactive' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 14, border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Deactivate Account</div>
                                                <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 2 }}>Suspend admin access temporarily</div>
                                            </div>
                                            <button onClick={() => openModal('deactivate')} disabled={isSaving} style={{
                                                padding: '9px 18px', borderRadius: 10, border: '1.5px solid rgba(245,158,11,0.3)',
                                                background: 'rgba(245,158,11,0.06)', color: '#f59e0b', fontWeight: 700,
                                                fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.color = '#f59e0b'; }}
                                            >
                                                <Lock size={13} strokeWidth={2.5} /> Deactivate
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Danger Zone — outlined, not filled */}
                            <div style={{ background: 'rgba(239,68,68,0.02)', borderRadius: 20, border: '1px solid rgba(239,68,68,0.12)', padding: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <AlertTriangle size={17} color="#ef4444" strokeWidth={2.5} />
                                    <h5 style={{ fontWeight: 800, color: '#ef4444', fontSize: '1rem', margin: 0 }}>Danger Zone</h5>
                                </div>
                                <p style={{ color: '#999', fontSize: '0.82rem', margin: '0 0 18px', lineHeight: 1.6 }}>
                                    Permanently delete this staff account. This cannot be undone.
                                </p>
                                <button onClick={() => openModal('delete')} disabled={isSaving} style={{
                                    padding: '10px 22px', borderRadius: 10,
                                    border: '1.5px solid rgba(239,68,68,0.4)',
                                    background: 'transparent', color: '#ef4444',
                                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                                >
                                    <Trash2 size={14} strokeWidth={2.5} /> Delete Staff Account
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── DELETED: only countdown + hard delete ── */}
                    {isDeleted && staff.deletedAt && (
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
                                <DeletionCountdown deletedAt={staff.deletedAt} />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                                <button onClick={() => onRevokeDelete(staff._id)} disabled={isSaving} style={{
                                    flex: 1, padding: '10px 22px', borderRadius: 10,
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
                                <button onClick={() => openModal('hard_delete')} disabled={isSaving} style={{
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
                isOpen={modal.open}
                actionType={modal.type}
                itemName={staff.name}
                onConfirm={handleConfirm}
                onCancel={closeModal}
            />
        </>
    );
};

export default StaffProfile;
