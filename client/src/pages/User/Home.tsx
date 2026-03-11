import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "../../assets/Logo.png";
import { useSettings } from '../../context/SettingsContext';

// --- MOCK DATA ---
// In a real app, this would come from your API/Backend.
const MOCK_PRODUCTS = [
  { id: 1, name: "Sony Alpha a7 IV", category: "Electronics", price: 2498.00, dateAdded: "2023-10-01", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 2, name: "Apple AirPods Max", category: "Audio", price: 549.00, dateAdded: "2023-09-15", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 3, name: "Minimalist Desk Lamp", category: "Home", price: 89.99, dateAdded: "2023-10-10", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 4, name: "Keychron K2 Keyboard", category: "Accessories", price: 99.00, dateAdded: "2023-08-20", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 5, name: "Nike Air Force 1", category: "Fashion", price: 110.00, dateAdded: "2023-10-05", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 6, name: "Samsung Odyssey G9", category: "Electronics", price: 1399.99, dateAdded: "2023-09-28", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 7, name: "Yeti Rambler Tumbler", category: "Home", price: 35.00, dateAdded: "2023-10-12", image: "https://images.unsplash.com/photo-1614316164223-9114d5fb5073?auto=format&fit=crop&q=80&w=400&h=400" },
  { id: 8, name: "Leather Messenger Bag", category: "Fashion", price: 145.00, dateAdded: "2023-07-15", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400&h=400" },
];

const HomePage: React.FC = () => {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { storeName } = useSettings();

  // Reusable Styles
  const primeButtonStyle = {
    background: 'var(--prime-gradient)',
    border: 'none',
    boxShadow: 'var(--prime-shadow)',
    color: 'white',
    transition: 'all 0.3s ease'
  };

  const primeTextStyle = { color: 'var(--prime-deep)' };

  // --- FILTER & SORT LOGIC ---
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter by search term
    let result = MOCK_PRODUCTS.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort the filtered results
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Sort by date added (newest first)
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }

    return result;
  }, [searchTerm, sortBy]);

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--prime-bg-soft)' }}>
      
      {/* --- TOP NAVBAR --- */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-3" style={{ borderBottom: '1px solid var(--prime-border)' }}>
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img src={Logo} alt={`${storeName} Logo`} width="35" className="me-2" />
            <span className="h4 fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>{storeName}</span>
          </a>
          
          <div className="d-flex align-items-center gap-3">
            <span className="fw-medium text-muted d-none d-md-block">Welcome, Guest</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--prime-gradient)', color: 'white' }} className="d-flex align-items-center justify-content-center fw-bold shadow-sm cursor-pointer">
              G
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="container py-5">
        
        {/* Page Header & Controls */}
        <div className="row align-items-end mb-5 gap-3 gap-md-0">
          <div className="col-md-5">
            <h1 className="fw-bold mb-2 text-dark" style={{ letterSpacing: '-1px' }}>Featured Collection</h1>
            <p className="text-muted mb-0">Discover our latest and greatest products.</p>
          </div>
          
          {/* Controls: Search and Sort */}
          <div className="col-md-7 d-flex flex-column flex-sm-row justify-content-md-end gap-3">
            {/* Search Bar */}
            <div className="position-relative" style={{ flex: '1', maxWidth: '350px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '15px' }}>
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="form-control form-control-lg shadow-none fs-6" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '45px', border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
              />
            </div>

            {/* Sort Dropdown */}
            <select 
              className="form-select form-select-lg shadow-none fs-6" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px', width: 'auto', minWidth: '180px', cursor: 'pointer' }}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* --- PRODUCT GRID --- */}
        <motion.div layout className="row g-4">
          <AnimatePresence>
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <motion.div 
                  layout // This animates the sorting re-ordering magically
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="col-12 col-sm-6 col-lg-4 col-xl-3" 
                  key={product.id}
                >
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    
                    {/* Image Container */}
                    <div className="position-relative bg-light" style={{ height: '240px' }}>
                      <img src={product.image} alt={product.name} className="w-100 h-100 object-fit-cover" />
                      {/* Badge */}
                      <span className="badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-medium" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--prime-deep)', backdropFilter: 'blur(4px)' }}>
                        {product.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="card-body d-flex flex-column p-4">
                      <h5 className="fw-bold mb-1 text-truncate" title={product.name}>{product.name}</h5>
                      <p className="text-muted small mb-3 flex-grow-1">Added {new Date(product.dateAdded).toLocaleDateString()}</p>
                      
                      <div className="d-flex align-items-center justify-content-between mt-auto">
                        <span className="h5 fw-bold mb-0" style={primeTextStyle}>
                          ${product.price.toFixed(2)}
                        </span>
                        
                        <motion.button 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', ...primeButtonStyle }}
                        >
                          {/* Cart Plus Icon */}
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="12" y1="10" x2="16" y2="10"></line><line x1="14" y1="8" x2="14" y2="12"></line></svg>
                        </motion.button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))
            ) : (
              // Empty State (When search finds nothing)
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="col-12 text-center py-5"
              >
                <div className="p-5 bg-white rounded-5 shadow-sm border" style={{ borderColor: 'var(--prime-border)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted mb-3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <h3 className="fw-bold text-dark">No products found</h3>
                  <p className="text-muted mb-0">Try adjusting your search to find what you're looking for.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
      </div>
    </div>
  );
};

export default HomePage;