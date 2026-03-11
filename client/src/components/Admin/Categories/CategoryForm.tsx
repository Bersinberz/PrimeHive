import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Category } from '../../../services/Admin/categoryService';

interface CategoryFormErrors {
  name?: string;
  description?: string;
}

interface CategoryFormModalProps {
  initialData: Category | null;
  isSaving: boolean;
  onSave: (payload: { name: string; description: string }, id?: string) => Promise<void>;
  onClose: () => void;
  showToast: (msg: { type: 'error'; title: string; message: string }) => void;
}

const CategoryForm: React.FC<CategoryFormModalProps> = ({ initialData, isSaving, onSave, onClose, showToast }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({});

  // Reset form when initialData changes (e.g., switching from Add to Edit)
  useEffect(() => {
    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
    });
    setFormErrors({});
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CategoryFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: CategoryFormErrors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = 'Category name is required';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (formData.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Please correct the errors below.' });
      return;
    }

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
      }, initialData?._id);
    } catch (error: any) {
      if (error?.status === 400 && error?.errors) {
        const backendErrors: CategoryFormErrors = {};
        error.errors.forEach((err: { field: string; message: string }) => {
          backendErrors[err.field as keyof CategoryFormErrors] = err.message;
        });
        setFormErrors(backendErrors);
      }
      showToast({ type: 'error', title: 'Save Failed', message: error?.message || 'Could not save category.' });
    }
  };

  const fieldClass = (field: keyof CategoryFormErrors) => `form-control form-control-lg shadow-none fs-6 bg-light ${formErrors[field] ? 'border-danger' : 'border-light'}`;

  return (
    <>
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="position-fixed top-50 start-50 translate-middle w-100"
        style={{ maxWidth: '500px', zIndex: 1050 }}
      >
        <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '20px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bolder mb-0 text-dark">{initialData ? 'Edit Category' : 'Add New Category'}</h4>
            <button onClick={onClose} className="btn-close shadow-none" disabled={isSaving}></button>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Category Name *</label>
              <input
                type="text"
                name="name"
                className={fieldClass('name')}
                placeholder="e.g. Smart Watches"
                value={formData.name}
                onChange={handleInputChange}
                style={{ borderRadius: '10px' }}
                autoFocus
              />
              {formErrors.name && <small className="text-danger mt-1 d-block">{formErrors.name}</small>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                className={fieldClass('description')}
                rows={4}
                placeholder="Briefly describe this category..."
                value={formData.description}
                onChange={handleInputChange}
                style={{ borderRadius: '10px', resize: 'none' }}
              />
              {formErrors.description && <small className="text-danger mt-1 d-block">{formErrors.description}</small>}
            </div>

            <button
              type="submit"
              className="btn w-100 py-3 fw-bold text-white text-uppercase tracking-wider transition-all"
              disabled={isSaving}
              style={{ background: 'var(--prime-gradient)', boxShadow: 'var(--prime-shadow)', borderRadius: '12px', letterSpacing: '1px' }}
            >
              {isSaving ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</> : initialData ? 'Update Category' : 'Save Category'}
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default CategoryForm;