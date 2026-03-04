import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// --- Types ---
interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
}

const ProductManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [isDragging, setIsDragging] = useState(false);

  // Mock Data
  const [products] = useState<Product[]>([
    { id: 'PRD-001', name: 'Neural Headphones', category: 'Electronics', price: '$299.00', stock: 12, status: 'In Stock', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
    { id: 'PRD-002', name: 'Mechanical Keyboard v2', category: 'Accessories', price: '$149.50', stock: 4, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=100&h=100&fit=crop' },
    { id: 'PRD-003', name: 'Focus Timer Z', category: 'Office', price: '$45.00', stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' },
  ]);

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      {/* Dynamic Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>
            {view === 'list' ? 'Product Inventory' : 'Add New Product'}
          </h2>
          <p className="text-muted mb-0">
            {view === 'list' ? 'Manage your catalog, pricing, and stock levels.' : 'Create a new listing for your store.'}
          </p>
        </div>
        <div>
          {view === 'list' ? (
            <button 
              onClick={() => setView('add')}
              className="btn text-white fw-bold shadow-sm px-4 py-2 border-0" 
              style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', borderRadius: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Product
            </button>
          ) : (
            <button 
              onClick={() => setView('list')}
              className="btn bg-white text-dark fw-bold shadow-sm px-4 py-2" 
              style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
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
            <div className="table-responsive p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Product</th>
                    <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Category</th>
                    <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Price</th>
                    <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Stock</th>
                    <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Status</th>
                    <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 border-light">
                        <div className="d-flex align-items-center">
                          <img src={p.image} alt={p.name} className="rounded-3 me-3 border border-light shadow-sm" width="48" height="48" style={{ objectFit: 'cover' }} />
                          <div>
                            <span className="fw-bold text-dark d-block">{p.name}</span>
                            <small className="text-muted">{p.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-light fw-medium text-secondary">{p.category}</td>
                      <td className="py-3 px-4 border-light fw-bold text-dark">{p.price}</td>
                      <td className="py-3 px-4 border-light fw-medium text-secondary">{p.stock} units</td>
                      <td className="py-3 px-4 border-light">
                        <span className={`badge rounded-pill px-3 py-2 fw-bold 
                          ${p.status === 'In Stock' ? 'bg-success bg-opacity-10 text-success' : 
                            p.status === 'Low Stock' ? 'bg-warning bg-opacity-10 text-warning' : 
                            'bg-danger bg-opacity-10 text-danger'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-light text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-sm btn-light rounded-3 p-2 text-primary border-0" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button className="btn btn-sm btn-light rounded-3 p-2 text-danger border-0" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <div className="card border-0 shadow-sm bg-white p-4 p-md-5 h-100" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Basic Information</h5>
                <form className="row g-4">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Product Name</label>
                    <input type="text" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium" placeholder="e.g. Wireless Noise-Canceling Headphones" />
                  </div>
                  <div className="col-12 text-dark">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Description</label>
                    <textarea className="form-control border-light bg-light rounded-3 shadow-none fw-medium" rows={5} placeholder="Describe the product, features, and benefits..."></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Price ($)</label>
                    <div className="input-group input-group-lg border-light bg-light rounded-3 overflow-hidden">
                      <span className="input-group-text border-0 bg-transparent text-muted fw-bold">$</span>
                      <input type="number" className="form-control border-0 bg-transparent shadow-none fw-medium" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Compare-at Price ($)</label>
                    <div className="input-group input-group-lg border-light bg-light rounded-3 overflow-hidden">
                      <span className="input-group-text border-0 bg-transparent text-muted fw-bold">$</span>
                      <input type="number" className="form-control border-0 bg-transparent shadow-none fw-medium text-decoration-line-through text-muted" placeholder="0.00" />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Media & Organization */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Media</h5>
                <div 
                  className="border-2 rounded-4 p-4 d-flex flex-column align-items-center justify-content-center text-center transition-all" 
                  style={{ 
                    borderStyle: 'dashed',
                    borderColor: isDragging ? '#ff8c42' : '#cbd5e1', 
                    backgroundColor: isDragging ? 'rgba(255, 140, 66, 0.05)' : '#f8fafc',
                    cursor: 'pointer',
                    minHeight: '200px'
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Handle drop here */ }}
                >
                  <div className="p-3 bg-white rounded-circle shadow-sm mb-3 text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <h6 className="fw-bolder text-dark mb-1">Drag & Drop Images</h6>
                  <p className="small text-muted mb-0">or click to browse</p>
                  <span className="badge bg-light text-secondary mt-3 border">Supports JPG, PNG (Max 5MB)</span>
                </div>
              </div>

              <div className="card border-0 shadow-sm bg-white p-4 flex-grow-1" style={{ borderRadius: '16px' }}>
                <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Organization</h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Category</label>
                    <select className="form-select form-select-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark">
                      <option>Electronics</option>
                      <option>Accessories</option>
                      <option>Apparel</option>
                      <option>Software</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">SKU</label>
                    <input type="text" className="form-control border-light bg-light rounded-3 shadow-none fw-medium" placeholder="PRD-XXX" />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Stock</label>
                    <input type="number" className="form-control border-light bg-light rounded-3 shadow-none fw-medium" placeholder="0" />
                  </div>
                  <div className="col-12 mt-4 pt-4 border-top">
                    <button type="button" className="btn btn-dark w-100 fw-bold py-3 rounded-3 border-0 shadow-sm text-uppercase tracking-wider" style={{ background: '#0f172a' }}>
                      Save Product
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