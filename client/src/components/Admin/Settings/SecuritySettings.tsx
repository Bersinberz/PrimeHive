import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { focusHandlers, inputStyle, labelStyle, pageVariants } from './settingsStyles';

interface SecuritySettingsProps {
    isSaving: boolean;
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const pwdRules = [
    { id: 'length',    text: 'At least 6 characters',  test: (v: string) => v.length >= 6 },
    { id: 'noSpaces',  text: 'No spaces',               test: (v: string) => v.length > 0 && !/\s/.test(v) },
    { id: 'uppercase', text: 'One uppercase letter',    test: (v: string) => /[A-Z]/.test(v) },
    { id: 'lowercase', text: 'One lowercase letter',    test: (v: string) => /[a-z]/.test(v) },
    { id: 'number',    text: 'One number',              test: (v: string) => /[0-9]/.test(v) },
    { id: 'special',   text: 'One special character',   test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ isSaving, onChangePassword }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [changePassword, setChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        
        const pwdValid = pwdRules.every(r => r.test(passwords.newPassword));
        if (!pwdValid) {
            setError('Please meet all password requirements.');
            return;
        }

        await onChangePassword(passwords.currentPassword, passwords.newPassword);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setChangePassword(false);
    };

    return (
        <motion.div key="security" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.2rem', marginBottom: '4px' }}>Admin Profile</h4>
                <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>Your account and security settings</p>
                <div style={{ height: '1px', background: '#f0f0f2', marginTop: '16px' }} />
            </div>

            {/* Profile Card */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #f0f0f2',
                background: '#fafafa',
                marginBottom: '36px',
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff8c42 0%, #ff5722 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    flexShrink: 0,
                }}>
                    SA
                </div>
                <div>
                    <h6 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', margin: '0 0 4px' }}>Super Admin</h6>
                    <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.08)',
                        padding: '3px 10px',
                        borderRadius: '20px',
                    }}>
                        superadmin
                    </span>
                </div>
            </div>

            {/* Change Password Lock Toggle */}
            <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '4px' }}>Change Password</h5>
                <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>Update your admin password</p>
                <div style={{ height: '1px', background: '#f0f0f2', marginTop: '16px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <button
                    type="button"
                    onClick={() => {
                        setChangePassword(!changePassword);
                        setError('');
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: '1.5px solid #f0f0f2',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: changePassword ? '#ff5722' : '#555',
                        transition: 'all 0.2s'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {changePassword ? 'Cancel password change' : 'Change password'}
                </button>
            </div>

            <AnimatePresence>
                {changePassword && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.06)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '20px',
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                                <div>
                                    <label style={labelStyle}>Current Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        style={inputStyle}
                                        value={passwords.currentPassword}
                                        onChange={e => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                        {...focusHandlers}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', position: 'relative' }}>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                style={{ ...inputStyle, paddingRight: '44px' }}
                                                value={passwords.newPassword}
                                                onChange={e => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                                required
                                                {...focusHandlers}
                                            />
                                            <button
                                                type="button"
                                                style={{
                                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                    color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm New Password</label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            style={inputStyle}
                                            value={passwords.confirmPassword}
                                            onChange={e => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            required
                                            {...focusHandlers}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: '8px' }}>
                                    {pwdRules.map(rule => {
                                        const isValid = rule.test(passwords.newPassword);
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

                                <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f2' }}>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="new-product-btn"
                                        style={{ width: 'auto' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SecuritySettings;
