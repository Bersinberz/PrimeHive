import React from 'react';
import type { Product } from '../../../services/Admin/productService';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onAddFirst: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, isLoading, onAddFirst, onEdit, onDelete }) => {
  if (isLoading) return null; // Controlled by PrimeLoader in parent

  if (products.length === 0) {
    return (
      <div className="text-center py-5 px-4">
        <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', background: 'rgba(255,140,66,0.1)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
        </div>
        <h5 className="fw-bolder text-dark mb-2">No products yet</h5>
        <p className="text-muted mb-4" style={{ maxWidth: '360px', margin: '0 auto' }}>Your catalog is empty. Start adding products to display them here.</p>
        <button onClick={onAddFirst} className="btn text-white fw-bold px-4 py-2 border-0 shadow-sm" style={{ background: 'var(--prime-gradient)', borderRadius: '10px' }}>
          + Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <div className="table-responsive p-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="bg-light bg-opacity-50">
          <tr>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Product</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Category</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Price</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Stock</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Status</th>
            <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const status = p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock';
            return (
              <tr key={p._id}>
                <td className="py-3 px-4 border-light">
                  <div className="d-flex align-items-center">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="rounded-3 me-3 border border-light shadow-sm" width="48" height="48" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="rounded-3 me-3 border border-light shadow-sm bg-light d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}><span className="text-muted small">No Img</span></div>
                    )}
                    <div>
                      <span className="fw-bold text-dark d-block">{p.name}</span>
                      <small className="text-muted">{p.sku || p._id.substring(0, 8)}</small>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 border-light fw-medium text-secondary">{p.category}</td>
                <td className="py-3 px-4 border-light fw-bold text-dark">₹{p.price.toFixed(2)}</td>
                <td className="py-3 px-4 border-light fw-medium text-secondary">{p.stock} units</td>
                <td className="py-3 px-4 border-light">
                  <span className={`badge rounded-pill px-3 py-2 fw-bold ${status === 'In Stock' ? 'bg-success bg-opacity-10 text-success' : status === 'Low Stock' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'}`}>{status}</span>
                </td>
                <td className="py-3 px-4 border-light text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-light rounded-3 p-2 border-0" style={{ color: 'var(--prime-orange)' }} title="Edit" onClick={() => onEdit(p)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button className="btn btn-sm btn-light rounded-3 p-2 text-danger border-0" title="Delete" onClick={() => onDelete(p)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;