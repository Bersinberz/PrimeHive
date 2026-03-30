import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '../../services/admin/categoryService';

import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import AssignProducts from '../../components/Admin/Categories/AssignProducts';
import CategoryForm from '../../components/Admin/Categories/CategoryForm';
import CategoryHeader from '../../components/Admin/Categories/CategoryHeader';
import CategoryList from '../../components/Admin/Categories/CategoryList';
import ActionConfirmModal from '../../components/Admin/ActionConfirmModal';

const CategoryManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToAssign, setCategoryToAssign] = useState<Category | null>(null);

  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategories({ page: 1, limit: 50 });
      setCategories(data);
      setPage(1);
      setHasMore(data.length === 50);
    } catch (error: any) {
      showToast({ type: 'error', title: 'Couldn\'t load categories', message: 'Something went wrong. Please refresh and try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchMoreCategories = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getCategories({ page: nextPage, limit: 50 });
      setCategories(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === 50);
    } catch (error: any) {
      showToast({ type: 'error', title: 'Couldn\'t load more', message: 'We hit a snag loading more categories. Please try again.' });
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddModal = () => { setEditingCategory(null); setIsFormModalOpen(true); };
  const handleOpenEditModal = (category: Category) => { setEditingCategory(category); setIsFormModalOpen(true); };
  const handleCloseFormModal = () => { setIsFormModalOpen(false); setEditingCategory(null); };

  const handleSaveCategory = async (payload: { name: string; description: string }, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateCategory(id, payload);
        showToast({ type: 'success', title: 'Saved', message: 'Category updated successfully.' });
      } else {
        await createCategory(payload);
        showToast({ type: 'success', title: 'Category created', message: 'Your new category is ready to use.' });
      }
      handleCloseFormModal();
      fetchCategories();
    } catch (error: any) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsSaving(true);
    try {
      await deleteCategory(categoryToDelete._id);
      showToast({ type: 'success', title: 'Deleted', message: 'Category removed.' });
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
    } catch (error: any) {
      showToast({ type: 'error', title: 'Couldn\'t delete', message: error?.message || 'Something went wrong. Please try again.' });
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
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ActionConfirmModal
        isOpen={!!categoryToDelete}
        actionType="delete_category"
        itemName={categoryToDelete?.name || ''}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />

      <AnimatePresence>
        {isFormModalOpen && (
          <CategoryForm
            initialData={editingCategory}
            isSaving={isSaving}
            onSave={handleSaveCategory}
            onClose={handleCloseFormModal}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {categoryToAssign && (
          <AssignProducts
            category={categoryToAssign}
            onClose={() => setCategoryToAssign(null)}
            showToast={showToast}
            refreshCategories={fetchCategories}
          />
        )}
      </AnimatePresence>

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
