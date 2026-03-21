import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, Trash2, Camera, Eye, EyeOff, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    updateMyProfile, changeMyPassword,
    getNotificationPreferences, updateNotificationPreferences,
    deleteMyAccount, revokeAllSessions,
    getMyProfile,
} from '../../services/authService';
import ImageCropperModal from '../../components/Admin/ImageCropperModal';
import PrimeLoader from '../../components/PrimeLoader';
import { useNavigate } from 'react-router-dom';

type Tab = 'profile' | 'security' | 'notifications' | 'account';

const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid #f0f0f2', background: '#fafafa',
    fontSize: '0.92rem', fontWeight: 600, color: '#1a1a1a',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
};
const fi = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--prime-orange)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
    e.currentTarget.style.background = '#fff';
};
const fo = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#f0f0f2';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = '#fafafa';
};

const pwdRules = [
    { id: 'len',  text: 'At least 6 characters',  test: (v: string) => v.length >= 6 },
    { id: 'spc',  text: 'No spaces',               test: (v: string) => v.length > 0 && !/\s/.test(v) },
    { id: 'up',   text: 'One uppercase letter',    test: (v: string) => /[A-Z]/.test(v) },
    { id: 'lo',   text: 'One lowercase letter',    test: (v: string) => /[a-z]/.test(v) },
    { id: 'num',  text: 'One number',              test: (v: string) => /[0-9]/.test(v) },
    { id: 'sym',  text: 'One special character',   test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: 'Profile',       icon: <User size={16} strokeWidth={2.5} /> },
    { key: 'security',      label: 'Security',      icon: <Shield size={16} strokeWidth={2.5} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} strokeWidth={2.5} /> },
    { key: 'account',       label: 'Account',       icon: <Trash2 size={16} strokeWidth={2.5} /> },
];

