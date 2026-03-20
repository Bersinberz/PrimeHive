import React from 'react';
import { motion } from 'framer-motion';
import type { Staff } from '../../../services/admin/staffService';

type StaffStatus = 'active' | 'inactive';

interface StaffListProps {
    staffList: Staff[];
    filteredStaff: Staff[];
    searchQuery: string;
    isLoading: boolean;
    onViewProfile: (staff: Staff) => void;
}

const getStatusStyle = (status: StaffStatus) => {
    switch (status) {
        case 'active': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
        case 'inactive': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };

        default: return { color: '#999', bg: '#f0f0f2' };
    }
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

const StaffList: React.FC<StaffListProps> = ({ staffList, filteredStaff, searchQuery, isLoading, onViewProfile }) => {
    if (staffList.length === 0 && !isLoading) {
        return (
            <div className="empty-state-container">
                <div className="empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '8px' }}>No staff yet</h3>
                <p style={{ color: '#999', fontSize: '0.95rem', maxWidth: '360px', lineHeight: 1.6 }}>
                    Click <strong>"Add Staff"</strong> to create your first staff member.
                </p>
            </div>
        );
    }

    return (
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', overflow: 'hidden' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 100px',
                padding: '14px 24px',
                borderBottom: '1px solid #f0f0f2',
                background: '#fafafa',
            }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Staff Member</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Joined</span>
            </div>

            {filteredStaff.map((s, i) => {
                const st = getStatusStyle(s.status as StaffStatus);
                return (
                    <motion.div
                        key={s._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        onClick={() => onViewProfile(s)}
                        style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px',
                            padding: '16px 24px', alignItems: 'center', cursor: 'pointer',
                            borderBottom: i < filteredStaff.length - 1 ? '1px solid #f5f5f7' : 'none',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {s.profilePicture ? (
                                <img src={s.profilePicture} alt={s.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #f0f0f2' }} />
                            ) : (
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ff8c42 0%, #ff5722 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                                }}>
                                    {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>{s.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>{s.phone}</div>
                        <div>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 700, color: st.color, background: st.bg,
                                padding: '4px 12px', borderRadius: '20px', textTransform: 'capitalize',
                            }}>{s.status}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 500, textAlign: 'right' }}>
                            {formatDate(s.createdAt)}
                        </div>
                    </motion.div>
                );
            })}

            {filteredStaff.length === 0 && staffList.length > 0 && (
                <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No staff match "<strong>{searchQuery}</strong>"</p>
                </div>
            )}
        </div>
    );
};

export default StaffList;