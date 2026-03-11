import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../services/Admin/productService';

interface DeleteConfirmModalProps {
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ product, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {product && (
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
            {/* Product thumbnail */}
            {product.images && product.images.length > 0 ? (
              <div style={{ width: '72px', height: '72px', borderRadius: '18px', overflow: 'hidden', margin: '0 auto 20px', border: '2px solid #f0f0f2' }}>
                <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(239, 68, 68, 0.08)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
            )}

            <h4 style={{ fontWeight: 900, color: '#1a1a1a', marginBottom: '8px', fontSize: '1.25rem' }}>
              Delete Product?
            </h4>
            <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '28px' }}>
              Are you sure you want to permanently remove<br />
              <strong style={{ color: '#1a1a1a' }}>{product.name}</strong>? This cannot be undone.
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
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
                }}
              >
                Yes, Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;