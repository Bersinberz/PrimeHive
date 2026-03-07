import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  type CreateProductPayload,
  type Product,
} from '../../services/Admin/productService';

import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/Products/ToastNotification';
import DeleteConfirmModal from '../../components/Admin/Products/DeleteConfirmModal';
import ProductHeader from '../../components/Admin/Products/ProductHeader';
import ProductList from '../../components/Admin/Products/ProductList';
import ProductForm from '../../components/Admin/Products/ProductForm';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const ProductManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      setToast({ type: 'error', title: 'Fetch Failed', message: error?.message || 'Could not load products. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (view === 'list') fetchProducts(); }, [view]);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsSaving(true);
    try {
      await deleteProduct(productToDelete._id);
      setToast({ type: 'success', title: 'Deleted', message: 'Product removed successfully.' });
      fetchProducts();
    } catch (error: any) {
      setToast({ type: 'error', title: 'Delete Failed', message: error?.message || 'Could not delete product.' });
    } finally {
      setIsSaving(false);
      setProductToDelete(null);
    }
  };

  const handleSaveProduct = async (payload: CreateProductPayload, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateProduct(id, payload);
        setToast({ type: 'success', title: 'Updated', message: 'Product updated successfully!' });
      } else {
        await createProduct(payload);
        setToast({ type: 'success', title: 'Created', message: 'New product added successfully!' });
      }
      setEditingProduct(null);
      setView('list');
    } catch (error: any) {
      throw error; // Let ProductForm catch the validation errors
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto position-relative pb-5" style={{ maxWidth: '1400px', minHeight: '80vh' }}>
      
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <DeleteConfirmModal product={productToDelete} onConfirm={confirmDelete} onCancel={() => setProductToDelete(null)} />

      <ProductHeader 
        view={view} 
        isEditing={!!editingProduct} 
        onAddClick={() => { setEditingProduct(null); setView('add'); }} 
        onBackClick={() => { setEditingProduct(null); setView('list'); }} 
      />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '16px' }}>
            <ProductList 
              products={products} 
              isLoading={isLoading} 
              onAddFirst={() => { setEditingProduct(null); setView('add'); }} 
              onEdit={(p) => { setEditingProduct(p); setView('add'); }} 
              onDelete={setProductToDelete} 
            />
          </motion.div>
        ) : (
          <motion.div key="add" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '16px' }}>
            <ProductForm 
              initialData={editingProduct} 
              isSaving={isSaving} 
              onSave={handleSaveProduct} 
              onCancel={() => { setEditingProduct(null); setView('list'); }} 
              showToast={setToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ProductManagement;