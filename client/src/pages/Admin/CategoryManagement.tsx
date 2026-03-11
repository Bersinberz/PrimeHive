import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  assignProducts,
  type Category,
} from '../../services/Admin/categoryService';
import { getProducts, type Product } from '../../services/Admin/productService';

import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';
import AssignProducts from '../../components/Admin/Categories/AssignProducts';
import CategoryForm from '../../components/Admin/Categories/CategoryForm';
import CategoryHeader from '../../components/Admin/Categories/CategoryHeader';
import CategoryList from '../../components/Admin/Categories/CategoryList';
import DeleteConfirmModal from '../../components/Admin/DeleteConfirmModal';


const CategoryManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  // Overlay States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Assign Drawer States
  const [categoryToAssign, setCategoryToAssign] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      setToast({ type: 'error', title: 'Fetch Failed', message: error?.message || 'Could not load categories.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Form Modal Handlers ---
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async (payload: { name: string, description: string }, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateCategory(id, payload);
        setToast({ type: 'success', title: 'Updated', message: 'Category updated successfully!' });
      } else {
        await createCategory(payload);
        setToast({ type: 'success', title: 'Created', message: 'New category added successfully!' });
      }
      handleCloseFormModal();
      fetchCategories();
    } catch (error: any) {
      throw error; // Let CategoryFormModal catch and map validation errors
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete Handlers ---
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsSaving(true);
    try {
      await deleteCategory(categoryToDelete._id);
      setToast({ type: 'success', title: 'Deleted', message: 'Category removed successfully.' });
      fetchCategories();
    } catch (error: any) {
      setToast({ type: 'error', title: 'Delete Failed', message: error?.message || 'Could not delete category.' });
    } finally {
      setIsSaving(false);
      setCategoryToDelete(null);
    }
  };

  // --- Assign Drawer Handlers ---
  const handleOpenAssign = async (category: Category) => {
    setIsLoading(true);
    try {
      const [productsData, assignedData] = await Promise.all([
        getProducts(),
        getCategoryProducts(category._id),
      ]);
      setAllProducts(productsData);
      setAssignedProductIds(assignedData.map((p: any) => p._id));
      setCategoryToAssign(category);
    } catch (error: any) {
      setToast({ type: 'error', title: 'Load Failed', message: 'Could not load products for assignment.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAssignments = async (categoryId: string, selectedIds: string[]) => {
    setIsSaving(true);
    try {
      await assignProducts(categoryId, selectedIds);
      setToast({ type: 'success', title: 'Assigned', message: 'Products successfully updated for this category.' });
      setCategoryToAssign(null);
      fetchCategories(); // Refresh product counts
    } catch (error: any) {
      setToast({ type: 'error', title: 'Error', message: 'Could not save assignments.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto position-relative pb-5" style={{ maxWidth: '1400px', minHeight: '80vh' }}>

      {/* Globals */}
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <DeleteConfirmModal product={categoryToDelete as any} onConfirm={confirmDelete} onCancel={() => setCategoryToDelete(null)} />

      {/* 1. Add/Edit Category Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <CategoryForm
            initialData={editingCategory}
            isSaving={isSaving}
            onSave={handleSaveCategory}
            onClose={handleCloseFormModal}
            showToast={setToast}
          />
        )}
      </AnimatePresence>

      {/* 2. Assign Products Right Drawer */}
      <AnimatePresence>
        {categoryToAssign && (
          <AssignProducts
            category={categoryToAssign}
            availableProducts={allProducts}
            initialAssignedIds={assignedProductIds}
            isSaving={isSaving}
            onSaveAssignments={handleSaveAssignments}
            onCancel={() => setCategoryToAssign(null)}
          />
        )}
      </AnimatePresence>

      {/* Base Page Content (Always visible behind modals) */}
      <CategoryHeader
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleOpenAddModal}
      />

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onAddFirst={handleOpenAddModal}
        onEdit={handleOpenEditModal}
        onAssign={handleOpenAssign}
        onDelete={setCategoryToDelete}
      />

    </motion.div>
  );
};

export default CategoryManagement;