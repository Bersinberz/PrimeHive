import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { CreateProductPayload, Product } from '../../../services/Admin/productService';
import { getCategories, type Category } from '../../../services/Admin/categoryService';

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

type TabType = 'basic' | 'media' | 'organization';

interface ProductFormProps {
  initialData: Product | null;
  isSaving: boolean;
  onSave: (payload: CreateProductPayload, id?: string) => Promise<void>;
  onCancel: () => void;
  showToast: (msg: { type: 'error'; title: string; message: string }) => void;
}

const tabContentVariants: Variants = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.2 } },
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isSaving, onSave, onCancel, showToast }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const blobUrlsRef = useRef<string[]>([]);
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

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, [images]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
    if (files.length) {
      setImages((prev) => [...prev, ...files]);
      setFormErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      setFormErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const createPreviewUrl = (file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.push(url);
    return url;
  };

  const handleFormSubmit = async () => {
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

        // Navigate to the tab with the first error
        if (backendErrors.name || backendErrors.description || backendErrors.price || backendErrors.comparePrice) {
          setActiveTab('basic');
        } else if (backendErrors.images) {
          setActiveTab('media');
        } else if (backendErrors.category || backendErrors.sku || backendErrors.stock) {
          setActiveTab('organization');
        }
        // Build a user-friendly toast from the specific field errors
        const errorMessages = error.errors.map((err: { field: string; message: string }) => err.message);
        showToast({ type: 'error', title: 'Save Failed', message: errorMessages.join(', ') });
      } else {
        showToast({ type: 'error', title: 'Save Failed', message: error?.message || 'Failed to save product.' });
      }
    }
  };

  const fieldClass = (field: keyof FormErrors) => `form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium ${formErrors[field] ? 'border-danger' : ''}`;

  const hasBasicErrors = !!(formErrors.name || formErrors.description || formErrors.price || formErrors.comparePrice);
  const hasMediaErrors = !!formErrors.images;
  const hasOrgErrors = !!(formErrors.category || formErrors.sku || formErrors.stock);

  return (
    <>
      <div className="bg-light bg-opacity-50 pt-3 px-4 border-bottom d-flex gap-4">
        <button className={`btn fw-bolder px-2 py-3 border-0 rounded-0 position-relative ${activeTab === 'basic' ? 'text-dark' : 'text-muted'}`} style={{ background: 'transparent' }} onClick={() => setActiveTab('basic')}>
          Basic Information
          {hasBasicErrors && <span className="position-absolute top-25 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>}
          {activeTab === 'basic' && <motion.div layoutId="activeTabIndicator" className="position-absolute bottom-0 start-0 end-0" style={{ height: '3px', background: 'var(--prime-gradient)', borderRadius: '3px 3px 0 0' }} />}
        </button>
        <button className={`btn fw-bolder px-2 py-3 border-0 rounded-0 position-relative ${activeTab === 'media' ? 'text-dark' : 'text-muted'}`} style={{ background: 'transparent' }} onClick={() => setActiveTab('media')}>
          Media Center
          {hasMediaErrors && <span className="position-absolute top-25 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>}
          {activeTab === 'media' && <motion.div layoutId="activeTabIndicator" className="position-absolute bottom-0 start-0 end-0" style={{ height: '3px', background: 'var(--prime-gradient)', borderRadius: '3px 3px 0 0' }} />}
        </button>
        <button className={`btn fw-bolder px-2 py-3 border-0 rounded-0 position-relative ${activeTab === 'organization' ? 'text-dark' : 'text-muted'}`} style={{ background: 'transparent' }} onClick={() => setActiveTab('organization')}>
          Organization
          {hasOrgErrors && <span className="position-absolute top-25 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>}
          {activeTab === 'organization' && <motion.div layoutId="activeTabIndicator" className="position-absolute bottom-0 start-0 end-0" style={{ height: '3px', background: 'var(--prime-gradient)', borderRadius: '3px 3px 0 0' }} />}
        </button>
      </div>

      <div className="p-4 p-md-5">
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div key="basic" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="row g-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={fieldClass('name')} placeholder="e.g. Wireless Noise-Canceling Headphones" required />
                  {formErrors.name && <small className="text-danger mt-1 d-block">{formErrors.name}</small>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className={`form-control border-light bg-light rounded-3 shadow-none fw-medium ${formErrors.description ? 'border-danger' : ''}`} rows={6} placeholder="Describe the product, features, and benefits..." />
                  {formErrors.description && <small className="text-danger mt-1 d-block">{formErrors.description}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Price (₹) *</label>
                  <div className={`input-group input-group-lg border-light bg-light rounded-3 overflow-hidden ${formErrors.price ? 'border-danger' : ''}`}>
                    <span className="input-group-text border-0 bg-transparent text-muted fw-bold">₹</span>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="form-control border-0 bg-transparent shadow-none fw-medium" placeholder="0.00" step="0.01" min="0" required />
                  </div>
                  {formErrors.price && <small className="text-danger mt-1 d-block">{formErrors.price}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Compare-at Price (₹)</label>
                  <div className={`input-group input-group-lg border-light bg-light rounded-3 overflow-hidden ${formErrors.comparePrice ? 'border-danger' : ''}`}>
                    <span className="input-group-text border-0 bg-transparent text-muted fw-bold">₹</span>
                    <input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleInputChange} className="form-control border-0 bg-transparent shadow-none fw-medium text-decoration-line-through text-muted" placeholder="0.00" step="0.01" min="0" />
                  </div>
                  {formErrors.comparePrice && <small className="text-danger mt-1 d-block">{formErrors.comparePrice}</small>}
                </div>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div key="media" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="row g-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Upload Media {!initialData && '*'}</label>
                  <div
                    className={`border-2 rounded-4 p-5 d-flex flex-column align-items-center justify-content-center text-center transition-all ${formErrors.images ? 'border-danger' : ''}`}
                    style={{ borderStyle: 'dashed', borderColor: formErrors.images ? '#dc3545' : isDragging ? 'var(--prime-orange)' : '#cbd5e1', backgroundColor: isDragging ? 'rgba(255, 140, 66, 0.05)' : '#f8fafc', cursor: 'pointer', minHeight: '300px' }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleImageDrop}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <div className="p-3 bg-white rounded-circle shadow-sm mb-3" style={{ color: 'var(--prime-orange)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    </div>
                    <h5 className="fw-bolder text-dark mb-1">Drag & Drop Images</h5>
                    <p className="text-muted mb-0">or click anywhere to browse your files</p>
                    <span className="badge bg-light text-secondary mt-3 px-3 py-2 border">Supports JPG, PNG (Max 5MB, up to 5 images)</span>
                  </div>
                  {formErrors.images && <small className="text-danger mt-2 d-block">{formErrors.images}</small>}
                  <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

                  {images.length > 0 && (
                    <div className="mt-4 d-flex flex-wrap gap-3">
                      {images.map((file, index) => (
                        <div key={index} className="position-relative" style={{ width: '120px', height: '120px' }}>
                          <img src={createPreviewUrl(file)} alt={`preview-${index}`} className="rounded-4 w-100 h-100 object-fit-cover border border-light shadow-sm" />
                          <button type="button" className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 translate-middle p-2 border-0 shadow" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); removeImage(index); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {initialData && (
                    <div className="alert bg-light mt-4 mb-0 border-0 text-muted small fw-medium">
                      <strong className="text-dark">Note:</strong> Existing product images are preserved automatically if you do not upload new ones.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'organization' && (
              <motion.div key="organization" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="row g-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={`form-select form-select-lg border-light bg-light rounded-3 shadow-none fw-medium ${formErrors.category ? 'border-danger' : ''}`} required>
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.category && <small className="text-danger mt-1 d-block">{formErrors.category}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">SKU (Stock Keeping Unit)</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className={fieldClass('sku')} placeholder="PRD-XXX" />
                  {formErrors.sku && <small className="text-danger mt-1 d-block">{formErrors.sku}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Available Stock *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className={fieldClass('stock')} placeholder="0" min="0" required />
                  {formErrors.stock && <small className="text-danger mt-1 d-block">{formErrors.stock}</small>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="card-footer bg-white border-top p-4 d-flex justify-content-end gap-3 align-items-center">
        <span className="text-muted small fw-medium me-auto d-none d-md-block">Ensure all required fields (*) are filled before saving.</span>
        <button type="button" onClick={onCancel} className="btn btn-light fw-bold px-5 py-3 rounded-3" disabled={isSaving}>Cancel</button>
        <button
          type="button"
          className="btn text-white fw-bolder px-5 py-3 rounded-3 border-0 transition-all"
          style={{
            background: 'var(--prime-gradient)',
            boxShadow: 'var(--prime-shadow)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onClick={handleFormSubmit}
        >
          {initialData ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </>
  );
};

export default ProductForm;