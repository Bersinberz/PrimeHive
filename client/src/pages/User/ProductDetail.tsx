import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowLeft, Package, Tag, Minus, Plus, Zap, LogIn, CheckCircle2, Store } from "lucide-react";
import { getProductById } from "../../services/storefront/productService";
import type { StorefrontProduct } from "../../services/storefront/productService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  const isCustomer = isAuthenticated && user?.role === "user";

  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then((p) => { setProduct(p); setSelectedImage(0); })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = async () => {
    if (!isCustomer) { navigate("/auth"); return; }
    if (!product || product.stock < 1) return;
    setAdding(true);
    try {
      await addItem(product._id, product.name, product.price, product.images?.[0] || "", product.stock, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isCustomer) { navigate("/auth"); return; }
    if (!product || product.stock < 1) return;
    setBuying(true);
    try {
      await addItem(product._id, product.name, product.price, product.images?.[0] || "", product.stock, quantity);
      navigate("/checkout");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row g-5 align-items-center">
          <div className="col-md-6">
            <div className="rounded-5 shadow-sm" style={{ height: 500, background: "#f5f5f7", animation: "pulse 1.5s infinite" }} />
          </div>
          <div className="col-md-6">
            <div className="rounded-pill mb-4" style={{ height: 20, background: "#f5f5f7", width: "40%", animation: "pulse 1.5s infinite" }} />
            <div className="rounded-4 mb-4" style={{ height: 40, background: "#f5f5f7", width: "80%", animation: "pulse 1.5s infinite" }} />
            <div className="rounded-4 mb-3" style={{ height: 20, background: "#f5f5f7", width: "60%", animation: "pulse 1.5s infinite" }} />
            <div className="rounded-4 mb-5" style={{ height: 20, background: "#f5f5f7", width: "70%", animation: "pulse 1.5s infinite" }} />
            <div className="rounded-4" style={{ height: 60, background: "#f5f5f7", width: "100%", animation: "pulse 1.5s infinite" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-5 text-center">
        <div className="bg-white rounded-5 shadow-sm py-5 px-4 my-5 mx-auto" style={{ maxWidth: 500, border: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="d-flex justify-content-center mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, background: "rgba(255, 140, 66, 0.1)" }}>
              <Package size={40} style={{ color: "var(--prime-orange)" }} />
            </div>
          </div>
          <h3 className="fw-black text-dark mb-3">Product Unavailable</h3>
          <p className="text-muted mb-4 fs-5">This product may have been removed or is temporarily unavailable.</p>
          <button className="btn rounded-pill px-5 py-3 fw-bold text-white shadow" style={{ background: "var(--prime-gradient)", border: "none" }} onClick={() => navigate("/")}>
             Back to Collection
          </button>
        </div>
      </motion.div>
    );
  }

  const outOfStock = product.stock < 1;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <div className="container py-4 py-xl-5">
      {/* Back navigation */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="btn btn-sm mb-4 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold" 
        style={{ border: "2px solid #e8e8e8", background: "#fff", color: "#555", transition: "all 0.2s" }}
        onClick={() => navigate(-1)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--prime-orange)"; e.currentTarget.style.color = "var(--prime-orange)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#555"; }}
      >
        <ArrowLeft size={16} /> Back to Browse
      </motion.button>

      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="row g-5 align-items-center"
      >
        {/* Images Column */}
        <motion.div variants={itemVariants} className="col-lg-6">
          <div className="position-relative">
            {discount && (
              <div 
                className="position-absolute z-2 py-2 px-3 badge rounded-pill shadow-lg"
                style={{ top: 20, right: 20, background: "var(--prime-gradient)", fontSize: "0.9rem" }}
              >
                Save {discount}%
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="rounded-5 overflow-hidden shadow-sm border mb-4"
                style={{ aspectRatio: "1/1", background: "#f9f9f9", position: "relative" }}
              >
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <ShoppingCart size={64} style={{ color: "#ddd" }} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="d-flex gap-3 overflow-auto pb-2 custom-scrollbar">
                {product.images.map((img, i) => (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="p-0 border-0 rounded-4 overflow-hidden position-relative"
                    style={{
                      width: 80, height: 80, flexShrink: 0,
                      outline: selectedImage === i ? "3px solid var(--prime-orange)" : "2px solid transparent",
                      outlineOffset: 2,
                      cursor: "pointer",
                      boxShadow: selectedImage === i ? "0 4px 12px rgba(255,140,66,0.2)" : "none"
                    }}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-100 h-100" style={{ objectFit: "cover" }} />
                    {selectedImage !== i && <div className="position-absolute top-0 start-0 w-100 h-100 bg-white" style={{ opacity: 0.3 }} />}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Details Column */}
        <div className="col-lg-6">
          <motion.div variants={itemVariants} className="d-flex align-items-center gap-2 mb-3">
            <span className="badge rounded-pill bg-light text-dark fw-bold px-3 py-2 border d-flex align-items-center gap-2" style={{ fontSize: "0.8rem", letterSpacing: 1 }}>
              <Tag size={14} style={{ color: "var(--prime-orange)" }} />
              {product.category.toUpperCase()}
            </span>
            {product.sellerName && (
              <span className="badge rounded-pill bg-light text-dark fw-bold px-3 py-2 border d-flex align-items-center gap-2" style={{ fontSize: "0.8rem" }}>
                <Store size={14} style={{ color: "#6366f1" }} />
                Sold by {product.sellerName}
              </span>
            )}
          </motion.div>

          <motion.h1 variants={itemVariants} className="fw-black mb-3 text-dark" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-1px" }}>
            {product.name}
          </motion.h1>

          {/* Price Layout */}
          <motion.div variants={itemVariants} className="d-flex align-items-end gap-3 mb-4 bg-light p-4 rounded-4 border">
            <div>
              <div className="text-muted fw-bold mb-1" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>Price</div>
              <span className="fw-black" style={{ fontSize: "2.5rem", color: "var(--prime-deep)", lineHeight: 1 }}>
                {formatPrice(product.price)}
              </span>
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="pb-1">
                <span className="text-muted text-decoration-line-through fw-semibold" style={{ fontSize: "1.2rem" }}>
                  {formatPrice(product.comparePrice)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Description */}
          {product.description && (
            <motion.p variants={itemVariants} className="text-secondary mb-4 fs-5" style={{ lineHeight: 1.6 }}>
              {product.description}
            </motion.p>
          )}

          {/* Stock Info */}
          <motion.div variants={itemVariants} className="mb-5">
            <div className={`d-flex align-items-center gap-3 p-3 rounded-4 ${outOfStock ? "bg-danger bg-opacity-10 border border-danger border-opacity-25" : "bg-success bg-opacity-10 border border-success border-opacity-25"}`}>
              <div className={`p-2 rounded-circle ${outOfStock ? "bg-danger text-white" : "bg-success text-white"}`}>
                <Package size={20} />
              </div>
              <div>
                <div className={`fw-black ${outOfStock ? "text-danger" : "text-success"}`} style={{ fontSize: "1.1rem" }}>
                  {outOfStock ? "Out of Stock" : "In Stock"}
                </div>
                {!outOfStock && (
                  <div className="text-success text-opacity-75 fw-semibold" style={{ fontSize: "0.85rem" }}>
                     {product.stock} units available ready to ship
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants}>
            {outOfStock ? (
              <div className="p-4 rounded-4 text-center border" style={{ background: "#fcfcfc" }}>
                <span className="fw-bold text-muted fs-5">We'll restock this item soon.</span>
              </div>
            ) : !isCustomer ? (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(255,107,43,0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="btn w-100 rounded-pill py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2 shadow"
                style={{ background: "var(--prime-gradient)", border: "none", fontSize: "1.1rem" }}
                onClick={() => navigate("/auth")}
              >
                <LogIn size={20} /> Sign in to Purchase
              </motion.button>
            ) : (
              <div className="bg-white p-4 rounded-4 border shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                  <span className="fw-bold text-dark fs-5">Quantity</span>
                  <div className="d-flex align-items-center rounded-pill overflow-hidden bg-light border" style={{ padding: 4 }}>
                    <button
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm"
                      style={{ width: 36, height: 36, color: "#333" }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="fw-black fs-5" style={{ minWidth: 50, textAlign: "center" }}>{quantity}</span>
                    <button
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm"
                      style={{ width: 36, height: 36, color: "#333" }}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      style={{
                        border: "2px solid #e8e8e8",
                        background: added ? "#10b981" : "#fff",
                        color: added ? "#fff" : "#333",
                        fontSize: "1rem",
                        transition: "all 0.3s",
                      }}
                      onClick={handleAddToCart}
                      disabled={adding || added}
                    >
                      {adding ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : added ? (
                        <> <CheckCircle2 size={18} /> Added to Cart </>
                      ) : (
                        <> <ShoppingCart size={18} /> Add to Cart </>
                      )}
                    </motion.button>
                  </div>
                  <div className="col-12 col-sm-6">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(255,107,43,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      className="btn w-100 rounded-pill py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2 shadow-sm"
                      style={{ background: "var(--prime-gradient)", border: "none", fontSize: "1rem" }}
                      onClick={handleBuyNow}
                      disabled={buying}
                    >
                      {buying ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <Zap size={18} />
                      )}
                      Buy Now
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetail;
