import React from 'react';
import { motion } from 'framer-motion';
import type { Category } from '../../../services/admin/categoryService';
import { usePermission } from '../../../hooks/usePermission';

interface CategoryHeaderProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ categories, searchQuery, onSearchChange, onAddClick }) => {
  const canCreate = usePermission('categories', 'create');
  const total = categories.length;
  const emptyCategories = categories.filter(c => c.productCount === 0).length;

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
            Categories
          </h2>
          <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, margin: '2px 0 0' }}>
            Organize your catalog with collections
          </p>
        </div>
        <button className="new-product-btn" onClick={onAddClick} style={{ display: canCreate ? undefined : 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Category
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
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
            <span className="stat-dot" style={{ background: '#6366f1' }} />
            <span className="stat-count">{total}</span>
            Categories
          </motion.div>
          <motion.div className="stat-pill" whileHover={{ scale: 1.03 }}>
            <span className="stat-dot" style={{ background: '#f59e0b' }} />
            <span className="stat-count">{emptyCategories}</span>
            Empty
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryHeader;