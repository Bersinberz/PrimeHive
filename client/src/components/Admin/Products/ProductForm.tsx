import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { CreateProductPayload, Product } from '../../../services/admin/productService';
import { getCategories, type Category } from '../../../services/admin/categoryService';

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  comparePrice?: string;
  category?: string;
  sku?: string;
  stock?: string;
  images?: string;
}

interface ProductFormProps {
  initialData: Product | null;
  isSaving: boolean;
  onSave: (payload: CreateProductPayload, id?: string) => Promise<void>;
  onCancel: () => void;
  showToast: (msg: { type: 'error'; title: string; message: string }) => void;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isSaving, onSave, onCancel, showToast }) => {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => { });
  }, []);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    comparePrice: initialData?.comparePrice?.toString() || '',
    category: initialData?.category || '',
    sku: initialData?.sku || '',
    stock: initialData?.stock?.toString() || '',
  });

  // Safely generate and cleanup preview URLs whenever `images` state changes
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setImagePreviews(urls);

    // Cleanup function to prevent memory leaks
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Ensure our live preview index doesn't go out of bounds if we delete an image
  const displayImages = imagePreviews.length > 0 ? imagePreviews : (initialData?.images || []);
  useEffect(() => {
    if (currentPreviewIndex >= displayImages.length && displayImages.length > 0) {
      setCurrentPreviewIndex(displayImages.length - 1);
    } else if (displayImages.length === 0) {
      setCurrentPreviewIndex(0);
    }
  }, [displayImages.length, currentPreviewIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length) {
      setImages(prev => [...prev, ...files]);
      setFormErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
      setFormErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setImages(prev => {
      const newImages = [...prev];
      const temp = newImages[index];
      newImages[index] = newImages[newIndex];
      newImages[newIndex] = temp;
      return newImages;
    });
  };

  const validateField = (name: keyof FormErrors, value: string | File[]) => {
    let error: string | undefined = undefined;

    switch (name) {
      case 'name':
        if (!value || typeof value !== 'string' || value.trim().length < 3) {
          error = 'Product name must be at least 3 characters.';
        }
        break;
      case 'price':
        if (!value || isNaN(parseFloat(value as string)) || parseFloat(value as string) < 0) {
          error = 'Please enter a valid price (≥ 0).';
        }
        break;
      case 'comparePrice':
        if (value && (isNaN(parseFloat(value as string)) || parseFloat(value as string) < 0)) {
          error = 'Please enter a valid compare price.';
        } else if (value && formData.price && parseFloat(value as string) < parseFloat(formData.price)) {
          error = 'Compare price should be ≥ regular price.';
        }
        break;
      case 'category':
        if (!value || typeof value !== 'string' || !value.trim()) {
          error = 'Please select a category.';
        }
        break;
      case 'stock':
        if (!value || isNaN(parseInt(value as string)) || parseInt(value as string) < 0) {
          error = 'Stock must be a valid number (≥ 0).';
        }
        break;
      case 'images':
        if (!initialData && (!value || (value as File[]).length === 0)) {
          error = 'At least one image is required for a new product.';
        }
        break;
    }
    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormErrors, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const fieldsToValidate: (keyof typeof formData)[] = ['name', 'price', 'comparePrice', 'category', 'stock'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field as keyof FormErrors, formData[field]);
      if (error) errors[field as keyof FormErrors] = error;
    });

    const imgError = validateField('images', images);
    if (imgError) errors.images = imgError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Please correct the highlighted errors before publishing.' });
      return;
    }
    setFormErrors({});
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : ('' as any),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        category: formData.category.trim(),
        sku: formData.sku,
        stock: formData.stock ? parseInt(formData.stock) : ('' as any),
        images,
      }, initialData?._id);
    } catch (error: any) {
      if (error?.status === 400 && error?.errors) {
        const backendErrors: FormErrors = {};
        error.errors.forEach((err: { field: string; message: string }) => {
          backendErrors[err.field as keyof FormErrors] = err.message;
        });
        setFormErrors(backendErrors);
        const errorMessages = error.errors.map((err: { field: string; message: string }) => err.message);
        showToast({ type: 'error', title: 'Validation Error', message: errorMessages.join(', ') });
      } else {
        showToast({ type: 'error', title: 'Save Failed', message: error?.message || 'Failed to save product.' });
      }
    }
  };

  // Preview values
  const previewPrice = formData.price ? parseFloat(formData.price) : 0;
  const previewCompare = formData.comparePrice ? parseFloat(formData.comparePrice) : 0;
  const previewDiscount = previewCompare > previewPrice
    ? Math.round(((previewCompare - previewPrice) / previewCompare) * 100)
    : null;
  const previewStock = formData.stock ? parseInt(formData.stock) : 0;
  const previewStockLevel = previewStock > 10 ? 'high' : previewStock > 0 ? 'medium' : 'low';
  const previewStockPercent = Math.min((previewStock / 100) * 100, 100);
  const previewStatus = previewStock > 10 ? 'In Stock' : previewStock > 0 ? 'Low Stock' : 'Out of Stock';
  const previewStatusClass = previewStock > 10 ? 'in-stock' : previewStock > 0 ? 'low-stock' : 'out-of-stock';

  return (
    <div className="split-form-container">
      {/* ── Left Panel: Form ── */}
      <div className="form-panel">
        <form onSubmit={e => e.preventDefault()}>
          {/* Section: Basic Info */}
          <motion.div className="form-section" variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
            <div className="form-section-title">
              <div className="section-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              Basic Information
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={`floating-input ${formErrors.name ? 'has-error' : ''}`}>
                <label>Product Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g. Wireless Noise-Canceling Headphones" />
                {formErrors.name && <div className="field-error">{formErrors.name}</div>}
              </div>
              <div className={`floating-input ${formErrors.description ? 'has-error' : ''}`}>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} onBlur={handleBlur} rows={4} placeholder="Describe the product features and benefits..." style={{ resize: 'vertical' }} />
                {formErrors.description && <div className="field-error">{formErrors.description}</div>}
              </div>
            </div>
          </motion.div>

          {/* Section: Pricing */}
          <motion.div className="form-section" variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
            <div className="form-section-title">
              <div className="section-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              Pricing
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={`floating-input ${formErrors.price ? 'has-error' : ''}`}>
                <label>Price (₹) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} onBlur={handleBlur} placeholder="0.00" step="0.01" min="0" />
                {formErrors.price && <div className="field-error">{formErrors.price}</div>}
              </div>
              <div className={`floating-input ${formErrors.comparePrice ? 'has-error' : ''}`}>
                <label>Compare-at Price (₹)</label>
                <input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleInputChange} onBlur={handleBlur} placeholder="0.00" step="0.01" min="0" />
                {formErrors.comparePrice && <div className="field-error">{formErrors.comparePrice}</div>}
              </div>
            </div>
          </motion.div>

          {/* Section: Media */}
          <motion.div className="form-section" variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
            <div className="form-section-title">
              <div className="section-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              Media {!initialData && '*'}
            </div>
            <div
              style={{
                border: `2px dashed ${formErrors.images ? '#ef4444' : isDragging ? 'var(--prime-orange)' : '#e0e0e0'}`,
                borderRadius: '16px',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'rgba(255, 140, 66, 0.03)' : '#fafafa',
                transition: 'all 0.3s ease',
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--prime-orange)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '4px', fontSize: '0.95rem' }}>
                Drag & Drop or Click to Upload
              </p>
              <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>
                JPG, PNG — Max 5MB, up to 5 images
              </p>
            </div>
            {formErrors.images && <div className="field-error" style={{ marginTop: '8px' }}>{formErrors.images}</div>}
            <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

            {imagePreviews.length > 0 && (
              <div className="upload-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                {imagePreviews.map((url, index) => (
                  <div key={index} className="upload-thumb" style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* Reorder and Delete Controls */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', padding: '4px', backdropFilter: 'blur(2px)' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveImage(index, 'left'); }}
                        disabled={index === 0}
                        style={{ background: 'none', border: 'none', color: index === 0 ? '#666' : '#fff', cursor: index === 0 ? 'default' : 'pointer', padding: 0 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>

                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeImage(index); }}
                        style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveImage(index, 'right'); }}
                        disabled={index === imagePreviews.length - 1}
                        style={{ background: 'none', border: 'none', color: index === imagePreviews.length - 1 ? '#666' : '#fff', cursor: index === imagePreviews.length - 1 ? 'default' : 'pointer', padding: 0 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {initialData && (
              <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '12px', background: '#f7f7f8', fontSize: '0.82rem', color: '#888' }}>
                <strong style={{ color: '#555' }}>Note:</strong> Existing images are preserved if you don't upload new ones.
              </div>
            )}
          </motion.div>

          {/* Section: Organization */}
          <motion.div className="form-section" variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
            <div className="form-section-title">
              <div className="section-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              Organization
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={`floating-input ${formErrors.category ? 'has-error' : ''}`}>
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} onBlur={handleBlur}>
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.category && <div className="field-error">{formErrors.category}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={`floating-input ${formErrors.sku ? 'has-error' : ''}`}>
                  <label>SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} onBlur={handleBlur} placeholder="PRD-XXX" />
                  {formErrors.sku && <div className="field-error">{formErrors.sku}</div>}
                </div>
                <div className={`floating-input ${formErrors.stock ? 'has-error' : ''}`}>
                  <label>Stock *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} onBlur={handleBlur} placeholder="0" min="0" />
                  {formErrors.stock && <div className="field-error">{formErrors.stock}</div>}
                </div>
              </div>
            </div>
          </motion.div>
        </form>

        {/* Form Actions */}
        <div className="form-footer" style={{ margin: '-32px', marginTop: '0', padding: '20px 32px', borderRadius: 0 }}>
          <span style={{ marginRight: 'auto', fontSize: '0.8rem', color: '#aaa', fontWeight: 500 }}>
            * Required fields
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              padding: '12px 28px',
              borderRadius: '14px',
              border: '1.5px solid #e8e8e8',
              background: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#555',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFormSubmit}
            disabled={isSaving}
            style={{
              padding: '12px 32px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--prime-gradient)',
              boxShadow: '0 4px 20px rgba(255, 107, 43, 0.25)',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: '#fff',
              cursor: 'pointer',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {initialData ? 'Update Product' : 'Publish Product'}
          </motion.button>
        </div>
      </div>

      {/* ── Right Panel: Live Preview ── */}
      <motion.div
        className="preview-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#aaa', marginBottom: '12px', paddingLeft: '4px' }}>
          Live Preview
        </div>
        <div className="preview-card">
          <div className="preview-image" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {displayImages.length > 0 ? (
              <>
                {/* Main large image */}
                <div style={{ width: '100%', height: '240px', background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={displayImages[currentPreviewIndex]} alt="Preview Main" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                {/* Thumbnail selector row (only shows if > 1 image) */}
                {displayImages.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px', paddingBottom: '4px' }}>
                    {displayImages.map((src, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentPreviewIndex(idx)}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          flexShrink: 0,
                          border: currentPreviewIndex === idx ? '2px solid var(--prime-orange)' : '2px solid transparent',
                          opacity: currentPreviewIndex === idx ? 1 : 0.6,
                          transition: 'all 0.2s'
                        }}
                      >
                        <img src={src} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}

            {formData.stock && (
              <span className={`status-badge ${previewStatusClass}`} style={{ position: 'absolute', top: '12px', left: '12px' }}>
                {previewStatus}
              </span>
            )}
          </div>
          <div className="preview-body" style={{ marginTop: displayImages.length > 1 ? '16px' : '0' }}>
            <div className="card-category" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1px', color: 'var(--prime-orange)', marginBottom: '6px' }}>
              {formData.category || 'Category'}
            </div>
            <div className="card-name" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '4px', lineHeight: 1.3 }}>
              {formData.name || 'Product Name'}
            </div>
            {formData.description && (
              <p style={{ fontSize: '0.8rem', color: '#999', lineHeight: 1.5, margin: '8px 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {formData.description}
              </p>
            )}
            <div className="product-card-price" style={{ marginBottom: '14px' }}>
              <span className="current-price">₹{previewPrice ? previewPrice.toFixed(2) : '0.00'}</span>
              {previewCompare > previewPrice && (
                <span className="compare-price">₹{previewCompare.toFixed(2)}</span>
              )}
              {previewDiscount && <span className="discount-tag">-{previewDiscount}%</span>}
            </div>
            <div className="stock-info">
              <span className="stock-label">Stock</span>
              <span className="stock-count">{previewStock} units</span>
            </div>
            <div className="stock-bar">
              <motion.div
                className={`stock-bar-fill ${previewStockLevel}`}
                animate={{ width: `${previewStockPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductForm;