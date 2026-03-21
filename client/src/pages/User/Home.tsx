import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../services/storefront/productService";
import type { StorefrontProduct } from "../../services/storefront/productService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const HERO_SLIDES = [
  { id: 1, title: "Welcome to PrimeHive", subtitle: "Discover amazing products curated just for you.", bg: "linear-gradient(135deg, #FF8C42 0%, #FF6B2B 100%)" },
  { id: 2, title: "New Arrivals", subtitle: "Check out the latest trends and items added this week.", bg: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" },
  { id: 3, title: "Exclusive Offers", subtitle: "Sign in today for special discounts and member perks.", bg: "linear-gradient(135deg, #EC4899 0%, #E11D48 100%)" },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const isCustomer = isAuthenticated && user?.role === "user";

  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getProducts({
        page,
        limit: 24,
        sort: "newest", // default sort since UI control is removed
      });
      // Filter out products that are out of stock
      const inStockProducts = result.data.filter(p => p.stock > 0);
      setProducts(inStockProducts);
      setTotalPages(result.pagination.totalPages);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (e: React.MouseEvent, product: StorefrontProduct) => {
    e.stopPropagation();
    if (!isCustomer) return;
    if (product.stock < 1) return;
    setAddingId(product._id);
    try {
      await addItem(product._id, product.name, product.price, product.images?.[0] || "", product.stock);
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, product: StorefrontProduct) => {
    e.stopPropagation();
    if (!isCustomer) return;
    if (product.stock < 1) return;
    setBuyingId(product._id);
    try {
      await addItem(product._id, product.name, product.price, product.images?.[0] || "", product.stock);
      navigate("/checkout");
    } finally {
      setBuyingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const getDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="container py-xl-4 py-3">
      
      {/* Hero Slideshow */}
      <div className="position-relative overflow-hidden mb-5 rounded-4 shadow-sm" style={{ height: "450px", background: "#333" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center px-4"
            style={{ background: HERO_SLIDES[currentSlide].bg, color: "#fff" }}
          >
            <h1 className="fw-black mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-1px" }}>
              {HERO_SLIDES[currentSlide].title}
            </h1>
            <p className="fs-5 opacity-75 fw-medium m-0" style={{ maxWidth: 600 }}>
              {HERO_SLIDES[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <button 
          className="btn position-absolute top-50 start-0 translate-middle-y text-white border-0" 
          onClick={() => setCurrentSlide(s => (s === 0 ? HERO_SLIDES.length - 1 : s - 1))}
        >
          <ChevronLeft size={40} />
        </button>
        <button 
          className="btn position-absolute top-50 end-0 translate-middle-y text-white border-0" 
          onClick={() => setCurrentSlide(s => (s + 1) % HERO_SLIDES.length)}
        >
          <ChevronRight size={40} />
        </button>

        {/* Indicators */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className="rounded-pill transition-all"
              style={{ 
                width: currentSlide === i ? 24 : 10, 
                height: 10, 
                background: "white", 
                opacity: currentSlide === i ? 1 : 0.5,
                cursor: "pointer"
              }} 
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert rounded-4 border-0 mb-5 shadow-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Product Grid Area */}
      <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
        <h3 className="fw-black text-dark m-0 d-flex align-items-center gap-2">
          <Zap size={24} style={{ color: "var(--prime-orange)" }} /> Shop All Products
        </h3>
      </div>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card" style={{ minHeight: 340, opacity: 0.6 }}>
              <div className="product-card-image" style={{ background: "#f0f0f2", animation: "pulse 1.5s infinite" }} />
              <div className="product-card-body">
                <div className="rounded mb-2" style={{ height: 12, background: "#f0f0f2", width: "60%" }} />
                <div className="rounded mb-3" style={{ height: 18, background: "#f0f0f2", width: "80%" }} />
                <div className="rounded" style={{ height: 14, background: "#f0f0f2", width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state-container bg-white rounded-5 shadow-sm border py-5 my-4">
          <div className="empty-state-icon" style={{ background: "transparent" }}>
            <ShoppingCart size={48} style={{ color: "var(--prime-orange)" }} />
          </div>
          <h3 className="fw-black text-dark mb-2">No products found</h3>
          <p className="text-muted fs-5">We couldn't find any in-stock products.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const discount = getDiscount(product.price, product.comparePrice);
            return (
              <div
                key={product._id}
                className="product-card"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="product-card-image">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f0f2" }}>
                      <ShoppingCart size={32} style={{ color: "#ccc" }} />
                    </div>
                  )}
                  {discount && (
                    <span
                      className="position-absolute m-3 badge rounded-pill shadow-sm"
                      style={{ top: 0, right: 0, background: "var(--prime-gradient)", fontSize: "0.75rem", padding: "6px 10px" }}
                    >
                      -{discount}%
                    </span>
                  )}
                </div>

                <div className="product-card-body pt-3">
                  <div className="card-name fw-bold" style={{ fontSize: "1.15rem" }}>{product.name}</div>

                  <div className="product-card-price mt-2 mb-3">
                    <span className="current-price fs-4">{formatPrice(product.price)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="compare-price">{formatPrice(product.comparePrice)}</span>
                    )}
                  </div>
                </div>

                {/* Action tray for Customers solely */}
                {isCustomer && (
                  <div className="card-action-tray backdrop-blur">
                    <div className="d-flex w-100 gap-2">
                      <button
                        className="btn rounded-pill fw-bold d-flex flex-grow-1 align-items-center justify-content-center gap-2 bg-white"
                        style={{ border: "2px solid #e8e8e8", fontSize: "0.85rem", color: "#333", padding: "10px 0" }}
                        disabled={addingId === product._id}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {addingId === product._id ? <span className="spinner-border spinner-border-sm" /> : <ShoppingCart size={16} />}
                      </button>
                      <button
                        className="btn rounded-pill fw-bold text-white d-flex flex-grow-1 align-items-center justify-content-center gap-2 shadow-sm"
                        style={{ background: "var(--prime-gradient)", border: "none", fontSize: "0.9rem", padding: "10px 0" }}
                        disabled={buyingId === product._id}
                        onClick={(e) => handleBuyNow(e, product)}
                      >
                        {buyingId === product._id ? <span className="spinner-border spinner-border-sm" /> : <Zap size={16} />} Buy Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-5 pt-4">
          <button
            className="btn btn-sm rounded-pill px-4 py-2 fw-bold"
            style={{ border: "2px solid #e8e8e8", background: "#fff", transition: "all 0.2s" }}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span className="fw-bold px-3 py-2 bg-light rounded-pill border mx-2">Page {page} of {totalPages}</span>
          <button
            className="btn btn-sm rounded-pill px-4 py-2 fw-bold"
            style={{ border: "2px solid #e8e8e8", background: "#fff", transition: "all 0.2s" }}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
