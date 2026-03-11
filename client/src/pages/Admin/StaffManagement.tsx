import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    getStaff,
    addStaff,
    updateStaffStatus,
    deleteStaff,
    type Staff,
} from '../../services/Admin/staffService';
import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';

type StaffStatus = 'active' | 'inactive' | 'banned';

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1.5px solid #f0f0f2',
    background: '#fafafa',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#1a1a1a',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
};

const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = 'var(--prime-orange)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = '#f0f0f2';
        e.currentTarget.style.boxShadow = 'none';
    },
};

const StaffManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'add' | 'profile'>('list');
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

    // Add Staff form
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => { loadStaff(); }, []);

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch {
            setToast({ type: 'error', title: 'Load Failed', message: 'Could not load staff members.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone || !form.password) {
            setToast({ type: 'error', title: 'Missing Fields', message: 'All fields are required.' });
            return;
        }
        setIsSaving(true);
        try {
            const newStaff = await addStaff(form);
            setStaffList(prev => [newStaff, ...prev]);
            setForm({ name: '', email: '', phone: '', password: '' });
            setView('list');
            setToast({ type: 'success', title: 'Created', message: `${newStaff.name} added as staff.` });
        } catch (err: any) {
            setToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || err?.message || 'Could not add staff.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (id: string, status: StaffStatus) => {
        setIsSaving(true);
        try {
            const updated = await updateStaffStatus(id, status);
            setStaffList(prev => prev.map(s => s._id === id ? updated : s));
            if (selectedStaff?._id === id) setSelectedStaff(updated);
            const label = status === 'active' ? 'Activated' : status === 'inactive' ? 'Deactivated' : 'Banned';
            setToast({ type: 'success', title: label, message: `Staff status updated to ${status}.` });
        } catch (err: any) {
            setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not update status.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this staff member?')) return;
        setIsSaving(true);
        try {
            await deleteStaff(id);
            setStaffList(prev => prev.filter(s => s._id !== id));
            if (selectedStaff?._id === id) { setView('list'); setSelectedStaff(null); }
            setToast({ type: 'success', title: 'Deleted', message: 'Staff member removed.' });
        } catch (err: any) {
            setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not delete.' });
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyle = (status: StaffStatus) => {
        switch (status) {
            case 'active': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
            case 'inactive': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };
            case 'banned': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' };
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const filtered = staffList.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
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

                {/* ── LIST VIEW ── */}
                {view === 'list' && (
                    <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="command-bar"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                                        Staff
                                    </h2>
                                    <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0' }}>
                                        Manage your store's staff members and their access
                                    </p>
                                </div>
                                <button className="new-product-btn" onClick={() => setView('add')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Staff
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <div className="search-input-wrapper">
                                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                                    <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                                        <span className="stat-dot" style={{ background: '#6366f1' }} />
                                        <span className="stat-count">{staffList.length}</span>
                                        Total
                                    </motion.div>
                                    <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                                        <span className="stat-dot" style={{ background: '#10b981' }} />
                                        <span className="stat-count">{staffList.filter(s => s.status === 'active').length}</span>
                                        Active
                                    </motion.div>
                                    <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                                        <span className="stat-dot" style={{ background: '#f59e0b' }} />
                                        <span className="stat-count">{staffList.filter(s => s.status === 'inactive').length}</span>
                                        Inactive
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Staff List */}
                        {staffList.length === 0 && !isLoading ? (
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
                        ) : (
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

                                {filtered.map((s, i) => {
                                    const st = getStatusStyle(s.status as StaffStatus);
                                    return (
                                        <motion.div
                                            key={s._id}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.3 }}
                                            onClick={() => { setSelectedStaff(s); setView('profile'); }}
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{
                                                    width: '42px', height: '42px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #ff8c42 0%, #ff5722 100%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 800, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                                                }}>
                                                    {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
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

                                {filtered.length === 0 && staffList.length > 0 && (
                                    <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No staff match "<strong>{searchQuery}</strong>"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── ADD STAFF VIEW ── */}
                {view === 'add' && (
                    <motion.div key="add" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '24px' }}>
                            <button className="back-nav-btn" onClick={() => setView('list')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Staff
                            </button>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', marginTop: '16px', marginBottom: '4px' }}>
                                New Staff Member
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                                Create an admin account with staff-level access
                            </p>
                        </motion.div>

                        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '40px', maxWidth: '600px' }}>
                            <form onSubmit={handleAddStaff}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Full Name *</label>
                                        <input type="text" style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Doe" required {...focusHandlers} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={labelStyle}>Email *</label>
                                            <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@store.com" required {...focusHandlers} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Phone *</label>
                                            <input type="text" style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91XXXXXXXXXX" required {...focusHandlers} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Password *</label>
                                        <input type="password" style={inputStyle} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" required minLength={6} {...focusHandlers} />
                                    </div>
                                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f2' }}>
                                        <button type="submit" disabled={isSaving} className="new-product-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <line x1="20" y1="8" x2="20" y2="14" />
                                                <line x1="23" y1="11" x2="17" y2="11" />
                                            </svg>
                                            {isSaving ? 'Creating...' : 'Create Staff Account'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* ── PROFILE VIEW ── */}
                {view === 'profile' && selectedStaff && (
                    <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '24px' }}>
                            <button className="back-nav-btn" onClick={() => setView('list')}>
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
                                }}>
                                    {selectedStaff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <h4 style={{ fontWeight: 800, color: '#1a1a1a', marginBottom: '6px' }}>{selectedStaff.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 700,
                                        color: getStatusStyle(selectedStaff.status).color,
                                        background: getStatusStyle(selectedStaff.status).bg,
                                        padding: '4px 14px', borderRadius: '20px', textTransform: 'capitalize',
                                    }}>{selectedStaff.status}</span>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 700, color: '#6366f1',
                                        background: 'rgba(99, 102, 241, 0.08)',
                                        padding: '4px 14px', borderRadius: '20px',
                                    }}>staff</span>
                                </div>

                                <div style={{ marginTop: '28px', borderTop: '1px solid #f0f0f2', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                                    {[
                                        { label: 'Email', value: selectedStaff.email },
                                        { label: 'Phone', value: selectedStaff.phone },
                                        { label: 'Joined', value: formatDate(selectedStaff.createdAt) },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '28px' }}>
                                    <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '4px' }}>Account Actions</h5>
                                    <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Change staff account status</p>
                                    <div style={{ height: '1px', background: '#f0f0f2', marginBottom: '20px' }} />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {selectedStaff.status !== 'active' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Activate Account</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Restore full admin access</div>
                                                </div>
                                                <button onClick={() => handleStatusChange(selectedStaff._id, 'active')} disabled={isSaving}
                                                    style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.color = '#10b981'; }}
                                                >Activate</button>
                                            </div>
                                        )}
                                        {selectedStaff.status !== 'inactive' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Deactivate Account</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Suspend admin access temporarily</div>
                                                </div>
                                                <button onClick={() => handleStatusChange(selectedStaff._id, 'inactive')} disabled={isSaving}
                                                    style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)', color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.color = '#f59e0b'; }}
                                                >Deactivate</button>
                                            </div>
                                        )}
                                        {selectedStaff.status !== 'banned' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Ban Staff</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Permanently revoke all admin access</div>
                                                </div>
                                                <button onClick={() => handleStatusChange(selectedStaff._id, 'banned')} disabled={isSaving}
                                                    style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.color = '#ef4444'; }}
                                                >Ban</button>
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
                                    <button onClick={() => handleDelete(selectedStaff._id)} disabled={isSaving}
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
                    </motion.div>
                )}

            </AnimatePresence>
        </motion.div>
    );
};

export default StaffManagement;
