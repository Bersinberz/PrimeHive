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
    const avatarSrc = form.profilePicture ? URL.createObjectURL(form.profilePicture) : form.existingProfilePicture || null;

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
                    style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', border: '1px solid #f0f0f2' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0 }}>
                                Edit Customer Details
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.9rem', fontWeight: 500, margin: '4px 0 0 0' }}>
                                Update personal information
                            </p>
                        </div>
                        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#999', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.color = '#999'}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} noValidate>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Circular Avatar Uploader */}
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
                                            // Reset value so same file can be selected again
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <style>{`
                                .avatar-circle-hover:hover .avatar-overlay { opacity: 1 !important; }
                            `}</style>
                            </div>

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
                            <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f2', display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={onBack} disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #e8e8e8', background: '#fff', fontWeight: 700, fontSize: '0.92rem', color: '#555', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
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

export default CustomerForm;
