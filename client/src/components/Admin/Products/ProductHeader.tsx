import React from 'react';

interface ProductHeaderProps {
  view: 'list' | 'add';
  isEditing: boolean;
  onAddClick: () => void;
  onBackClick: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ view, isEditing, onAddClick, onBackClick }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--prime-border)' }}>
      <div>
        <h2 className="mb-1" style={{ color: 'var(--prime-dark)', letterSpacing: '-1.5px', fontSize: '2.5rem', fontWeight: 900 }}>
          {view === 'list' ? 'Product Inventory' : isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '1.05rem' }}>
          {view === 'list' ? 'Organize your catalog, update pricing, and monitor stock levels.' : isEditing ? 'Modify the specifications and media for this item.' : 'Publish a brand new item to your storefront catalog.'}
        </p>
      </div>
      <div className="pb-1 mt-3 mt-md-0">
        {view === 'list' ? (
          <button onClick={onAddClick} className="btn text-white fw-bold px-4 py-2 border-0 d-flex align-items-center transition-all shadow-sm" style={{ background: 'var(--prime-gradient)', borderRadius: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Product
          </button>
        ) : (
          <button onClick={onBackClick} className="btn bg-white text-dark fw-bold shadow-sm px-4 py-2 d-flex align-items-center" style={{ border: '1px solid var(--prime-border)', borderRadius: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Catalog
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;