import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropperModal from '../ImageCropperModal';

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
const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = 'var(--prime-orange)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = '#f0f0f2';
        e.currentTarget.style.boxShadow = 'none';
    },
};
const pwdRules = [
    { id: 'length',    text: 'At least 6 characters',  test: (v: string) => v.length >= 6 },
    { id: 'noSpaces',  text: 'No spaces',               test: (v: string) => v.length > 0 && !/\s/.test(v) },
    { id: 'uppercase', text: 'One uppercase letter',    test: (v: string) => /[A-Z]/.test(v) },
    { id: 'lowercase', text: 'One lowercase letter',    test: (v: string) => /[a-z]/.test(v) },
    { id: 'number',    text: 'One number',              test: (v: string) => /[0-9]/.test(v) },
    { id: 'special',   text: 'One special character',   test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

interface CustomerFormProps {
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    isSaving: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ form, setForm, isSaving, onSubmit, onBack }) => {
    const [tempImage, setTempImage] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [changePassword, setChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const avatarSrc = form.profilePicture ? URL.createObjectURL(form.profilePicture) : form.existingProfilePicture || null;

    const pwd = form.newPassword || '';
    const pwdAllValid = pwdRules.every(r => r.test(pwd));

    const validateField = (field: string, value: string) => {
        let error = '';
        if (field === 'name' && (!value || value.trim().length < 3 || !/^[A-Za-z\s]+$/.test(value.trim())))
            error = 'Name must be at least 3 characters and contain only letters.';
        else if (field === 'email' && (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())))
            error = 'Please enter a valid email address.';
        else if (field === 'phone') {
            const clean = value ? value.replace(/\D/g, '').slice(0, 10) : '';
            if (!clean || !/^[0-9]{10}$/.test(clean)) error = 'Phone number must be exactly 10 digits.';
        } else if (field === 'dateOfBirth' && value && new Date(value) > new Date())
            error = 'Date of birth cannot be in the future.';
        else if (field === 'newPassword' && changePassword && !pwdAllValid)
            error = 'Please meet all password requirements.';
        setErrors(prev => { const n = { ...prev }; if (error) n[field] = error; else delete n[field]; return n; });
    };

    const handleBlur = (field: string) => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        focusHandlers.onBlur(e);
        validateField(field, e.target.value);
    };

    const validate = () => {
        const next: Record<string, string> = {};
        if (!form.name || form.name.trim().length < 3 || !/^[A-Za-z\s]+$/.test(form.name.trim()))
            next.name = 'Name must be at least 3 characters and contain only letters.';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
            next.email = 'Please enter a valid email address.';
        const clean = form.phone ? form.phone.replace(/\D/g, '').slice(-10) : '';
        if (!clean || !/^[0-9]{10}$/.test(clean)) next.phone = 'Phone number must be exactly 10 digits.';
        if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) next.dateOfBirth = 'Date of birth cannot be in the future.';
        if (changePassword && !pwdAllValid) next.newPassword = 'Please meet all password requirements.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) onSubmit(e);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="glass-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onBack}
                style={{ zIndex: 1000 }}
            >
                <motion.div
                    className="glass-modal"
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '680px',
                        border: '1px solid #f0f0f2', display: 'flex', flexDirection: 'column',
                        maxHeight: '90vh', overflow: 'hidden',
                    }}
                >
                    {/* Fixed Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 20px', borderBottom: '1px solid #f0f0f2', flexShrink: 0 }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0 }}>Edit Customer</h2>
                            <p style={{ color: '#888', fontSize: '0.9rem', fontWeight: 500, margin: '4px 0 0 0' }}>Update personal information</p>
                        </div>
                        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#999', transition: 'color 0.2s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.color = '#999'}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        {/* Scrollable Body */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Avatar */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
                                    <div
                                        style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', background: avatarSrc ? `url(${avatarSrc}) center/cover` : '#f0f0f2', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--prime-orange)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#ccc'}
                                        onClick={() => document.getElementById('custProfilePicUpload')?.click()}
                                        className="avatar-circle-hover"
                                    >
                                        {!avatarSrc && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>}
                                        {avatarSrc && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="avatar-overlay"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></svg></div>}
                                    </div>
                                    <input id="custProfilePicUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { setTempImage(e.target.files[0]); e.target.value = ''; } }} />
                                    <style>{`.avatar-circle-hover:hover .avatar-overlay { opacity: 1 !important; }`}</style>
                                </div>

                                {/* Name */}
                                <div>
                                    <label style={labelStyle}>Full Name *</label>
                                    <input type="text" style={inputStyle} value={form.name || ''} onChange={e => { const v = e.target.value; setForm((p: any) => ({ ...p, name: v })); validateField('name', v); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('name')} />
                                    {errors.name && <span style={errorStyle}>{errors.name}</span>}
                                </div>

                                {/* Email + Phone */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Email *</label>
                                        <input type="email" style={inputStyle} value={form.email || ''} onChange={e => { const v = e.target.value; setForm((p: any) => ({ ...p, email: v })); validateField('email', v); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('email')} />
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
                                            <input type="tel" style={{ ...inputStyle, paddingLeft: '92px' }} value={form.phone ? form.phone.replace(/^\+?91/, '') : ''} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm((p: any) => ({ ...p, phone: v ? `+91${v}` : '' })); validateField('phone', v); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('phone')} />
                                        </div>
                                        {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                                    </div>
                                </div>

                                {/* DOB + Gender */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Date of Birth</label>
                                        <input type="date" style={inputStyle} value={form.dateOfBirth || ''} onChange={e => { const v = e.target.value; setForm((p: any) => ({ ...p, dateOfBirth: v })); validateField('dateOfBirth', v); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('dateOfBirth')} />
                                        {errors.dateOfBirth && <span style={errorStyle}>{errors.dateOfBirth}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Gender</label>
                                        <select style={inputStyle} value={form.gender || ''} onChange={e => setForm((p: any) => ({ ...p, gender: e.target.value }))} onFocus={focusHandlers.onFocus} onBlur={focusHandlers.onBlur}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Change Password Toggle */}
                                <div style={{ borderTop: '1px solid #f0f0f2', paddingTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setChangePassword(p => !p); setForm((p: any) => ({ ...p, newPassword: '' })); setErrors(e => { const n = { ...e }; delete n.newPassword; return n; }); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1.5px solid #f0f0f2', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: changePassword ? 'var(--prime-orange)' : '#555', transition: 'all 0.2s' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        {changePassword ? 'Cancel password change' : 'Change password'}
                                    </button>

                                    <AnimatePresence>
                                        {changePassword && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ paddingTop: '16px' }}>
                                                    <label style={labelStyle}>New Password *</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            style={{ ...inputStyle, paddingRight: '44px' }}
                                                            value={pwd}
                                                            placeholder="Enter new password"
                                                            onChange={e => { const v = e.target.value; setForm((p: any) => ({ ...p, newPassword: v })); validateField('newPassword', v); }}
                                                            onFocus={focusHandlers.onFocus}
                                                            onBlur={handleBlur('newPassword')}
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999', display: 'flex', alignItems: 'center' }}>
                                                            {showPassword
                                                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                            }
                                                        </button>
                                                    </div>
                                                    {errors.newPassword && <span style={errorStyle}>{errors.newPassword}</span>}
                                                    <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                                        {pwdRules.map(r => {
                                                            const ok = r.test(pwd);
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
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #f0f0f2', display: 'flex', gap: '12px', flexShrink: 0 }}>
                            <button type="button" onClick={onBack} disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #e8e8e8', background: '#fff', fontWeight: 700, fontSize: '0.92rem', color: '#555', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>

            <ImageCropperModal
                isOpen={!!tempImage}
                imageFile={tempImage}
                onApply={(croppedFile) => { setForm((p: any) => ({ ...p, profilePicture: croppedFile })); setTempImage(null); }}
                onCancel={() => setTempImage(null)}
            />
        </AnimatePresence>
    );
};

export default CustomerForm;
