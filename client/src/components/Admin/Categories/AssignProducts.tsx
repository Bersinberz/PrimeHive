import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { type Category, getCategoryProducts, assignProducts } from '../../../services/admin/categoryService';
import { getProducts, type Product } from '../../../services/admin/productService';

interface AssignProductsProps {
  category: Category;
  onClose: () => void;
  showToast: (msg: { type: 'success' | 'error'; title: string; message: string }) => void;
  refreshCategories: () => void;
}

const AssignProducts: React.FC<AssignProductsProps> = ({ category, onClose, showToast, refreshCategories }) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [assignedState, setAssignedState] = useState<Record<string, boolean>>({});

  // Loading & Pagination States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // 1. Initial Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch the IDs of already assigned products, AND the first 20 products
        const [assignedProducts, firstPageProducts] = await Promise.all([
          getCategoryProducts(category._id),
          getProducts({ page: 1, limit: 20 })
        ]);

        // Mark initially assigned products as "checked"
        const initialState: Record<string, boolean> = {};
        assignedProducts.forEach((p) => {
          initialState[p._id] = true;
        });

        setAssignedState(initialState);
        setAvailableProducts(firstPageProducts);
        setHasMore(firstPageProducts.length === 20);

      } catch (error) {
        showToast({ type: 'error', title: 'Error', message: 'Could not load products.' });
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [category._id, showToast]);

  // 2. Fetch More Callback
  const loadMoreProducts = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const moreProducts = await getProducts({ page: nextPage, limit: 20 });
      setAvailableProducts(prev => [...prev, ...moreProducts]);
      setPage(nextPage);
      setHasMore(moreProducts.length === 20);
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: 'Could not load more products.' });
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, hasMore, isFetchingMore, showToast]);

  // 3. Infinite Scroll Observer
  useEffect(() => {
    if (!observerTarget.current) return;
    const el = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isInitialLoading) {
          loadMoreProducts();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, isFetchingMore, isInitialLoading, loadMoreProducts]);

  // Handlers
  const toggleProduct = (id: string) => {
    setAssignedState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const assignedIds = Object.keys(assignedState).filter(id => assignedState[id]);
    try {
      await assignProducts(category._id, assignedIds);
      showToast({ type: 'success', title: 'Assigned', message: 'Products successfully updated for this category.' });
      refreshCategories(); // Refresh count on main screen
      onClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        "Could not save assignments.";

      showToast({
        type: 'error',
        title: 'Assignment Failed',
        message
      });
    } finally {
    setIsSaving(false);
  }
};

const selectedCount = Object.values(assignedState).filter(Boolean).length;

return (
  <>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
      onClick={!isSaving ? onClose : undefined}
    />

    <motion.div
      initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
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
        <button onClick={onClose} className="btn-close shadow-none" disabled={isSaving}></button>
      </div>

      {/* Drawer Body */}
      <div className="flex-grow-1 overflow-auto p-4 bg-light bg-opacity-25">
        {isInitialLoading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
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
                        checked={isSelected || false}
                        onChange={() => toggleProduct(product._id)}
                        style={{ cursor: 'pointer', backgroundColor: isSelected ? 'var(--prime-orange)' : '#e2e8f0', borderColor: isSelected ? 'var(--prime-orange)' : '#cbd5e1' }}
                      />
                    </div>
                  </label>
                </div>
              );
            })}

            {/* Load More Indicator */}
            <div ref={observerTarget} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {isFetchingMore && <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>}
            </div>

            {availableProducts.length === 0 && (
              <div className="text-center py-5 text-muted">
                No products found. Add products to the catalog first.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-top bg-white d-flex justify-content-between align-items-center shadow-lg">
        <div className="d-flex flex-column">
          <span className="fw-bolder fs-5 text-dark">{selectedCount}</span>
          <span className="text-muted small text-uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Selected</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isInitialLoading}
          className="btn px-4 py-3 fw-bold text-white text-uppercase tracking-wider transition-all"
          style={{ background: 'var(--prime-gradient)', boxShadow: 'var(--prime-shadow)', borderRadius: '10px', fontSize: '0.9rem' }}
        >
          {isSaving ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Saving...</> : 'Save Selection'}
        </button>
      </div>
    </motion.div>
  </>
);
};

export default AssignProducts;