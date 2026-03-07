import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type Category } from '../../../services/Admin/categoryService';
import { type Product } from '../../../services/Admin/productService';

interface AssignProductsProps {
  category: Category;
  availableProducts: Product[];
  initialAssignedIds: string[];
  isSaving: boolean;
  onSaveAssignments: (categoryId: string, productIds: string[]) => Promise<void>;
  onCancel: () => void;
}

const AssignProducts: React.FC<AssignProductsProps> = ({
  category,
  availableProducts,
  initialAssignedIds,
  isSaving,
  onSaveAssignments,
  onCancel
}) => {
  // Track toggle states
  const [assignedState, setAssignedState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    availableProducts.forEach(p => {
      state[p._id] = initialAssignedIds.includes(p._id);
    });
    return state;
  });

  const toggleProduct = (id: string) => {
    setAssignedState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const assignedIds = Object.keys(assignedState).filter(id => assignedState[id]);
    onSaveAssignments(category._id, assignedIds);
  };

  const selectedCount = Object.values(assignedState).filter(Boolean).length;

  return (
    <>
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
        onClick={!isSaving ? onCancel : undefined}
      />

      {/* Right Sliding Drawer */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
        style={{ width: '100%', maxWidth: '450px', zIndex: 1050 }}
      >
        {/* Drawer Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
          <div>
            <h4 className="fw-bolder mb-1 text-dark">Assign Products</h4>
            <small className="text-muted fw-medium">
              to <span style={{ color: 'var(--prime-orange)' }}>{category.name}</span>
            </small>
          </div>
          <button onClick={onCancel} className="btn-close shadow-none" disabled={isSaving}></button>
        </div>

        {/* Drawer Body (Scrollable Product List) */}
        <div className="flex-grow-1 overflow-auto p-4 bg-light bg-opacity-25">
          <div className="d-flex flex-column gap-3">
            {availableProducts.map((product) => {
              const isSelected = assignedState[product._id];
              return (
                <div key={product._id} className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'all 0.2s' }}>
                  <label className="card-body p-3 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(255, 140, 66, 0.05)' : '#fff' }}>
                    <div className="d-flex align-items-center gap-3">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="rounded-3 border" width="48" height="48" style={{ objectFit: 'cover', borderColor: 'var(--prime-border)' }} />
                      ) : (
                        <div className="rounded-3 border d-flex align-items-center justify-content-center bg-light" style={{ width: '48px', height: '48px' }}>
                          <span className="text-muted" style={{ fontSize: '10px' }}>No Img</span>
                        </div>
                      )}
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">{product.name}</h6>
                        <small className="text-muted">{product.sku || product._id.substring(0, 8)}</small>
                      </div>
                    </div>

                    <div className="form-check form-switch fs-4 m-0 p-0 ps-5 d-flex align-items-center justify-content-end">
                      <input
                        className="form-check-input cursor-pointer shadow-none m-0"
                        type="checkbox"
                        role="switch"
                        checked={isSelected}
                        onChange={() => toggleProduct(product._id)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--prime-orange)' : '#e2e8f0',
                          borderColor: isSelected ? 'var(--prime-orange)' : '#cbd5e1'
                        }}
                      />
                    </div>
                  </label>
                </div>
              );
            })}
            {availableProducts.length === 0 && (
              <div className="text-center py-5 text-muted">
                No products found. Add products to the catalog first.
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer (Save Action) */}
        <div className="p-4 border-top bg-white d-flex justify-content-between align-items-center shadow-lg">
          <div className="d-flex flex-column">
            <span className="fw-bolder fs-5 text-dark">{selectedCount}</span>
            <span className="text-muted small text-uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Selected</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn px-4 py-3 fw-bold text-white shadow-sm text-uppercase tracking-wider transition-all"
            style={{ background: 'var(--prime-gradient)', boxShadow: 'var(--prime-shadow)', borderRadius: '10px', fontSize: '0.9rem' }}
          >
            {isSaving ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</> : 'Save Selection'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default AssignProducts;