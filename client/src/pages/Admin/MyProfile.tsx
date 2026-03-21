import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateMyProfile, changeMyPassword } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import ImageCropperModal from '../../components/Admin/ImageCropperModal';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: '14px',
    border: '1.5px solid #f0f0f2', background: '#fafafa', fontSize: '0.92rem',
    fontWeight: 600, color: '#1a1a1a', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px',
};
const errorStyle: React.CSSProperties = {
    color: '#e74c3c', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', display: 'block',
};
const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--prime-orange)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
};
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#f0f0f2';
    e.currentTarget.style.boxShadow = 'none';
};

const pwdRules = [
    { id: 'length',    text: 'At least 6 characters',  test: (v: string) => v.length >= 6 },
    { id: 'noSpaces',  text: 'No spaces',               test: (v: string) => v.length > 0 && !/\s/.test(v) },
    { id: 'uppercase', text: 'One uppercase letter',    test: (v: string) => /[A-Z]/.test(v) },
    { id: 'lowercase', text: 'One lowercase letter',    test: (v: string) => /[a-z]/.test(v) },
    { id: 'number',    text: 'One number',              test: (v: string) => /[0-9]/.test(v) },
    { id: 'special',   text: 'One special character',   test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const MyProfile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [tempImage, setTempImage] = useState<File | null>(null);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone ? user.phone.replace(/^\+?91/, '') : '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Password section
    const [showPwdSection, setShowPwdSection] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwd, setPwd] = useState({ current: '', newPwd: '' });
    const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

    const avatarSrc = profilePicFile
        ? URL.createObjectURL(profilePicFile)
        : user?.profilePicture || null;

    const validateField = (field: string, value: string) => {
        let error = '';
        if (field === 'name' && (!value || value.trim().length < 3 || !/^[A-Za-z\s]+$/.test(value.trim())))
            error = 'Name must be at least 3 characters and contain only letters.';
        if (field === 'email' && (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())))
            error = 'Please enter a valid email address.';
        if (field === 'phone' && (!value || !/^[0-9]{10}$/.test(value.replace(/\D/g, ''))))
            error = 'Phone number must be exactly 10 digits.';
        setErrors(prev => { const n = { ...prev }; if (error) n[field] = error; else delete n[field]; return n; });
    };

    const handleSaveProfile = async () => {
        // Validate all
        const errs: Record<string, string> = {};
        if (!form.name || form.name.trim().length < 3 || !/^[A-Za-z\s]+$/.test(form.name.trim()))
            errs.name = 'Name must be at least 3 characters and contain only letters.';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
            errs.email = 'Please enter a valid email address.';
        if (!form.phone || !/^[0-9]{10}$/.test(form.phone.replace(/\D/g, '')))
            errs.phone = 'Phone number must be exactly 10 digits.';
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setIsSaving(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name.trim());
            fd.append('email', form.email.trim().toLowerCase());
            fd.append('phone', form.phone.replace(/\D/g, ''));
            if (profilePicFile) fd.append('profilePicture', profilePicFile);

            const updated = await updateMyProfile(fd);
            updateUser({ name: updated.name, email: updated.email, phone: updated.phone, profilePicture: updated.profilePicture });
            setProfilePicFile(null);
            showToast({ type: 'success', title: 'Saved', message: 'Profile updated successfully!' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        const errs: Record<string, string> = {};
        if (!pwd.current) errs.current = 'Current password is required.';
        if (!pwdRules.every(r => r.test(pwd.newPwd))) errs.newPwd = 'Please meet all password requirements.';
        setPwdErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setIsSaving(true);
        try {
            await changeMyPassword(pwd.current, pwd.newPwd);
            setPwd({ current: '', newPwd: '' });
            setShowPwdSection(false);
            showToast({ type: 'success', title: 'Updated', message: 'Password changed successfully!' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not change password.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '760px', margin: '0 auto', paddingBottom: '40px' }}>
            <PrimeLoader isLoading={isSaving} />

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0 }}>My Profile</h1>
                <p style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: 500, margin: '6px 0 0' }}>Manage your personal information and password</p>
            </div>

            {/* Profile Card */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '32px', marginBottom: '24px' }}>
                <p style={{ ...labelStyle, marginBottom: '20px' }}>Personal Information</p>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                    <div
                        style={{
                            width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0,
                            background: avatarSrc ? `url(${avatarSrc}) center/cover` : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                            border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s', position: 'relative',
                        }}
                        className="avatar-circle-hover"
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--prime-orange)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#ccc'}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {!avatarSrc && (
                            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#94a3b8' }}>
                                {(user?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="avatar-overlay">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            </svg>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { setTempImage(e.target.files[0]); e.target.value = ''; } }} />
                    <style>{`.avatar-circle-hover:hover .avatar-overlay { opacity: 1 !important; }`}</style>
                    <div>
                        <p style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', fontSize: '0.95rem' }}>Profile Photo</p>
                        <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>Click the photo to upload a new one. JPG, PNG or WebP, max 5MB.</p>
                    </div>
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input type="text" style={inputStyle} value={form.name}
                            onChange={e => { setForm(p => ({ ...p, name: e.target.value })); validateField('name', e.target.value); }}
                            onFocus={focusIn} onBlur={e => { focusOut(e); validateField('name', e.target.value); }} />
                        {errors.name && <span style={errorStyle}>{errors.name}</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Email *</label>
                            <input type="email" style={inputStyle} value={form.email}
                                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); validateField('email', e.target.value); }}
                                onFocus={focusIn} onBlur={e => { focusOut(e); validateField('email', e.target.value); }} />
                            {errors.email && <span style={errorStyle}>{errors.email}</span>}
                        </div>
                        <div>
                            <label style={labelStyle}>Phone *</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', left: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 600, color: '#555', pointerEvents: 'none' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🇮🇳</span>
                                    <span>+91</span>
                                    <div style={{ width: '1.5px', height: '18px', background: '#e0e0e0', marginLeft: '2px' }} />
                                </div>
                                <input type="tel" style={{ ...inputStyle, paddingLeft: '92px' }}
                                    value={form.phone}
                                    onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(p => ({ ...p, phone: v })); validateField('phone', v); }}
                                    onFocus={focusIn} onBlur={e => { focusOut(e); validateField('phone', e.target.value); }} />
                            </div>
                            {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSaveProfile} disabled={isSaving} style={{ padding: '13px 28px', borderRadius: '14px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Password Card */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPwdSection ? '24px' : '0' }}>
                    <div>
                        <p style={{ ...labelStyle, marginBottom: '2px' }}>Password</p>
                        <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>Change your account password</p>
                    </div>
                    <button onClick={() => { setShowPwdSection(p => !p); setPwd({ current: '', newPwd: '' }); setPwdErrors({}); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1.5px solid #f0f0f2', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: showPwdSection ? 'var(--prime-orange)' : '#555', transition: 'all 0.2s' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        {showPwdSection ? 'Cancel' : 'Change Password'}
                    </button>
                </div>

                {showPwdSection && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Current Password */}
                        <div>
                            <label style={labelStyle}>Current Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showCurrent ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '44px' }}
                                    value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                                    onFocus={focusIn} onBlur={focusOut} placeholder="Enter current password" />
                                <button type="button" onClick={() => setShowCurrent(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}>
                                    {showCurrent ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                                </button>
                            </div>
                            {pwdErrors.current && <span style={errorStyle}>{pwdErrors.current}</span>}
                        </div>

                        {/* New Password */}
                        <div>
                            <label style={labelStyle}>New Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showNew ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '44px' }}
                                    value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                                    onFocus={focusIn} onBlur={focusOut} placeholder="Enter new password" />
                                <button type="button" onClick={() => setShowNew(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}>
                                    {showNew ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                                </button>
                            </div>
                            {pwdErrors.newPwd && <span style={errorStyle}>{pwdErrors.newPwd}</span>}
                            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                {pwdRules.map(r => {
                                    const ok = r.test(pwd.newPwd);
                                    return (
                                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: ok ? '#10b981' : '#aaa', fontWeight: ok ? 600 : 500, transition: 'color 0.3s' }}>
                                            {ok ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /></svg>}
                                            {r.text}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={handleChangePassword} disabled={isSaving} style={{ padding: '13px 28px', borderRadius: '14px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer' }}>
                                {isSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ImageCropperModal
                isOpen={!!tempImage}
                imageFile={tempImage}
                onApply={f => { setProfilePicFile(f); setTempImage(null); }}
                onCancel={() => setTempImage(null)}
            />
        </motion.div>
    );
};

export default MyProfile;
