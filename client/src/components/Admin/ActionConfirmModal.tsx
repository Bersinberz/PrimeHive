import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ActionConfirmType = 'activate' | 'deactivate' | 'delete' | 'delete_product';

interface ActionConfirmModalProps {
  isOpen: boolean;
  actionType: ActionConfirmType | null;
  itemName: string;
  itemImage?: string; // Optional image for product deletion
  onConfirm: () => void;
  onCancel: () => void;
}

const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({ 
  isOpen, 
  actionType, 
  itemName, 
  itemImage, 
  onConfirm, 
  onCancel 
}) => {
  const getModalConfig = () => {
    switch (actionType) {
      case 'deactivate':
        return {
          title: 'Deactivate Account?',
          desc: `Are you sure you want to temporarily suspend`,
          strongText: itemName,
          descEnd: `? They will not be able to log in.`,
          btnText: 'Yes, Deactivate',
          btnGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          btnShadow: '0 4px 16px rgba(245, 158, 11, 0.25)',
          iconColor: '#f59e0b',
          iconBg: 'rgba(245, 158, 11, 0.08)',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )
        };

      case 'activate':
        return {
          title: 'Activate Account?',
          desc: `Are you sure you want to restore full access for`,
          strongText: itemName,
          descEnd: `?`,
          btnText: 'Yes, Activate',
          btnGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          btnShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
          iconColor: '#10b981',
          iconBg: 'rgba(16, 185, 129, 0.08)',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )
        };
      case 'delete':
        return {
          title: 'Delete User?',
          desc: `Are you sure you want to permanently remove`,
          strongText: itemName,
          descEnd: `? This cannot be undone.`,
          btnText: 'Yes, Delete',
          btnGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          btnShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
          iconColor: '#ef4444',
          iconBg: 'rgba(239, 68, 68, 0.08)',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          )
        };
      case 'delete_product':
        return {
          title: 'Delete Product?',
          desc: `Are you sure you want to permanently remove`,
          strongText: itemName,
          descEnd: `? This cannot be undone.`,
          btnText: 'Yes, Delete',
          btnGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          btnShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
          iconColor: '#ef4444',
          iconBg: 'rgba(239, 68, 68, 0.08)',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          )
        };
      default:
        return null;
    }
  };

  const config = getModalConfig();

  return (
    <AnimatePresence>
      {isOpen && config && (
        <motion.div
          className="glass-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass-modal text-center"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Conditional Thumbnail Rendering for Products */}
            {actionType === 'delete_product' && itemImage ? (
              <div style={{ width: '72px', height: '72px', borderRadius: '18px', overflow: 'hidden', margin: '0 auto 20px', border: '2px solid #f0f0f2' }}>
                <img src={itemImage} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: config.iconBg, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {config.icon}
              </div>
            )}

            <h4 style={{ fontWeight: 900, color: '#1a1a1a', marginBottom: '8px', fontSize: '1.25rem' }}>
              {config.title}
            </h4>
            <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '28px' }}>
              {config.desc}<br />
              <strong style={{ color: '#1a1a1a' }}>{config.strongText}</strong>{config.descEnd}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  border: '1.5px solid #e8e8e8',
                  background: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: '#555',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <motion.button
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98, x: [0, -3, 3, -3, 0] }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: config.btnGradient,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: config.btnShadow,
                }}
              >
                {config.btnText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionConfirmModal;
