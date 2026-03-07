import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../../services/Admin/productService';

interface DeleteConfirmModalProps {
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ product, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {product && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-4 p-md-5 rounded-4 shadow-lg text-center" style={{ maxWidth: '420px', width: '90%' }}>
            <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h4 className="fw-bolder text-dark mb-2">Delete Product?</h4>
            <p className="text-muted small mb-4">
              Are you sure you want to permanently delete <strong>{product.name}</strong>? This action cannot be undone.
            </p>
            <div className="d-flex gap-3">
              <button className="btn btn-light border w-100 fw-bold py-2" onClick={onCancel}>Cancel</button>
              <button className="btn btn-danger w-100 fw-bold py-2" onClick={onConfirm}>Yes, Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;