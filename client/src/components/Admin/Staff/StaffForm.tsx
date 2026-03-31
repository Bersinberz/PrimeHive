import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropperModal from '../ImageCropperModal';
import { useAuth } from '../../../context/AuthContext';
import type { Permissions } from '../../../services/authService';

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
    color: '#e74c3c', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', display: 'block'
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

const permissionModules: { key: keyof Permissions; label: string; actions: { key: string; label: string }[] }[] = [
    { key: 'dashboard',  label: 'Dashboard',  actions: [{ key: 'view', label: 'View' }] },
    { key: 'products',   label: 'Products',   actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    { key: 'categories', label: 'Categories', actions: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    { key: 'orders',     label: 'Orders',     actions: [{ key: 'view', label: 'View' }, { key: 'updateStatus', label: 'Update Status' }] },
    { key: 'customers',  label: 'Customers',  actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
];

const DEFAULT_PERMISSIONS: Permissions = {
    dashboard:  { view: true },
    products:   { view: true,  create: false, edit: false, delete: false },
    categories: { view: true,  create: false, edit: false, delete: false },
    orders:     { view: true,  updateStatus: false },
    customers:  { view: true,  edit: false, delete: false },
    staff:      { view: false, create: false, edit: false, delete: false },
    settings:   { view: false, edit: false },
};

interface StaffFormProps {
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    isSaving: boolean;
    isEdit?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ form, setForm, isSaving, isEdit = false, onSubmit, onBack }) => {
    const [tempImage, setTempImage] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'superadmin';
    const avatarSrc = form.profilePicture ? URL.createObjectURL(form.profilePicture) : form.existingProfilePicture || null;

    // Ensure permissions are initialized when form is first rendered
    React.useEffect(() => {
        if (isSuperAdmin && !form.permissions) {
            setForm((p: any) => ({ ...p, permissions: DEFAULT_PERMISSIONS }));
        }
    }, []);

    // For new staff: use form.password; for edit: use form.newPassword
    const pwd = isEdit ? (form.newPassword || '') : (form.password || '');
    const pwdAllValid = pwdRules.every(r => r.test(pwd));

    const validateField = (field: string, value: string) => {
        let error = '';
        if (field === 'name') {
            if (!value || value.trim().length < 3 || !/^[A-Za-z\s]+$/.test(value.trim())) {
                error = 'Name must be at least 3 characters and contain only letters.';
            }
        } else if (field === 'email') {
            if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                error = 'Please enter a valid email address.';
            }
        } else if (field === 'phone') {
            const cleanPhone = value ? value.replace(/\D/g, '').slice(0, 10) : '';
            if (!cleanPhone || !/^[0-9]{10}$/.test(cleanPhone)) {
                error = 'Phone number must be exactly 10 digits.';
            }
        } else if (field === 'newPassword' && isEdit && changePassword) {
            if (!pwdRules.every(r => r.test(value))) {
                error = 'Please meet all password requirements.';
            }
        } else if (field === 'dateOfBirth') {
            if (value && new Date(value) > new Date()) {
                error = 'Date of birth cannot be in the future.';
            }
        }
        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field] = error;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    const handleBlur = (field: string) => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        focusHandlers.onBlur(e);
        validateField(field, e.target.value);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name || form.name.trim().length < 3 || !/^[A-Za-z\s]+$/.test(form.name.trim())) {
            newErrors.name = 'Name must be at least 3 characters and contain only letters.';
        }
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = 'Please enter a valid email address.';
        }
        const cleanPhone = form.phone ? form.phone.replace(/\D/g, '').slice(-10) : '';
        if (!cleanPhone || !/^[0-9]{10}$/.test(cleanPhone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits.';
        }
        if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
        }
        if (isEdit && changePassword) {
            if (!pwdAllValid) newErrors.newPassword = 'Please meet all password requirements.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(e);
        }
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0 }}>
                                {isEdit ? 'Edit Staff Member' : 'New Staff Member'}
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.9rem', fontWeight: 500, margin: '4px 0 0 0' }}>
                                {isEdit ? 'Update staff-level access account' : 'Create an admin account'}
                            </p>
                        </div>
                        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#999', transition: 'color 0.2s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.color = '#999'}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        {/* Scrollable Body */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Circular Avatar Uploader */}
                            {isEdit && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                                    <div
                                        style={{
                                            position: 'relative', width: '90px', height: '90px', borderRadius: '50%',
                                            background: avatarSrc ? `url(${avatarSrc}) center/cover` : '#f0f0f2',
                                            border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--prime-orange)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#ccc'}
                                        onClick={() => document.getElementById('profilePicUpload')?.click()}
                                        className="avatar-circle-hover"
                                    >
                                        {!avatarSrc && (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                        )}
                                        {avatarSrc && (
                                            <div style={{
                                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: 0, transition: 'opacity 0.2s'
                                            }} className="avatar-overlay">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="profilePicUpload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setTempImage(e.target.files[0]);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <style>{`
                                    .avatar-circle-hover:hover .avatar-overlay { opacity: 1 !important; }
                                `}</style>
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>Full Name *</label>
                                <input type="text" style={inputStyle} value={form.name || ''} onChange={e => { const val = e.target.value; setForm((p: any) => ({ ...p, name: val })); validateField('name', val); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('name')} />
                                {errors.name && <span style={errorStyle}>{errors.name}</span>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input type="email" style={inputStyle} value={form.email || ''} onChange={e => { const val = e.target.value; setForm((p: any) => ({ ...p, email: val })); validateField('email', val); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('email')} />
                                    {errors.email && <span style={errorStyle}>{errors.email}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone *</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            position: 'absolute', left: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                            fontSize: '0.92rem', fontWeight: 600, color: '#555', pointerEvents: 'none'
                                        }}>
                                            <span style={{ fontSize: '1.1rem' }}>🇮🇳</span>
                                            <span>+91</span>
                                            <div style={{ width: '1.5px', height: '18px', background: '#e0e0e0', marginLeft: '2px' }} />
                                        </div>
                                        <input
                                            type="tel"
                                            style={{ ...inputStyle, paddingLeft: '92px' }}
                                            value={form.phone ? form.phone.replace(/^\+?91/, '') : ''}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setForm((p: any) => ({ ...p, phone: val ? `+91${val}` : '' }));
                                                validateField('phone', val);
                                            }}
                                            onFocus={focusHandlers.onFocus} onBlur={handleBlur('phone')}
                                        />
                                    </div>
                                    {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Date of Birth</label>
                                    <input type="date" style={inputStyle} value={form.dateOfBirth || ''} onChange={e => { const val = e.target.value; setForm((p: any) => ({ ...p, dateOfBirth: val })); validateField('dateOfBirth', val); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('dateOfBirth')} />
                                    {errors.dateOfBirth && <span style={errorStyle}>{errors.dateOfBirth}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Gender</label>
                                    <select style={inputStyle} value={form.gender || ''} onChange={e => { const val = e.target.value; setForm((p: any) => ({ ...p, gender: val })); validateField('gender', val); }} onFocus={focusHandlers.onFocus} onBlur={handleBlur('gender')}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                    {errors.gender && <span style={errorStyle}>{errors.gender}</span>}
                                </div>
                            </div>
                            {/* Permissions section — superadmin only */}
                            {isSuperAdmin && (
                                <div style={{ borderTop: '1px solid #f0f0f2', paddingTop: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <p style={{ ...labelStyle, marginBottom: '2px' }}>Permissions</p>
                                            <p style={{ fontSize: '0.78rem', color: '#bbb', fontWeight: 500, margin: 0 }}>Control what this staff member can access</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {permissionModules.map(mod => (
                                            <div key={mod.key} style={{ background: '#fafafa', borderRadius: '12px', border: '1.5px solid #f0f0f2', padding: '12px 16px' }}>
                                                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px 0' }}>{mod.label}</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                                                    {mod.actions.map(action => {
                                                        const checked = !!(form.permissions?.[mod.key] as any)?.[action.key];
                                                        return (
                                                            <label key={action.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: checked ? '#1a1a1a' : '#aaa', transition: 'color 0.2s' }}>
                                                                <div
                                                                    onClick={() => {
                                                                        setForm((p: any) => ({
                                                                            ...p,
                                                                            permissions: {
                                                                                ...p.permissions,
                                                                                [mod.key]: {
                                                                                    ...(p.permissions?.[mod.key] || {}),
                                                                                    [action.key]: !checked,
                                                                                }
                                                                            }
                                                                        }));
                                                                    }}
                                                                    style={{
                                                                        width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                                                                        border: `2px solid ${checked ? 'var(--prime-orange)' : '#ddd'}`,
                                                                        background: checked ? 'var(--prime-orange)' : '#fff',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        transition: 'all 0.15s', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                                                </div>
                                                                {action.label}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* New staff: password setup info */}
                            {!isEdit && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px 18px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <div>
                                        <p style={{ margin: '0 0 4px', fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>Password setup via email</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534', lineHeight: 1.5 }}>
                                            A secure setup link will be emailed to the staff member. They'll set their own password — no password is shared here.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Edit staff: change password toggle */}
                            {isEdit && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => { setChangePassword(v => !v); setForm((p: any) => ({ ...p, newPassword: '' })); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1.5px solid #f0f0f2', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: changePassword ? 'var(--prime-orange)' : '#555', transition: 'all 0.2s' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        {changePassword ? 'Cancel password change' : 'Change password'}
                                    </button>
                                    <AnimatePresence>
                                        {changePassword && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ paddingTop: '16px' }}>
                                                    <label style={labelStyle}>New Password *</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            style={{ ...inputStyle, paddingRight: '44px' }}
                                                            value={form.newPassword || ''}
                                                            onChange={e => { const val = e.target.value; setForm((p: any) => ({ ...p, newPassword: val })); validateField('newPassword', val); }}
                                                            onFocus={focusHandlers.onFocus}
                                                            onBlur={handleBlur('newPassword')}
                                                            placeholder="Enter new password"
                                                        />
                                                        <button type="button" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPassword(v => !v)}>
                                                            {showPassword ? (
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                            ) : (
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                                        {pwdRules.map(rule => {
                                                            const isValid = rule.test(form.newPassword || '');
                                                            return (
                                                                <div key={rule.id} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: isValid ? '#10b981' : '#aaa', fontWeight: isValid ? 600 : 500, transition: 'color 0.3s' }}>
                                                                    {isValid ? (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                    ) : (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle></svg>
                                                                    )}
                                                                    {rule.text}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors.newPassword && <span style={errorStyle}>{errors.newPassword}</span>}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                        </div>

                        {/* Fixed Footer */}
                        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #f0f0f2', display: 'flex', gap: '12px', flexShrink: 0 }}>
                            <button type="button" onClick={onBack} disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #e8e8e8', background: '#fff', fontWeight: 700, fontSize: '0.92rem', color: '#555', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {isEdit ? (
                                        <>
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </>
                                    ) : (
                                        <>
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <line x1="20" y1="8" x2="20" y2="14" />
                                            <line x1="23" y1="11" x2="17" y2="11" />
                                        </>
                                    )}
                                </svg>
                                {isSaving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Staff')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>

            <ImageCropperModal
                isOpen={!!tempImage}
                imageFile={tempImage}
                onApply={(croppedFile) => {
                    setForm((p: any) => ({ ...p, profilePicture: croppedFile }));
                    setTempImage(null);
                }}
                onCancel={() => setTempImage(null)}
            />
        </AnimatePresence>
    );
};

export default StaffForm;
