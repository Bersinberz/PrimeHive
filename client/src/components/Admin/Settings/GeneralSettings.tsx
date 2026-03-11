import React from 'react';
import { motion } from 'framer-motion';
import { focusHandlers, inputStyle, labelStyle, pageVariants } from './settingsStyles';

interface GeneralSettingsProps {
    form: {
        storeName: string;
        supportEmail: string;
        orderIdPrefix: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ form, onInputChange }) => {
    return (
        <motion.div key="general" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.2rem', marginBottom: '4px' }}>Store Details</h4>
                <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>Basic information about your store</p>
                <div style={{ height: '1px', background: '#f0f0f2', marginTop: '16px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                    <label style={labelStyle}>Store Name *</label>
                    <input
                        type="text"
                        name="storeName"
                        style={inputStyle}
                        value={form.storeName}
                        onChange={onInputChange}
                        placeholder="e.g. PrimeHive Electronics"
                        {...focusHandlers}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Support Email *</label>
                    <input
                        type="email"
                        name="supportEmail"
                        style={inputStyle}
                        value={form.supportEmail}
                        onChange={onInputChange}
                        placeholder="support@yourstore.com"
                        {...focusHandlers}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Store Currency</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            style={{ ...inputStyle, cursor: 'not-allowed', color: '#888' }}
                            value="INR (₹) — Indian Rupee"
                            readOnly
                        />
                        <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.08)',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            Locked
                        </span>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Timezone</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            style={{ ...inputStyle, cursor: 'not-allowed', color: '#888' }}
                            value="IST — Asia/Kolkata (UTC +5:30)"
                            readOnly
                        />
                        <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.08)',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            Locked
                        </span>
                    </div>
                </div>
            </div>

            {/* Order ID Prefix */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f2' }}>
                <label style={labelStyle}>Order ID Prefix</label>
                <input
                    type="text"
                    name="orderIdPrefix"
                    style={{ ...inputStyle, maxWidth: '280px' }}
                    value={form.orderIdPrefix}
                    onChange={onInputChange}
                    placeholder="ORD-"
                    {...focusHandlers}
                />
                <p style={{ fontSize: '0.78rem', color: '#bbb', marginTop: '8px' }}>
                    Example: <strong style={{ color: '#888' }}>{form.orderIdPrefix || 'ORD-'}1001</strong>, <strong style={{ color: '#888' }}>{form.orderIdPrefix || 'ORD-'}1002</strong>
                </p>
            </div>
        </motion.div>
    );
};

export default GeneralSettings;
