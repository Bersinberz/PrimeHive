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

const ProductManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    sku: '',
    stock: '',
  });

  // Images state (multiple files)
  const [images, setImages] = useState<File[]>([]);

  // Fetch products when component mounts or after any change
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchProducts();
    }
  }, [view]);

  // Reset form when switching to add view (clear editing state)
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      sku: '',
      stock: '',
    });
    setImages([]);
    setEditingProductId(null);
  };

  // Handle edit button click
  const handleEdit = async (product: Product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      category: product.category,
      sku: product.sku,
      stock: product.stock.toString(),
    });
    // For simplicity, we don't load existing images.
    // In a real app you'd display them and allow adding/removing.
    setImages([]);
    setView('add');
  };

  // Handle delete with confirmation
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // --- Image Handling ---
  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Form Input Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Save Product (Create or Update) ---
  const handleSaveProduct = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.category ||
      images.length === 0
    ) {
      console.warn('Please fill all required fields and add at least one image.');
      return;
    }

    setIsSaving(true);

    try {
      const payload: CreateProductPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        category: formData.category,
        sku: formData.sku,
        stock: parseInt(formData.stock) || 0,
        images,
      };

      if (editingProductId) {
        // Update existing product
        const response = await updateProduct(editingProductId, payload);
        console.log('Product updated successfully:', response);
      } else {
        // Create new product
        const response = await createProduct(payload);
        console.log('Product created successfully:', response);
      }

      // Reset form and go back to list
      resetForm();
      setView('list');
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Page variants for animation
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      {/* Dynamic Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>
            {view === 'list' ? 'Product Inventory' : editingProductId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-muted mb-0">
            {view === 'list'
              ? 'Manage your catalog, pricing, and stock levels.'
              : editingProductId
              ? 'Update the product details.'
              : 'Create a new listing for your store.'}
          </p>
        </div>
        <div>
          {view === 'list' ? (
            <button
              onClick={() => {
                resetForm();
                setView('add');
              }}
              className="btn text-white fw-bold shadow-sm px-4 py-2 border-0"
              style={{
                background:
                  'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))',
                borderRadius: '10px',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Product
            </button>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setView('list');
              }}
              className="btn bg-white text-dark fw-bold shadow-sm px-4 py-2"
              style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-2"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Catalog
            </button>
          )}
        </div>
      </div>

      {/* Form / List Toggle Area */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="card border-0 shadow-sm bg-white overflow-hidden"
            style={{ borderRadius: '16px' }}
          >
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive p-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light bg-opacity-50">
                    <tr>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">
                        Product
                      </th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">
                        Category
                      </th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">
                        Price
                      </th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">
                        Stock
                      </th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">
                        Status
                      </th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      // Determine status based on stock
                      const status =
                        p.stock > 10
                          ? 'In Stock'
                          : p.stock > 0
                          ? 'Low Stock'
                          : 'Out of Stock';
                      return (
                        <tr key={p._id}>
                          <td className="py-3 px-4 border-light">
                            <div className="d-flex align-items-center">
                              {p.images && p.images.length > 0 && (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="rounded-3 me-3 border border-light shadow-sm"
                                  width="48"
                                  height="48"
                                  style={{ objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <span className="fw-bold text-dark d-block">{p.name}</span>
                                <small className="text-muted">{p._id}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 border-light fw-medium text-secondary">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 border-light fw-bold text-dark">
                            ₹{p.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 border-light fw-medium text-secondary">
                            {p.stock} units
                          </td>
                          <td className="py-3 px-4 border-light">
                            <span
                              className={`badge rounded-pill px-3 py-2 fw-bold 
                              ${
                                status === 'In Stock'
                                  ? 'bg-success bg-opacity-10 text-success'
                                  : status === 'Low Stock'
                                  ? 'bg-warning bg-opacity-10 text-warning'
                                  : 'bg-danger bg-opacity-10 text-danger'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-light text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                className="btn btn-sm btn-light rounded-3 p-2 text-primary border-0"
                                title="Edit"
                                onClick={() => handleEdit(p)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                              </button>
                              <button
                                className="btn btn-sm btn-light rounded-3 p-2 text-danger border-0"
                                title="Delete"
                                onClick={() => handleDelete(p._id)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="add"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="row g-4"
          >
            {/* Left Column - Main Details */}
            <div className="col-12 col-xl-8">
              <div
                className="card border-0 shadow-sm bg-white p-4 p-md-5 h-100"
                style={{ borderRadius: '16px' }}
              >
                <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">
                  {editingProductId ? 'Edit Product' : 'Basic Information'}
                </h5>
                <form className="row g-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium"
                      placeholder="e.g. Wireless Noise-Canceling Headphones"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control border-light bg-light rounded-3 shadow-none fw-medium"
                      rows={5}
                      placeholder="Describe the product, features, and benefits..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      Price (₹) *
                    </label>
                    <div className="input-group input-group-lg border-light bg-light rounded-3 overflow-hidden">
                      <span className="input-group-text border-0 bg-transparent text-muted fw-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="form-control border-0 bg-transparent shadow-none fw-medium"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      Compare-at Price (₹)
                    </label>
                    <div className="input-group input-group-lg border-light bg-light rounded-3 overflow-hidden">
                      <span className="input-group-text border-0 bg-transparent text-muted fw-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="comparePrice"
                        value={formData.comparePrice}
                        onChange={handleInputChange}
                        className="form-control border-0 bg-transparent shadow-none fw-medium text-decoration-line-through text-muted"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Media & Organization */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Media *</h5>
                {/* Drag & Drop Area */}
                <div
                  className="border-2 rounded-4 p-4 d-flex flex-column align-items-center justify-content-center text-center transition-all"
                  style={{
                    borderStyle: 'dashed',
                    borderColor: isDragging ? '#ff8c42' : '#cbd5e1',
                    backgroundColor: isDragging ? 'rgba(255, 140, 66, 0.05)' : '#f8fafc',
                    cursor: 'pointer',
                    minHeight: '200px',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleImageDrop}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <div className="p-3 bg-white rounded-circle shadow-sm mb-3 text-primary">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <h6 className="fw-bolder text-dark mb-1">Drag & Drop Images</h6>
                  <p className="small text-muted mb-0">or click to browse</p>
                  <span className="badge bg-light text-secondary mt-3 border">
                    Supports JPG, PNG (Max 5MB)
                  </span>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {images.map((file, index) => (
                      <div key={index} className="position-relative" style={{ width: '80px', height: '80px' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          className="rounded-3 w-100 h-100 object-fit-cover border border-light"
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 translate-middle p-1 border-0"
                          style={{ width: '24px', height: '24px', fontSize: '12px' }}
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {editingProductId && (
                  <p className="small text-muted mt-2">
                    Note: Existing images are not shown. Upload new images to replace or add.
                  </p>
                )}
              </div>

              <div
                className="card border-0 shadow-sm bg-white p-4 flex-grow-1"
                style={{ borderRadius: '16px' }}
              >
                <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Organization</h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium"
                      placeholder="e.g. Electronics, Fashion, etc."
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="form-control border-light bg-light rounded-3 shadow-none fw-medium"
                      placeholder="PRD-XXX"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="form-control border-light bg-light rounded-3 shadow-none fw-medium"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-12 mt-4 pt-4 border-top">
                    <button
                      type="button"
                      className="btn btn-dark w-100 fw-bold py-3 rounded-3 border-0 shadow-sm text-uppercase tracking-wider"
                      style={{ background: '#0f172a' }}
                      onClick={handleSaveProduct}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductManagement;