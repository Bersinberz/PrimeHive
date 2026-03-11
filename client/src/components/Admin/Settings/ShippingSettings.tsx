import React from 'react';
import { motion } from 'framer-motion';
import { inputStyle, labelStyle, focusHandlers, pageVariants } from './settingsStyles';

interface ShippingSettingsProps {
    form: {
        standardShippingRate: number;
        freeShippingThreshold: number;
        taxRate: number;
        taxInclusive: boolean;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ShippingSettings: React.FC<ShippingSettingsProps> = ({ form, onInputChange }) => {
    return (
        <motion.div key="shipping" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.2rem', marginBottom: '4px' }}>Shipping & Taxes</h4>
                <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>Configure delivery rates and GST settings</p>
                <div style={{ height: '1px', background: '#f0f0f2', marginTop: '16px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                    <label style={labelStyle}>Standard Shipping Rate</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontWeight: 800,
                            color: '#aaa',
                            fontSize: '0.95rem',
                        }}>₹</span>
                        <input
                            type="number"
                            name="standardShippingRate"
                            style={{ ...inputStyle, paddingLeft: '36px' }}
                            value={form.standardShippingRate}
                            onChange={onInputChange}
                            min={0}
                            {...focusHandlers}
                        />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Free Shipping Threshold</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontWeight: 800,
                            color: '#aaa',
                            fontSize: '0.95rem',
                        }}>₹</span>
                        <input
                            type="number"
                            name="freeShippingThreshold"
                            style={{ ...inputStyle, paddingLeft: '36px' }}
                            value={form.freeShippingThreshold}
                            onChange={onInputChange}
                            min={0}
                            {...focusHandlers}
                        />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#bbb', marginTop: '8px' }}>
                        Orders above <strong style={{ color: '#888' }}>₹{form.freeShippingThreshold}</strong> get free shipping
                    </p>
                </div>
            </div>

            {/* Tax Config */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f2' }}>
                <h5 style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1rem', marginBottom: '20px' }}>Tax Configuration</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                    <div>
                        <label style={labelStyle}>Default GST Rate (%)</label>
                        <input
                            type="number"
                            name="taxRate"
                            style={{ ...inputStyle, maxWidth: '200px' }}
                            value={form.taxRate}
                            onChange={onInputChange}
                            min={0}
                            max={100}
                            step={0.5}
                            {...focusHandlers}
                        />
                        <p style={{ fontSize: '0.78rem', color: '#bbb', marginTop: '8px' }}>Applied to all products by default</p>
                    </div>
                    <div style={{ paddingTop: '28px' }}>
                        <label
                            htmlFor="taxInclusive"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                cursor: 'pointer',
                                padding: '16px 20px',
                                borderRadius: '14px',
                                border: `1.5px solid ${form.taxInclusive ? 'var(--prime-orange)' : '#f0f0f2'}`,
                                background: form.taxInclusive ? 'rgba(255, 140, 66, 0.04)' : '#fafafa',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                background: form.taxInclusive ? 'var(--prime-orange)' : '#ddd',
                                position: 'relative',
                                transition: 'background 0.2s',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    position: 'absolute',
                                    top: '3px',
                                    left: form.taxInclusive ? '23px' : '3px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                }} />
                            </div>
                            <input
                                type="checkbox"
                                id="taxInclusive"
                                name="taxInclusive"
                                checked={form.taxInclusive}
                                onChange={onInputChange}
                                style={{ display: 'none' }}
                            />
                            <div>
                                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.88rem' }}>Prices include tax</div>
                                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>GST is included in the listed price</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ShippingSettings;
