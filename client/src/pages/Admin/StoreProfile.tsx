import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, FileText, Save, CheckCircle } from 'lucide-react';
import { getStoreProfile, updateStoreProfile } from '../../services/admin/storeProfileService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid #f0f0f2', background: '#fafafa',
    fontSize: '0.92rem', fontWeight: 600, color: '#1a1a1a',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
};
const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--prime-orange)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
    e.currentTarget.style.background = '#fff';
};
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#f0f0f2';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = '#fafafa';
};

const StoreProfilePage: React.FC = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        storeName: '',
        storeDescription: '',
        storeLocation: '',
        storePhone: '',
    });

    useEffect(() => {
        getStoreProfile()
            .then(data => setForm({
                storeName:        data.storeName        || '',
                storeDescription: data.storeDescription || '',
                storeLocation:    data.storeLocation    || '',
                storePhone:       data.storePhone       || '',
            }))
            .catch(() => showToast({ type: 'error', title: 'Load failed', message: 'Could not load your store profile.' }))
            .finally(() => setIsLoading(false));
    }, []);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.storeName.trim() || form.storeName.trim().length < 2)
            errs.storeName = 'Store name must be at least 2 characters.';
        if (form.storeDescription.length > 500)
            errs.storeDescription = 'Description must be under 500 characters.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            await updateStoreProfile(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            showToast({ type: 'success', title: 'Store profile saved', message: 'Your store details have been updated.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Save failed', message: err?.response?.data?.message || 'Something went wrong.' });
        } finally {
            setIsSaving(false);
        }
    };

    const field = (key: keyof typeof form, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 40 }}>
            <PrimeLoader isLoading={isLoading || isSaving} />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', margin: '0 0 6px' }}>Store Profile</h2>
                        <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                            Your store details shown to customers on product pages
                        </p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '12px 28px', borderRadius: 14, border: 'none',
                            background: saved ? '#10b981' : 'linear-gradient(135deg,#ff6b35,#ff8c42)',
                            color: '#fff', fontWeight: 800, fontSize: '0.92rem',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'background 0.3s', flexShrink: 0,
                        }}
                    >
                        {saved ? <><CheckCircle size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
                    </motion.button>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                {/* Left: Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Store Identity */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,140,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Store size={18} color="var(--prime-orange)" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>Store Identity</h5>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa' }}>Name and description shown on product pages</p>
                            </div>
                        </div>
                        <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />

                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Store Name *</label>
                            <input
                                style={{ ...inputStyle, borderColor: errors.storeName ? '#ef4444' : '#f0f0f2' }}
                                value={form.storeName}
                                onChange={e => field('storeName', e.target.value)}
                                onFocus={focusIn} onBlur={focusOut}
                                placeholder="e.g. TechZone Store"
                                maxLength={100}
                            />
                            {errors.storeName && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: 4, display: 'block' }}>{errors.storeName}</span>}
                        </div>

                        <div>
                            <label style={labelStyle}>Store Description</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' } as React.CSSProperties}
                                value={form.storeDescription}
                                onChange={e => field('storeDescription', e.target.value)}
                                onFocus={focusIn as any} onBlur={focusOut as any}
                                placeholder="Tell customers what your store is about…"
                                maxLength={500}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                {errors.storeDescription
                                    ? <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>{errors.storeDescription}</span>
                                    : <span />
                                }
                                <span style={{ fontSize: '0.72rem', color: '#bbb' }}>{form.storeDescription.length}/500</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={18} color="#6366f1" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>Contact & Location</h5>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa' }}>Optional details for customer reference</p>
                            </div>
                        </div>
                        <div style={{ height: 1, background: '#f0f0f2', marginBottom: 20 }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Store Phone</label>
                                <input
                                    style={inputStyle}
                                    value={form.storePhone}
                                    onChange={e => field('storePhone', e.target.value)}
                                    onFocus={focusIn} onBlur={focusOut}
                                    placeholder="+91 98765 43210"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Store Location</label>
                                <input
                                    style={inputStyle}
                                    value={form.storeLocation}
                                    onChange={e => field('storeLocation', e.target.value)}
                                    onFocus={focusIn} onBlur={focusOut}
                                    placeholder="e.g. Mumbai, Maharashtra"
                                    maxLength={200}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Preview card */}
                <div style={{ position: 'sticky', top: 24 }}>
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: 24 }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 16px' }}>Preview</p>
                        <p style={{ fontSize: '0.72rem', color: '#aaa', margin: '0 0 12px' }}>How it appears on product pages</p>

                        {/* Sold by badge preview */}
                        <div style={{ background: '#f8f9ff', border: '1px solid #e8eaff', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Store size={14} color="#6366f1" strokeWidth={2.5} />
                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>Sold by</span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1a1a1a' }}>
                                    {form.storeName || 'Your Store Name'}
                                </span>
                            </div>
                            {form.storeLocation && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                    <MapPin size={12} color="#aaa" strokeWidth={2} />
                                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{form.storeLocation}</span>
                                </div>
                            )}
                        </div>

                        {form.storeDescription && (
                            <div style={{ background: '#fafafa', borderRadius: 10, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <FileText size={12} color="#aaa" strokeWidth={2} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>{form.storeDescription}</p>
                            </div>
                        )}

                        {!form.storeName && !form.storeDescription && (
                            <p style={{ fontSize: '0.82rem', color: '#ccc', textAlign: 'center', margin: '20px 0' }}>
                                Fill in your store details to see a preview
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StoreProfilePage;
