import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Lock, Trash2, Unlock } from 'lucide-react';

export type ActionConfirmType = 'activate' | 'deactivate' | 'delete' | 'delete_product' | 'hard_delete';

interface ActionConfirmModalProps {
  isOpen: boolean;
  actionType: ActionConfirmType | null;
  itemName: string;
  itemImage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ModalConfig {
  title: string;
  body: React.ReactNode;
  confirmText: string;
  confirmColor: string;
  confirmBg: string;
  icon: React.ReactNode;
  iconBg: string;
}

const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen, actionType, itemName, itemImage, onConfirm, onCancel,
}) => {
  const getConfig = (): ModalConfig | null => {
    switch (actionType) {
      case 'activate':
        return {
          title: 'Activate account?',
          body: <><strong style={{ color: '#1a1a1a' }}>{itemName}</strong> will regain full access and be able to log in.</>,
          confirmText: 'Activate',
          confirmColor: '#fff',
          confirmBg: '#10b981',
          icon: <Unlock size={22} color="#10b981" strokeWidth={2.5} />,
          iconBg: 'rgba(16,185,129,0.1)',
        };
      case 'deactivate':
        return {
          title: 'Deactivate account?',
          body: <><strong style={{ color: '#1a1a1a' }}>{itemName}</strong> will be suspended and won't be able to log in until reactivated.</>,
          confirmText: 'Deactivate',
          confirmColor: '#fff',
          confirmBg: '#f59e0b',
          icon: <Lock size={22} color="#f59e0b" strokeWidth={2.5} />,
          iconBg: 'rgba(245,158,11,0.1)',
        };
      case 'delete':
        return {
          title: 'Delete account?',
          body: <><strong style={{ color: '#1a1a1a' }}>{itemName}</strong>'s account will be soft-deleted. They won't be able to log in, and the account will be permanently removed after 30 days.</>,
          confirmText: 'Delete',
          confirmColor: '#fff',
          confirmBg: '#ef4444',
          icon: <Trash2 size={22} color="#ef4444" strokeWidth={2.5} />,
          iconBg: 'rgba(239,68,68,0.1)',
        };
      case 'hard_delete':
        return {
          title: 'Permanently delete?',
          body: <>All data for <strong style={{ color: '#1a1a1a' }}>{itemName}</strong> will be erased from the database immediately. <strong style={{ color: '#ef4444' }}>This cannot be undone.</strong></>,
          confirmText: 'Delete permanently',
          confirmColor: '#fff',
          confirmBg: '#ef4444',
          icon: <AlertTriangle size={22} color="#ef4444" strokeWidth={2.5} />,
          iconBg: 'rgba(239,68,68,0.1)',
        };
      case 'delete_product':
        return {
          title: 'Delete product?',
          body: <><strong style={{ color: '#1a1a1a' }}>{itemName}</strong> will be permanently removed. This cannot be undone.</>,
          confirmText: 'Delete product',
          confirmColor: '#fff',
          confirmBg: '#ef4444',
          icon: itemImage
            ? <img src={itemImage} alt={itemName} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
            : <Trash2 size={22} color="#ef4444" strokeWidth={2.5} />,
          iconBg: itemImage ? 'transparent' : 'rgba(239,68,68,0.1)',
        };
      default:
        return null;
    }
  };

  const config = getConfig();

  return (
    <AnimatePresence>
      {isOpen && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
          style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            padding: '24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px 28px 28px',
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: config.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 18,
            }}>
              {config.icon}
            </div>

            {/* Title */}
            <h4 style={{ margin: '0 0 10px', fontWeight: 900, fontSize: '1.1rem', color: '#1a1a1a', letterSpacing: '-0.3px' }}>
              {config.title}
            </h4>

            {/* Body */}
            <p style={{ margin: '0 0 28px', fontSize: '0.88rem', color: '#666', lineHeight: 1.65 }}>
              {config.body}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 12,
                  border: '1.5px solid #e8e8e8', background: '#fff',
                  fontWeight: 700, fontSize: '0.88rem', color: '#555',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.background = '#fff'; }}
              >
                Cancel
              </button>
              <motion.button
                onClick={onConfirm}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 12,
                  border: 'none',
                  background: config.confirmBg,
                  fontWeight: 800, fontSize: '0.88rem',
                  color: config.confirmColor,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {(actionType === 'delete' || actionType === 'hard_delete' || actionType === 'delete_product') && (
                  <Trash2 size={14} strokeWidth={2.5} />
                )}
                {(actionType === 'activate') && <CheckCircle size={14} strokeWidth={2.5} />}
                {(actionType === 'deactivate') && <Lock size={14} strokeWidth={2.5} />}
                {config.confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionConfirmModal;
