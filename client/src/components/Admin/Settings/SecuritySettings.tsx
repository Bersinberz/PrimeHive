import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { focusHandlers, inputStyle, labelStyle, pageVariants } from './settingsStyles';

interface SecuritySettingsProps {
    isSaving: boolean;
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ isSaving, onChangePassword }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (passwords.newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        await onChangePassword(passwords.currentPassword, passwords.newPassword);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

            {/* Change Password */}
            <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '4px' }}>Change Password</h5>
                <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>Update your admin password</p>
                <div style={{ height: '1px', background: '#f0f0f2', marginTop: '16px' }} />
            </div>

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
                            type="password"
                            style={inputStyle}
                            value={passwords.currentPassword}
                            onChange={e => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            {...focusHandlers}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <input
                                type="password"
                                style={inputStyle}
                                value={passwords.newPassword}
                                onChange={e => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                required
                                minLength={6}
                                {...focusHandlers}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input
                                type="password"
                                style={inputStyle}
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                                minLength={6}
                                {...focusHandlers}
                            />
                        </div>
                    </div>
                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f2' }}>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="new-product-btn"
                            style={{ width: 'auto' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Update Password
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default SecuritySettings;
