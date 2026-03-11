import React from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../../../services/Admin/productService';

interface ProductHeaderProps {
  view: 'list' | 'add';
  isEditing: boolean;
  products: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onBackClick: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ view, isEditing, products, searchQuery, onSearchChange, onAddClick, onBackClick }) => {
  const totalProducts = products.length;
  const inStock = products.filter(p => p.stock > 10).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  if (view !== 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '24px' }}
      >
        <button className="back-nav-btn" onClick={onBackClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Products
        </button>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', marginTop: '16px', marginBottom: '4px' }}>
          {isEditing ? 'Edit Product' : 'New Product'}
        </h2>
        <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
          {isEditing ? 'Update the details and media for this product.' : 'Fill in the details to publish a new item to your catalog.'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="command-bar"
    >
      {/* Top row: Title + Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>
            Products
          </h2>
          <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0' }}>
            Manage your entire product catalog
          </p>
        </div>
        <button className="new-product-btn" onClick={onAddClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Product
        </button>
      </div>

      {/* Bottom row: Search + Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
            <span className="stat-dot" style={{ background: '#6366f1' }} />
            <span className="stat-count">{totalProducts}</span>
            Total
          </motion.div>
          <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
            <span className="stat-dot" style={{ background: '#10b981' }} />
            <span className="stat-count">{inStock}</span>
            In Stock
          </motion.div>
          <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
            <span className="stat-dot" style={{ background: '#f59e0b' }} />
            <span className="stat-count">{lowStock}</span>
            Low
          </motion.div>
          <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
            <span className="stat-dot" style={{ background: '#ef4444' }} />
            <span className="stat-count">{outOfStock}</span>
            Out
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductHeader;