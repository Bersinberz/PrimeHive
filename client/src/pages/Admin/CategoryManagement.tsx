import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '../../services/admin/categoryService';

import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';
import AssignProducts from '../../components/Admin/Categories/AssignProducts';
import CategoryForm from '../../components/Admin/Categories/CategoryForm';
import CategoryHeader from '../../components/Admin/Categories/CategoryHeader';
import CategoryList from '../../components/Admin/Categories/CategoryList';
import ActionConfirmModal from '../../components/Admin/ActionConfirmModal';

const CategoryManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  // Overlay States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Assign Drawer States
  const [categoryToAssign, setCategoryToAssign] = useState<Category | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategories({ page: 1, limit: 1000 });
      setCategories(data);
      setPage(1);
      setHasMore(false);
    } catch (error: any) {
      setToast({ type: 'error', title: 'Fetch Failed', message: error?.message || 'Could not load categories.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMoreCategories = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getCategories({ page: nextPage, limit: 1000 });
      setCategories(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(false);
    } catch (error: any) {
      setToast({ type: 'error', title: 'Load Failed', message: 'Could not load more categories.' });
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      throw error;
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
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
    } catch (error: any) {
      setToast({ type: 'error', title: 'Delete Failed', message: error?.message || 'Could not delete category.' });
    } finally {
      setIsSaving(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto position-relative pb-5"
      style={{ maxWidth: '1400px', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}
    >
      <PrimeLoader isLoading={isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <ActionConfirmModal 
        isOpen={!!categoryToDelete}
        actionType="delete"
        itemName={categoryToDelete?.name || ''}
        onConfirm={confirmDelete} 
        onCancel={() => setCategoryToDelete(null)} 
      />

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
            onClose={() => setCategoryToAssign(null)}
            showToast={setToast}
            refreshCategories={fetchCategories}
          />
        )}
      </AnimatePresence>

      {/* Base Page Content */}
      <CategoryHeader
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleOpenAddModal}
      />

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        hasMore={hasMore}
        searchQuery={searchQuery}
        onAddFirst={handleOpenAddModal}
        onEdit={handleOpenEditModal}
        onAssign={setCategoryToAssign}
        onDelete={setCategoryToDelete}
        onLoadMore={fetchMoreCategories}
      />

    </motion.div>
  );
};

export default CategoryManagement;