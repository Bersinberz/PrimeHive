import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../../services/Admin/productService';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  onAddFirst: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const ProductList: React.FC<ProductListProps> = ({ products, isLoading, searchQuery, onAddFirst, onEdit, onDelete }) => {
  if (isLoading) return null;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="empty-state-container"
      >
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '8px' }}>
          Your catalog is empty
        </h3>
        <p style={{ color: '#999', fontSize: '0.95rem', maxWidth: '360px', marginBottom: '24px', lineHeight: 1.6 }}>
          Start building your product collection. Add your first product to see it appear here.
        </p>
        <button className="new-product-btn" onClick={onAddFirst}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Your First Product
        </button>
      </motion.div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="empty-state-container" style={{ padding: '60px 40px' }}>
        <div className="empty-state-icon" style={{ width: '80px', height: '80px', borderRadius: '24px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h4 style={{ fontWeight: 800, color: '#555', marginBottom: '4px' }}>No results found</h4>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          No products match "<strong>{searchQuery}</strong>". Try a different search.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <AnimatePresence>
        {filtered.map((p, i) => {
          const status = p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock';
          const statusClass = p.stock > 10 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-of-stock';
          const stockLevel = p.stock > 10 ? 'high' : p.stock > 0 ? 'medium' : 'low';
          const stockPercent = Math.min((p.stock / 100) * 100, 100);
          const discount = p.comparePrice && p.comparePrice > p.price
            ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
            : null;

          return (
            <motion.div
              key={p._id}
              className="product-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              layout
            >
              {/* Image */}
              <div className="product-card-image">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <span className={`status-badge ${statusClass}`}>{status}</span>
              </div>

              {/* Body */}
              <div className="product-card-body">
                <div className="card-category">{p.category}</div>
                <div className="card-name">{p.name}</div>
                <div className="card-sku">{p.sku || p._id.substring(0, 8)}</div>

                {/* Price */}
                <div className="product-card-price">
                  <span className="current-price">₹{p.price.toFixed(2)}</span>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <span className="compare-price">₹{p.comparePrice.toFixed(2)}</span>
                  )}
                  {discount && <span className="discount-tag">-{discount}%</span>}
                </div>

                {/* Stock bar */}
                <div className="stock-info">
                  <span className="stock-label">Stock</span>
                  <span className="stock-count">{p.stock} units</span>
                </div>
                <div className="stock-bar">
                  <div
                    className={`stock-bar-fill ${stockLevel}`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>

              {/* Hover Action Tray */}
              <div className="card-action-tray">
                <button
                  className="action-btn edit-btn"
                  title="Edit"
                  onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button
                  className="action-btn delete-btn"
                  title="Delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(p); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;