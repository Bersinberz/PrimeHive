import React from 'react';
import { motion } from 'framer-motion';
import type { Staff } from '../../../services/admin/staffService';
import ActionConfirmModal, { type ActionConfirmType } from '../ActionConfirmModal';type StaffStatus = 'active' | 'inactive';

interface StaffProfileProps {
    staff: Staff;
    isSaving: boolean;
    onBack: () => void;
    onEdit: () => void;
    onStatusChange: (id: string, status: StaffStatus) => void;
    onDelete: (id: string) => void;
}

const getStatusStyle = (status: StaffStatus) => {
    switch (status) {
        case 'active': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
        case 'inactive': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };

        default: return { color: '#999', bg: '#f0f0f2' };
    }
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const StaffProfile: React.FC<StaffProfileProps> = ({ staff, isSaving, onBack, onEdit, onStatusChange, onDelete }) => {
    const [modalState, setModalState] = React.useState<{
        isOpen: boolean;
        actionType: ActionConfirmType | null;
    }>({ isOpen: false, actionType: null });

    const handleActionClick = (action: ActionConfirmType) => {
        setModalState({ isOpen: true, actionType: action });
    };

    const handleConfirmAction = () => {
        if (!modalState.actionType) return;
        if (modalState.actionType === 'delete') {
            onDelete(staff._id);
        } else {
            const statusMap: Record<string, StaffStatus> = {
                activate: 'active',
                deactivate: 'inactive'
            };
            onStatusChange(staff._id, statusMap[modalState.actionType] as StaffStatus);
        }
        setModalState({ isOpen: false, actionType: null });
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '24px' }}>
                <button className="back-nav-btn" onClick={onBack}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Staff
                </button>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', marginTop: '16px', marginBottom: '4px' }}>
                    Staff Profile
                </h2>
                <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                    View details and manage access
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
                {/* Left: Identity */}
                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff8c42 0%, #ff5722 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.4rem', color: '#fff', margin: '0 auto 16px',
                        overflow: 'hidden'
                    }}>
                        {staff.profilePicture ? (
                            <img src={staff.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            staff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        )}
                    </div>
                    <h4 style={{ fontWeight: 800, color: '#1a1a1a', marginBottom: '6px' }}>{staff.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                            fontSize: '0.72rem', fontWeight: 700,
                            color: getStatusStyle(staff.status as StaffStatus).color,
                            background: getStatusStyle(staff.status as StaffStatus).bg,
                            padding: '4px 14px', borderRadius: '20px', textTransform: 'capitalize',
                        }}>{staff.status}</span>
                        <span style={{
                            fontSize: '0.72rem', fontWeight: 700, color: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.08)',
                            padding: '4px 14px', borderRadius: '20px',
                        }}>staff</span>
                    </div>

                    <div style={{ marginTop: '28px', borderTop: '1px solid #f0f0f2', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                        {[
                            { label: 'Email', value: staff.email },
                            { label: 'Phone', value: staff.phone.startsWith('+91') && !staff.phone.includes(' ') ? `+91 ${staff.phone.slice(3)}` : staff.phone },
                            { label: 'Date of Birth', value: staff.dateOfBirth ? formatDate(staff.dateOfBirth) : 'Not Provided' },
                            { label: 'Gender', value: staff.gender || 'Not Provided' },
                            { label: 'Joined', value: formatDate(staff.createdAt) },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
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
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '28px' }}>
                        <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '4px' }}>Account Actions</h5>
                        <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Change staff account status</p>
                        <div style={{ height: '1px', background: '#f0f0f2', marginBottom: '20px' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {staff.status !== 'active' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Activate Account</div>
                                        <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Restore full admin access</div>
                                    </div>
                                    <button onClick={() => handleActionClick('activate')} disabled={isSaving}
                                        style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.color = '#10b981'; }}
                                    >Activate</button>
                                </div>
                            )}
                            {staff.status !== 'inactive' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Deactivate Account</div>
                                        <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Suspend admin access temporarily</div>
                                    </div>
                                    <button onClick={() => handleActionClick('deactivate')} disabled={isSaving}
                                        style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)', color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.color = '#f59e0b'; }}
                                    >Deactivate</button>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div style={{ background: 'rgba(239,68,68,0.02)', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.12)', padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <h5 style={{ fontWeight: 800, color: '#ef4444', fontSize: '1rem', margin: 0 }}>Danger Zone</h5>
                        </div>
                        <p style={{ color: '#999', fontSize: '0.82rem', marginBottom: '16px' }}>
                            Permanently delete this staff account. This cannot be undone.
                        </p>
                        <button onClick={() => handleActionClick('delete')} disabled={isSaving}
                            style={{ padding: '10px 24px', borderRadius: '10px', border: '1.5px solid #ef4444', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete Staff Permanently
                        </button>
                    </div>
                </div>
            </div>

            <ActionConfirmModal
                isOpen={modalState.isOpen}
                actionType={modalState.actionType}
                itemName={staff.name}
                onConfirm={handleConfirmAction}
                onCancel={() => setModalState({ isOpen: false, actionType: null })}
            />
        </>
    );
};

export default StaffProfile;