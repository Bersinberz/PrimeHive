import React from 'react';
import { motion } from 'framer-motion';

interface SettingsHeaderProps {
    isSaving: boolean;
    onSave: () => void;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ isSaving, onSave }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="command-bar"
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                        Settings
                    </h2>
                    <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0' }}>
                        Manage your store preferences, taxes, and security
                    </p>
                </div>
                <button className="new-product-btn" onClick={onSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default SettingsHeader;
