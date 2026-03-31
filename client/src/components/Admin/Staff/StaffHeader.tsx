import React from 'react';
import { motion } from 'framer-motion';
import type { Staff } from '../../../services/Admin/staffService';

interface StaffHeader {
    staffList: Staff[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    onAddClick: () => void;
}

const StaffHeader: React.FC<StaffHeader> = ({ staffList, searchQuery, setSearchQuery, onAddClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="command-bar"
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
                        Staff
                    </h2>
                    <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0' }}>
                        Manage your store's staff members and their access
                    </p>
                </div>
                <button className="new-product-btn" onClick={onAddClick}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Staff
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div className="search-input-wrapper">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                    <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                        <span className="stat-dot" style={{ background: '#6366f1' }} />
                        <span className="stat-count">{staffList.length}</span>
                        Total
                    </motion.div>
                    <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                        <span className="stat-dot" style={{ background: '#10b981' }} />
                        <span className="stat-count">{staffList.filter(s => s.status === 'active').length}</span>
                        Active
                    </motion.div>
                    <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
                        <span className="stat-dot" style={{ background: '#f59e0b' }} />
                        <span className="stat-count">{staffList.filter(s => s.status === 'inactive').length}</span>
                        Inactive
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default StaffHeader;