const StaffSettings: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const fileRef = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState<Tab>('profile');
    const [saving, setSaving] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [tempImg, setTempImg] = useState<File | null>(null);
    const [picFile, setPicFile] = useState<File | null>(null);

    // Profile form
    const [profile, setProfile] = useState({
        name: user?.name || '',
        dateOfBirth: '',
        gender: '',
    });
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

    // Security
    const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
    const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
    const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+?91/, '') : '');
    const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

    // Notifications
    const [notifs, setNotifs] = useState({ orderPlaced: true, lowStock: true });
    const [notifsLoading, setNotifsLoading] = useState(true);

    // Account deletion modal
    const [deleteModal, setDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const avatarSrc = picFile ? URL.createObjectURL(picFile) : user?.profilePicture || null;
    const displayName = user?.name || 'Staff';

    useEffect(() => {
        // Fetch full profile — dateOfBirth and gender are not in AuthUser
        getMyProfile()
            .then(data => {
                setProfile({
                    name: data.name || '',
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: data.gender || '',
                });
                setEmail(data.email || '');
                setPhone(data.phone ? data.phone.replace(/^\+?91/, '') : '');
            })
            .catch(() => {})
            .finally(() => setProfileLoading(false));

        getNotificationPreferences()
            .then(setNotifs)
            .catch(() => {})
            .finally(() => setNotifsLoading(false));
    }, []);

    // ── Profile save ──
    const handleSaveProfile = async () => {
        const errs: Record<string, string> = {};
        if (!profile.name.trim() || profile.name.trim().length < 3 || !/^[A-Za-z\s]+$/.test(profile.name.trim()))
            errs.name = 'Name must be at least 3 characters, letters only.';
        setProfileErrors(errs);
        if (Object.keys(errs).length) return;

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('name', profile.name.trim());
            if (profile.dateOfBirth) fd.append('dateOfBirth', profile.dateOfBirth);
            if (profile.gender) fd.append('gender', profile.gender);
            if (picFile) fd.append('profilePicture', picFile);
            const updated = await updateMyProfile(fd);
            updateUser({ name: updated.name, profilePicture: updated.profilePicture });
            setPicFile(null);
            showToast({ type: 'success', title: 'Profile updated', message: 'Your profile has been saved.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || 'Could not update profile.' });
        } finally { setSaving(false); }
    };

    // ── Contact save ──
    const handleSaveContact = async () => {
        const errs: Record<string, string> = {};
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email.';
        if (!phone || !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) errs.phone = 'Enter a valid 10-digit phone.';
        setContactErrors(errs);
        if (Object.keys(errs).length) return;

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('name', user?.name || '');
            fd.append('email', email.trim().toLowerCase());
            fd.append('phone', phone.replace(/\D/g, ''));
            const updated = await updateMyProfile(fd);
            updateUser({ email: updated.email, phone: updated.phone });
            showToast({ type: 'success', title: 'Contact updated', message: 'Email and phone have been saved.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || 'Could not update contact.' });
        } finally { setSaving(false); }
    };

    // ── Password save ──
    const handleChangePassword = async () => {
        const errs: Record<string, string> = {};
        if (!pwd.current) errs.current = 'Current password is required.';
        if (!pwdRules.every(r => r.test(pwd.newPwd))) errs.newPwd = 'Password does not meet all requirements.';
        if (pwd.newPwd !== pwd.confirm) errs.confirm = 'Passwords do not match.';
        setPwdErrors(errs);
        if (Object.keys(errs).length) return;

        setSaving(true);
        try {
            await changeMyPassword(pwd.current, pwd.newPwd);
            setPwd({ current: '', newPwd: '', confirm: '' });
            showToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || 'Incorrect current password.' });
        } finally { setSaving(false); }
    };

    // ── Notifications save ──
    const handleSaveNotifs = async (next: typeof notifs) => {
        setNotifs(next);
        try {
            await updateNotificationPreferences(next);
            showToast({ type: 'success', title: 'Preferences saved', message: 'Notification settings updated.' });
        } catch {
            showToast({ type: 'error', title: 'Failed', message: 'Could not save preferences.' });
        }
    };

    // ── Revoke all sessions ──
    const handleRevokeAll = async () => {
        setSaving(true);
        try {
            await revokeAllSessions();
            showToast({ type: 'success', title: 'Signed out everywhere', message: 'All other sessions have been revoked.' });
            await logout();
            navigate('/auth');
        } catch {
            showToast({ type: 'error', title: 'Failed', message: 'Could not revoke sessions.' });
        } finally { setSaving(false); }
    };

    // ── Delete account ──
    const handleDeleteAccount = async () => {
        setDeleteError('');
        if (deleteConfirmText !== user?.name) {
            setDeleteError(`Type your name "${user?.name}" exactly to confirm.`);
            return;
        }
        if (!deletePassword) { setDeleteError('Password is required.'); return; }
        setDeleting(true);
        try {
            await deleteMyAccount(deletePassword);
            showToast({ type: 'success', title: 'Account deleted', message: 'Your account has been scheduled for deletion.' });
            await logout();
            navigate('/auth');
        } catch (err: any) {
            setDeleteError(err?.response?.data?.message || 'Incorrect password.');
        } finally { setDeleting(false); }
    };

    const tog = (k: string) => setShowPwd(p => ({ ...p, [k]: !p[k] }));

    const EyeBtn = ({ k }: { k: string }) => (
        <button type="button" onClick={() => tog(k)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center' }}>
            {showPwd[k] ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
        </button>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
            <PrimeLoader isLoading={saving || deleting} />

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', margin: '0 0 6px' }}>Account Settings</h2>
                <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Manage your profile, security, and preferences</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Sidebar nav */}
                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 12, position: 'sticky', top: 24 }}>
                    {TABS.map(t => {
                        const active = tab === t.key;
                        const isDanger = t.key === 'account';
                        return (
                            <button key={t.key} onClick={() => setTab(t.key)} style={{
                                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                padding: '12px 14px', borderRadius: 12, border: 'none', marginBottom: 4,
                                background: active ? (isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(255,140,66,0.1)') : 'transparent',
                                color: active ? (isDanger ? '#ef4444' : 'var(--prime-orange)') : (isDanger ? '#ef4444' : '#666'),
                                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9f9fb'; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {t.icon} {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                        {/* ── PROFILE TAB ── */}
                        {tab === 'profile' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                                    <p style={{ ...lbl, marginBottom: 20 }}>Profile Photo & Info</p>
                                    {profileLoading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {[80, 40, 40, 40].map((h, i) => <div key={i} style={{ height: h, borderRadius: 12, background: '#f5f5f7', animation: 'pulse 1.5s infinite' }} />)}
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                                    <div onClick={() => fileRef.current?.click()} style={{
                                                        width: 80, height: 80, borderRadius: '50%', cursor: 'pointer', overflow: 'hidden',
                                                        background: avatarSrc ? undefined : 'linear-gradient(135deg,#ff8c42,#ff5722)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 900, fontSize: '1.4rem', color: '#fff', border: '3px solid #f0f0f2',
                                                    }}>
                                                        {avatarSrc
                                                            ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                                        }
                                                    </div>
                                                    <button onClick={() => fileRef.current?.click()} style={{
                                                        position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
                                                        borderRadius: '50%', border: '2px solid #fff', background: 'var(--prime-orange)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                    }}>
                                                        <Camera size={12} color="#fff" strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { setTempImg(e.target.files[0]); e.target.value = ''; } }} />
                                                <div>
                                                    <p style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', fontSize: '0.95rem' }}>Profile Photo</p>
                                                    <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>Click to upload. JPG, PNG or WebP, max 5MB.</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                                <div>
                                                    <label style={lbl}>Full Name *</label>
                                                    <input style={{ ...inp, borderColor: profileErrors.name ? '#ef4444' : '#f0f0f2' }}
                                                        value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                                        onFocus={fi} onBlur={fo} placeholder="Your full name" />
                                                    {profileErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: 4, display: 'block' }}>{profileErrors.name}</span>}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <div>
                                                        <label style={lbl}>Date of Birth</label>
                                                        <input type="date" style={inp} value={profile.dateOfBirth}
                                                            onChange={e => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))}
                                                            onFocus={fi} onBlur={fo} />
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>Gender</label>
                                                        <select style={{ ...inp, cursor: 'pointer' }} value={profile.gender}
                                                            onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                                                            <option value="">Prefer not to say</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                                <button onClick={handleSaveProfile} disabled={saving} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    Save Profile
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── SECURITY TAB ── */}
                        {tab === 'security' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Contact info */}
                                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                                    <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '0.95rem', margin: '0 0 4px' }}>Email & Phone</h5>
                                    <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Update your login email and phone number</p>
                                    <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={lbl}>Email *</label>
                                            <input type="email" style={{ ...inp, borderColor: contactErrors.email ? '#ef4444' : '#f0f0f2' }}
                                                value={email} onChange={e => setEmail(e.target.value)} onFocus={fi} onBlur={fo} />
                                            {contactErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: 4, display: 'block' }}>{contactErrors.email}</span>}
                                        </div>
                                        <div>
                                            <label style={lbl}>Phone *</label>
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <div style={{ position: 'absolute', left: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 600, color: '#555', pointerEvents: 'none' }}>
                                                    <span>🇮🇳</span><span>+91</span>
                                                    <div style={{ width: 1.5, height: 18, background: '#e0e0e0' }} />
                                                </div>
                                                <input type="tel" style={{ ...inp, paddingLeft: 88, borderColor: contactErrors.phone ? '#ef4444' : '#f0f0f2' }}
                                                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    onFocus={fi} onBlur={fo} />
                                            </div>
                                            {contactErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: 4, display: 'block' }}>{contactErrors.phone}</span>}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={handleSaveContact} disabled={saving} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                                            Save Contact
                                        </button>
                                    </div>
                                </div>

                                {/* Change password */}
                                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                                    <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '0.95rem', margin: '0 0 4px' }}>Change Password</h5>
                                    <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Use a strong password you don't use elsewhere</p>
                                    <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {(['current', 'newPwd', 'confirm'] as const).map((k, i) => (
                                            <div key={k}>
                                                <label style={lbl}>{['Current Password', 'New Password', 'Confirm New Password'][i]} *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input type={showPwd[k] ? 'text' : 'password'}
                                                        style={{ ...inp, paddingRight: 44, borderColor: pwdErrors[k] ? '#ef4444' : '#f0f0f2' }}
                                                        value={pwd[k]} onChange={e => setPwd(p => ({ ...p, [k]: e.target.value }))}
                                                        onFocus={fi} onBlur={fo} placeholder={['Enter current password', 'Enter new password', 'Confirm new password'][i]} />
                                                    <EyeBtn k={k} />
                                                </div>
                                                {pwdErrors[k] && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: 4, display: 'block' }}>{pwdErrors[k]}</span>}
                                                {k === 'newPwd' && (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginTop: 10 }}>
                                                        {pwdRules.map(r => {
                                                            const ok = r.test(pwd.newPwd);
                                                            return (
                                                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: ok ? '#10b981' : '#bbb', fontWeight: ok ? 600 : 500, transition: 'color 0.3s' }}>
                                                                    {ok ? <CheckCircle size={12} strokeWidth={2.5} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #ddd' }} />}
                                                                    {r.text}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={handleChangePassword} disabled={saving} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sessions */}
                                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                                    <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '0.95rem', margin: '0 0 4px' }}>Active Sessions</h5>
                                    <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Sign out from all devices including this one</p>
                                    <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 14, border: '1px solid #f0f0f2', background: '#fafafa' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <LogOut size={16} color="#6366f1" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem' }}>Sign out everywhere</div>
                                                <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 2 }}>Revokes all active sessions across all devices</div>
                                            </div>
                                        </div>
                                        <button onClick={handleRevokeAll} disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)', color: '#6366f1', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = '#6366f1'; }}>
                                            Sign Out All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── NOTIFICATIONS TAB ── */}
                        {tab === 'notifications' && (
                            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                                <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '0.95rem', margin: '0 0 4px' }}>Email Notifications</h5>
                                <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 20px' }}>Choose which emails you want to receive</p>
                                <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />
                                {notifsLoading ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {[1, 2].map(i => <div key={i} style={{ height: 72, borderRadius: 14, background: '#f5f5f7', animation: 'pulse 1.5s infinite' }} />)}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {[
                                            { key: 'orderPlaced' as const, title: 'New Order', desc: 'Get notified when a customer places an order on your products', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                                            { key: 'lowStock' as const, title: 'Low Stock Alert', desc: 'Get notified when any of your products drops below 15 units', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                                        ].map(item => (
                                            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderRadius: 14, border: `1px solid ${notifs[item.key] ? item.bg.replace('0.08', '0.3') : '#f0f0f2'}`, background: notifs[item.key] ? item.bg : '#fafafa', transition: 'all 0.2s' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.9rem', marginBottom: 4 }}>{item.title}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{item.desc}</div>
                                                </div>
                                                {/* Toggle switch */}
                                                <div onClick={() => handleSaveNotifs({ ...notifs, [item.key]: !notifs[item.key] })}
                                                    style={{ width: 44, height: 24, borderRadius: 12, background: notifs[item.key] ? item.color : '#e0e0e0', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                                                    <div style={{ position: 'absolute', top: 3, left: notifs[item.key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── ACCOUNT TAB ── */}
                        {tab === 'account' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ background: 'rgba(239,68,68,0.02)', borderRadius: 20, border: '1px solid rgba(239,68,68,0.12)', padding: 28 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <AlertTriangle size={17} color="#ef4444" strokeWidth={2.5} />
                                        <h5 style={{ fontWeight: 800, color: '#ef4444', fontSize: '1rem', margin: 0 }}>Danger Zone</h5>
                                    </div>
                                    <p style={{ color: '#999', fontSize: '0.85rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                                        Deleting your account will schedule it for permanent removal after 30 days. During this period, a superadmin can restore it. After 30 days, all your data is erased.
                                    </p>
                                    <div style={{ height: 1, background: 'rgba(239,68,68,0.1)', marginBottom: 20 }} />
                                    <button onClick={() => { setDeleteModal(true); setDeletePassword(''); setDeleteConfirmText(''); setDeleteError(''); }}
                                        style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}>
                                        <Trash2 size={14} strokeWidth={2.5} /> Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Delete confirmation modal ── */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Trash2 size={20} color="#ef4444" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: 900, color: '#1a1a1a', fontSize: '1.1rem' }}>Delete Account</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>This action starts a 30-day deletion countdown</p>
                                </div>
                            </div>
                            <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={lbl}>Type your name to confirm</label>
                                    <input style={{ ...inp, borderColor: deleteError ? '#ef4444' : '#f0f0f2' }}
                                        value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                                        onFocus={fi} onBlur={fo} placeholder={user?.name} />
                                    <p style={{ fontSize: '0.75rem', color: '#bbb', margin: '6px 0 0' }}>Type exactly: <strong style={{ color: '#555' }}>{user?.name}</strong></p>
                                </div>
                                <div>
                                    <label style={lbl}>Your password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPwd['del'] ? 'text' : 'password'}
                                            style={{ ...inp, paddingRight: 44, borderColor: deleteError ? '#ef4444' : '#f0f0f2' }}
                                            value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                                            onFocus={fi} onBlur={fo} placeholder="Enter your password" />
                                        <EyeBtn k="del" />
                                    </div>
                                </div>
                                {deleteError && (
                                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
                                        {deleteError}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button onClick={() => setDeleteModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #f0f0f2', background: '#fff', color: '#555', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={handleDeleteAccount} disabled={deleting || deleteConfirmText !== user?.name}
                                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: deleteConfirmText === user?.name ? '#ef4444' : '#f5f5f7', color: deleteConfirmText === user?.name ? '#fff' : '#bbb', fontWeight: 800, fontSize: '0.9rem', cursor: deleteConfirmText === user?.name ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Trash2 size={15} strokeWidth={2.5} />
                                    {deleting ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ImageCropperModal isOpen={!!tempImg} imageFile={tempImg}
                onApply={f => { setPicFile(f); setTempImg(null); }}
                onCancel={() => setTempImg(null)} />
        </motion.div>
    );
};

export default StaffSettings;
