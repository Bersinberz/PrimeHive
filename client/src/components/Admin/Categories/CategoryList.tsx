import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Category } from '../../../services/admin/categoryService';
import { usePermission } from '../../../hooks/usePermission';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  searchQuery: string;
  onAddFirst: () => void;
  onEdit: (category: Category) => void;
  onAssign: (category: Category) => void;
  onDelete: (category: Category) => void;
  onLoadMore?: () => void;
}

const rowColors = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#ea580c',
];

const CategoryList: React.FC<CategoryListProps> = ({
  categories, isLoading, isFetchingMore = false, hasMore = false,
  searchQuery, onAddFirst, onEdit, onAssign, onDelete, onLoadMore
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const canEdit = usePermission('categories', 'edit');
  const canDelete = usePermission('categories', 'delete');
  const canCreate = usePermission('categories', 'create');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (!observerTarget.current) return;
    const el = observerTarget.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    }, { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, isFetchingMore, isLoading, onLoadMore]);

  if (isLoading && categories.length === 0) return null;

  // Apply Search
  const filtered = categories.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (categories.length === 0 && !isLoading) {
    return (
      <div className="empty-state-container">
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
        <button className="btn text-white fw-bold px-4 py-2" onClick={onAddFirst} style={{ background: 'var(--prime-orange, #ff8c42)', borderRadius: '10px', border: 'none', display: canCreate ? undefined : 'none' }}>
          Create First Category
        </button>
      </div>
    );
  }

  if (filtered.length === 0 && !isLoading) {
    return (
      <div className="empty-state-container" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="empty-state-icon d-flex align-items-center justify-content-center bg-light" style={{ width: '80px', height: '80px', borderRadius: '24px', marginBottom: '16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h4 style={{ fontWeight: 800, color: '#555', marginBottom: '4px' }}>No results found</h4>
        <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center' }}>
          No categories match your search. Try adjusting it.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', overflow: 'hidden' }}>
        {filtered.map((cat, i) => {
          const color = rowColors[i % rowColors.length];
          const initials = cat.name.substring(0, 2).toUpperCase();
          const isExpanded = expandedId === cat._id;

          return (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
            >
              {/* Row */}
              <div
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
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem', fontWeight: 800, color: color, letterSpacing: '0.5px' }}>
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>
                      {cat.name}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, color: cat.productCount > 0 ? '#10b981' : '#bbb',
                      background: cat.productCount > 0 ? 'rgba(16, 185, 129, 0.08)' : '#f5f5f7',
                      padding: '3px 10px', borderRadius: '20px', flexShrink: 0, marginLeft: '12px',
                    }}>
                      {cat.productCount} product{cat.productCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#999', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.description || 'No description'}
                  </p>
                </div>

                {/* Chevron */}
                <div style={{ flexShrink: 0, color: '#ccc', transition: 'transform 0.25s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

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
                    <div style={{ display: 'flex', gap: '10px', padding: '4px 24px 18px 90px', background: '#f9f9fb' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedId(null); onAssign(cat); }}
                        className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-bold"
                        style={{ borderRadius: '10px', color: 'var(--prime-orange)', background: 'rgba(255, 140, 66, 0.08)', border: '1px solid rgba(255, 140, 66, 0.2)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Assign Products
                      </button>

                      {canEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedId(null); onEdit(cat); }}
                          className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-bold"
                          style={{ borderRadius: '10px', color: '#6366f1', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedId(null); onDelete(cat); }}
                          className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-bold"
                          style={{ borderRadius: '10px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              {i < filtered.length - 1 && <div style={{ height: '1px', background: '#f5f5f7', marginLeft: '90px' }} />}
            </motion.div>
          );
        })}
      </div>

      <div style={{ height: '20px' }} />
    </>
  );
};

export default CategoryList;