import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  type CreateProductPayload,
  type Product,
} from '../../services/admin/productService';

import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import ProductHeader from '../../components/Admin/Products/ProductHeader';
import ProductList from '../../components/Admin/Products/ProductList';
import ProductForm from '../../components/Admin/Products/ProductForm';
import ActionConfirmModal from '../../components/Admin/ActionConfirmModal';

const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const ProductManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { showToast } = useToast();

  // Initial Fetch (Page 1) - Requests exactly 12 items
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProducts({ page: 1, limit: 50 });
      setProducts(data);
      setPage(1);
      setHasMore(data.length === 50);
    } catch (error: any) {
      showToast({ type: 'error', title: 'Fetch Failed', message: error?.message || 'Could not load products. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoreProducts = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getProducts({ page: nextPage, limit: 50 });
      setProducts(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === 50);
    } catch (error: any) {
      showToast({ type: 'error', title: 'Load Failed', message: 'Could not load more products.' });
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => { if (view === 'list') fetchProducts(); }, [view, fetchProducts]);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsSaving(true);
    try {
      await deleteProduct(productToDelete._id);
      showToast({ type: 'success', title: 'Deleted', message: 'Product removed successfully.' });
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
    } catch (error: any) {
      showToast({ type: 'error', title: 'Delete Failed', message: error?.message || 'Could not delete product.' });
    } finally {
      setIsSaving(false);
      setProductToDelete(null);
    }
  };

  const handleSaveProduct = async (payload: CreateProductPayload, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        const updated = await updateProduct(id, payload);
        showToast({ type: 'success', title: 'Updated', message: 'Product updated successfully!' });
        setProducts(prev => prev.map(p => p._id === id ? updated : p));
      } else {
        await createProduct(payload);
        showToast({ type: 'success', title: 'Created', message: 'New product added successfully!' });
        fetchProducts();
      }
      setEditingProduct(null);
      setView('list');
    } catch (error: any) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        maxWidth: '1400px',
        minHeight: '80vh',
        margin: '0 auto',
        position: 'relative',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ActionConfirmModal 
        isOpen={!!productToDelete}
        actionType="delete_product"
        itemName={productToDelete?.name || ''}
        itemImage={productToDelete?.images?.[0]}
        onConfirm={confirmDelete} 
        onCancel={() => setProductToDelete(null)} 
      />

      <ProductHeader
        view={view}
        isEditing={!!editingProduct}
        products={products}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => { setEditingProduct(null); setView('add'); }}
        onBackClick={() => { setEditingProduct(null); setView('list'); }}
      />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProductList
              products={products}
              isLoading={isLoading}
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
              searchQuery={searchQuery}
              onAddFirst={() => { setEditingProduct(null); setView('add'); }}
              onEdit={(p) => { setEditingProduct(p); setView('add'); }}
              onDelete={setProductToDelete}
              onLoadMore={fetchMoreProducts}
            />
          </motion.div>
        ) : (
          <motion.div key="add" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProductForm
              initialData={editingProduct}
              isSaving={isSaving}
              onSave={handleSaveProduct}
              onCancel={() => { setEditingProduct(null); setView('list'); }}
              showToast={showToast}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductManagement;