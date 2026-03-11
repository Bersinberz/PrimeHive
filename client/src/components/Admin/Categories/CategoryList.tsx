import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Category } from '../../../services/Admin/categoryService';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  searchQuery: string;
  onAddFirst: () => void;
  onEdit: (category: Category) => void;
  onAssign: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const rowColors = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#ea580c',
];

const CategoryList: React.FC<CategoryListProps> = ({ categories, isLoading, searchQuery, onAddFirst, onEdit, onAssign, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return null;

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (categories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="empty-state-container"
      >
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '8px' }}>
          No categories yet
        </h3>
        <p style={{ color: '#999', fontSize: '0.95rem', maxWidth: '360px', marginBottom: '24px', lineHeight: 1.6 }}>
          Organize your catalog by creating collections. Group similar products to help customers find what they need.
        </p>
        <button className="new-product-btn" onClick={onAddFirst}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create First Category
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
          No categories match "<strong>{searchQuery}</strong>". Try a different search.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      border: '1px solid #f0f0f2',
      overflow: 'hidden',
    }}>
      {filtered.map((cat, i) => {
        const color = rowColors[i % rowColors.length];
        const initials = cat.name.substring(0, 2).toUpperCase();
        const isExpanded = expandedId === cat._id;

        return (
          <div key={cat._id}>
            {/* Row */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 24px',
                gap: '16px',
                cursor: 'pointer',
                transition: 'background 0.15s',
                background: isExpanded ? '#f9f9fb' : 'transparent',
              }}
              onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => setExpandedId(isExpanded ? null : cat._id)}
            >
              {/* Avatar */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `${color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.85rem',
                fontWeight: 800,
                color: color,
                letterSpacing: '0.5px',
              }}>
                {initials}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>
                    {cat.name}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: cat.productCount > 0 ? '#10b981' : '#bbb',
                    background: cat.productCount > 0 ? 'rgba(16, 185, 129, 0.08)' : '#f5f5f7',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}>
                    {cat.productCount} product{cat.productCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.82rem',
                  color: '#999',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.4,
                }}>
                  {cat.description || 'No description'}
                </p>
              </div>

              {/* Chevron */}
              <div style={{ flexShrink: 0, color: '#ccc', transition: 'transform 0.25s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </motion.div>

            {/* Expanded Action Panel */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '4px 24px 18px 90px',
                    background: '#f9f9fb',
                  }}>
                    {/* Assign */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedId(null); onAssign(cat); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(255, 140, 66, 0.2)',
                        background: 'rgba(255, 140, 66, 0.06)',
                        color: 'var(--prime-orange)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--prime-orange)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--prime-orange)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 140, 66, 0.06)'; e.currentTarget.style.color = 'var(--prime-orange)'; e.currentTarget.style.borderColor = 'rgba(255, 140, 66, 0.2)'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      Assign Products
                    </button>

                    {/* Edit */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedId(null); onEdit(cat); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(99, 102, 241, 0.2)',
                        background: 'rgba(99, 102, 241, 0.06)',
                        color: '#6366f1',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#6366f1'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedId(null); onDelete(cat); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(239, 68, 68, 0.2)',
                        background: 'rgba(239, 68, 68, 0.05)',
                        color: '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            {i < filtered.length - 1 && (
              <div style={{ height: '1px', background: '#f5f5f7', marginLeft: '90px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryList;