import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Category } from '../../../services/admin/categoryService';
import { inputStyle, labelStyle, focusHandlers } from '../Settings/settingsStyles';

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

const errorStyle: React.CSSProperties = {
  color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', display: 'block',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  minHeight: '100px',
};

const CategoryForm: React.FC<CategoryFormModalProps> = ({ initialData, isSaving, onSave, onClose, showToast }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });
  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({});

  useEffect(() => {
    setFormData({ name: initialData?.name || '', description: initialData?.description || '' });
    setFormErrors({});
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CategoryFormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateField = (name: string, value: string) => {
    if (name === 'name') {
      if (!value.trim()) return 'Please enter a category name.';
      if (value.trim().length < 2) return 'Name needs to be at least 2 characters.';
    }
    if (name === 'description' && value.trim().length > 500) {
      return 'Keep the description under 500 characters.';
    }
    return undefined;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Apply blur style for inputs (not textarea)
    if (e.target.tagName === 'INPUT') {
      (e.target as HTMLInputElement).style.borderColor = '#f0f0f2';
      (e.target as HTMLInputElement).style.boxShadow = 'none';
    }
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--prime-orange)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
  };

  const validateForm = (): boolean => {
    const errors: CategoryFormErrors = {};
    const nameError = validateField('name', formData.name);
    if (nameError) errors.name = nameError;
    const descError = validateField('description', formData.description);
    if (descError) errors.description = descError;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast({ type: 'error', title: 'Check your inputs', message: 'Please fix the highlighted fields before saving.' });
      return;
    }
    try {
      await onSave({ name: formData.name.trim(), description: formData.description.trim() }, initialData?._id);
    } catch (error: any) {
      if (error?.status === 400 && error?.errors) {
        const backendErrors: CategoryFormErrors = {};
        error.errors.forEach((err: { field: string; message: string }) => {
          backendErrors[err.field as keyof CategoryFormErrors] = err.message;
        });
        setFormErrors(backendErrors);
      }
      showToast({ type: 'error', title: 'Couldn\'t save', message: error?.message || 'Something went wrong. Please try again.' });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="position-fixed top-50 start-50 translate-middle w-100"
        style={{ maxWidth: '480px', zIndex: 1050, padding: '0 16px' }}
      >
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #f0f0f2' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h4 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.4rem', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
                {initialData ? 'Edit Category' : 'New Category'}
              </h4>
              <p style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
                {initialData ? 'Update the name or description.' : 'Give your new collection a name.'}
              </p>
            </div>
            <button
              onClick={onClose} disabled={isSaving}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#bbb', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input
                  type="text" name="name"
                  style={{ ...inputStyle, borderColor: formErrors.name ? '#ef4444' : '#f0f0f2' }}
                  placeholder="e.g. Smart Watches"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoFocus
                />
                {formErrors.name && <span style={errorStyle}>{formErrors.name}</span>}
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  style={{ ...textareaStyle, borderColor: formErrors.description ? '#ef4444' : '#f0f0f2' }}
                  placeholder="Briefly describe what belongs in this category..."
                  value={formData.description}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {formErrors.description && <span style={errorStyle}>{formErrors.description}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button" onClick={onClose} disabled={isSaving}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #e8e8e8', background: '#fff', fontWeight: 700, fontSize: '0.92rem', color: '#555', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSaving}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--prime-orange)', color: '#fff', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isSaving ? (
                    <>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    initialData ? 'Save Changes' : 'Create Category'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default CategoryForm;
