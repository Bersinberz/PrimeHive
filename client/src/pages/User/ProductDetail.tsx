import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, ArrowLeft, Package, Tag, Minus, Plus,
  Zap, LogIn, CheckCircle2, Store, Truck, RotateCcw, ShieldCheck,
} from "lucide-react";
import { getProductById, getProducts } from "../../services/storefront/productService";
import type { StorefrontProduct } from "../../services/storefront/productService";
import { getReviews, createReview, deleteReview } from "../../services/storefront/reviewService";
import type { ReviewSummary } from "../../services/storefront/reviewService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import StorefrontFooter from "../../components/Storefront/StorefrontFooter";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { freeShippingThreshold } = useSettings();
  const isCustomer = isAuthenticated && user?.role === "user";

  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<StorefrontProduct[]>([]);
  const [reviewData, setReviewData] = useState<ReviewSummary | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", body: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then((p) => { setProduct(p); setSelectedImage(0); })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    getProducts({ category: product.category, limit: 6 })
      .then(res => setRelated(res.data.filter(p => p._id !== product._id).slice(0, 5)))
      .catch(() => {});
  }, [product?._id]);

  useEffect(() => {
    if (!id) return;
    getReviews(id).then(setReviewData).catch(() => {});
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.rating) { setReviewError("Please select a star rating"); return; }
    if (!reviewForm.title.trim()) { setReviewError("Please add a title"); return; }
    if (!reviewForm.body.trim()) { setReviewError("Please write your review"); return; }
    setSubmitting(true); setReviewError(""); setReviewSuccess("");
    try {
      await createReview(id!, reviewForm);
      setReviewSuccess("Review submitted!");
      setReviewForm({ rating: 0, title: "", body: "" });
      const updated = await getReviews(id!);
      setReviewData(updated);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      const updated = await getReviews(id!);
      setReviewData(updated);
    } catch { /* silent */ }
  };

  const fmt = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = async () => {
    if (!isCustomer) { navigate("/auth"); return; }
    if (!product || product.stock < 1) return;
    setAdding(true);
    try {
      await addItem(product._id, product.name, product.price, product.images?.[0] || "", product.stock, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!isCustomer) { navigate("/auth"); return; }
    if (!product || product.stock < 1) return;
    setBuying(true);
    try {
      await addItem(product._id, product.name, product.price, product.images?.[0] || "", product.stock, quantity);
      navigate("/checkout");
    } finally { setBuying(false); }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: 1200 }}>
        <div className="d-flex gap-3">
          <div style={{ width: 62, flexShrink: 0 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-2 mb-2" style={{ height: 62, background: "#f0f0f0" }} />
            ))}
          </div>
          <div className="rounded-3 flex-shrink-0" style={{ width: 400, height: 400, background: "#f0f0f0" }} />
          <div className="flex-grow-1 px-3">
            {[90, 70, 40, 60, 50].map((w, i) => (
              <div key={i} className="rounded mb-3" style={{ height: 16, width: `${w}%`, background: "#f0f0f0" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <Package size={48} style={{ color: "#ddd", marginBottom: 16 }} />
        <h4 className="fw-black mb-2">Product Unavailable</h4>
        <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>This product may have been removed or is temporarily unavailable.</p>
        <button className="btn fw-bold text-white px-4 py-2 rounded-pill" style={{ background: "var(--prime-gradient)", border: "none" }} onClick={() => navigate("/browse")}>
          Back to Browse
        </button>
      </div>
    );
  }

  const outOfStock = product.stock < 1;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;
  const images = product.images?.length ? product.images : [""];
  const threshold = freeShippingThreshold || 999;

  return (
    <>
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── Main product section ── */}
      <div className="container py-3" style={{ maxWidth: 1200 }}>

        <button
          className="btn btn-sm mb-3 d-inline-flex align-items-center gap-1 fw-semibold p-0 border-0"
          style={{ color: "#007185", background: "transparent", fontSize: "0.85rem" }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Back to results
        </button>

        <div className="d-flex align-items-start" style={{ gap: 16 }}>

          {/* Col 1 — Vertical thumbnails */}

          <div className="d-none d-lg-flex flex-column gap-2 flex-shrink-0" style={{ width: 62 }}>
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                style={{
                  width: 62, height: 62, padding: 2, border: "none", background: "transparent", cursor: "pointer",
                  outline: selectedImage === i ? "2px solid var(--prime-orange)" : "1px solid #ddd",
                  outlineOffset: 1, borderRadius: 4,
                }}>
                {img
                  ? <img src={img} alt="" className="w-100 h-100" style={{ objectFit: "cover", borderRadius: 3 }} />
                  : <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "#f5f5f5", borderRadius: 3 }}><Package size={18} style={{ color: "#ccc" }} /></div>
                }
              </button>
            ))}
          </div>

          {/* Col 2 — Main image */}
          <div className="flex-shrink-0 d-none d-md-block" style={{ width: 400 }}>
            <div className="position-relative rounded-2 overflow-hidden border" style={{ width: 400, height: 400, background: "#f8f8f8" }}>
              {discount && (
                <div className="position-absolute z-2 fw-bold text-white rounded-pill px-2 py-1"
                  style={{ top: 12, left: 12, background: "var(--prime-orange)", fontSize: "0.72rem" }}>
                  -{discount}%
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  src={images[selectedImage] || ""}
                  alt={product.name}
                  className="w-100 h-100"
                  style={{ objectFit: "contain" }}
                />
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 mt-2 overflow-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    style={{ width: 52, height: 52, flexShrink: 0, padding: 2, border: "none", background: "transparent", cursor: "pointer",
                      outline: selectedImage === i ? "2px solid var(--prime-orange)" : "1px solid #ddd", outlineOffset: 1, borderRadius: 4 }}>
                    <img src={img} alt="" className="w-100 h-100" style={{ objectFit: "cover", borderRadius: 3 }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Col 3 — Product info */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--prime-orange)" }}>
                <Tag size={11} className="me-1" />{product.category}
              </span>
              {product.sellerName && (
                <span style={{ fontSize: "0.75rem", color: "#007185" }}>
                  · <Store size={11} className="me-1" />Visit the {product.sellerName} Store
                </span>
              )}
            </div>

            <h1 className="fw-bold mb-2 text-dark" style={{ fontSize: "1.15rem", lineHeight: 1.35 }}>
              {product.name}
            </h1>

            <hr style={{ borderColor: "#e7e7e7", margin: "8px 0" }} />

            {/* Price */}
            <div className="mb-2">
              {product.activeOffer && (
                <span className="badge rounded-pill fw-bold mb-2 d-inline-block"
                  style={{ background: "var(--prime-gradient)", color: "#fff", fontSize: "0.72rem", padding: "4px 10px" }}>
                  {product.activeOffer.label}
                </span>
              )}
              <div className="d-flex align-items-baseline gap-2 flex-wrap">
                <span style={{ fontSize: "0.78rem", color: "#565959" }}>Price:</span>
                <span className="fw-black" style={{ fontSize: "1.5rem", color: "#B12704", lineHeight: 1 }}>
                  {product.activeOffer ? fmt(product.activeOffer.discountedPrice) : fmt(product.price)}
                </span>
                {product.activeOffer ? (
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    M.R.P.: <span className="text-decoration-line-through">{fmt(product.price)}</span>
                  </span>
                ) : product.comparePrice && product.comparePrice > product.price ? (
                  <>
                    <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                      M.R.P.: <span className="text-decoration-line-through">{fmt(product.comparePrice)}</span>
                    </span>
                    {discount && (
                      <span className="fw-bold" style={{ fontSize: "0.8rem", color: "#CC0C39" }}>({discount}% off)</span>
                    )}
                  </>
                ) : null}
              </div>
              {(product.activeOffer ? product.activeOffer.discountedPrice : product.price) >= threshold && (
                <div className="mt-1" style={{ fontSize: "0.78rem", color: "#007600" }}>
                  <Truck size={11} className="me-1" />FREE Delivery
                </div>
              )}
            </div>

            <hr style={{ borderColor: "#e7e7e7", margin: "8px 0" }} />

            {/* Description */}
            {product.description && (
              <p className="mb-3 text-dark" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                {product.description}
              </p>
            )}

            {/* Trust badges */}
            <div className="d-flex gap-4 flex-wrap mb-3">
              {[
                { icon: RotateCcw, label: "Returns Policy", sub: "Easy returns" },
                { icon: ShieldCheck, label: "Secure transaction", sub: "Encrypted checkout" },
                { icon: Truck, label: "Free Delivery", sub: `Orders above ${fmt(threshold)}` },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="d-flex flex-column align-items-center text-center" style={{ minWidth: 68 }}>
                  <Icon size={20} style={{ color: "#555", marginBottom: 3 }} />
                  <div style={{ fontSize: "0.7rem", color: "#007185", fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: "0.65rem", color: "#888" }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Stock */}
            <div className="mb-3" style={{ fontSize: "0.88rem" }}>
              {outOfStock
                ? <span className="fw-bold text-danger">Currently unavailable.</span>
                : <><span className="fw-bold" style={{ color: "#007600" }}>In Stock</span><span className="text-muted ms-2" style={{ fontSize: "0.78rem" }}>{product.stock} units available</span></>
              }
            </div>

          </div>

          {/* Col 4 — Buy Box (sticky, desktop only) */}
          <div className="d-none d-lg-block flex-shrink-0" style={{ width: 220, position: "sticky", top: 80, alignSelf: "flex-start" }}>
            <div className="rounded-3 border p-3" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>

              {/* Price in buy box */}
              <div className="mb-2">
                <div className="fw-black" style={{ fontSize: "1.4rem", color: "#B12704", lineHeight: 1 }}>
                  {product.activeOffer ? fmt(product.activeOffer.discountedPrice) : fmt(product.price)}
                </div>
                {(product.activeOffer || (product.comparePrice && product.comparePrice > product.price)) && (
                  <div className="text-muted text-decoration-line-through" style={{ fontSize: "0.78rem" }}>
                    {fmt(product.activeOffer ? product.price : product.comparePrice!)}
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="mb-3 pb-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: "0.75rem", color: "#007600", fontWeight: 600 }}>
                  <Truck size={11} className="me-1" />
                  {(product.activeOffer ? product.activeOffer.discountedPrice : product.price) >= threshold
                    ? "FREE Delivery"
                    : `FREE above ${fmt(threshold)}`}
                </div>
                <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }}>Usually ships in 2–4 days</div>
              </div>

              {/* Stock */}
              <div className="mb-3" style={{ fontSize: "0.82rem" }}>
                {outOfStock
                  ? <span className="fw-bold text-danger">Currently unavailable</span>
                  : <span className="fw-bold" style={{ color: "#007600" }}>In Stock</span>
                }
              </div>

              {!outOfStock && (
                <>
                  {/* Qty stepper */}
                  <div className="mb-3">
                    <div className="fw-semibold mb-1" style={{ fontSize: "0.72rem", color: "#555" }}>Qty:</div>
                    <div className="d-flex align-items-center gap-2 rounded-2 border bg-light px-2 py-1" style={{ width: "fit-content" }}>
                      <button className="btn p-0 border-0 bg-transparent d-flex" style={{ color: "#333" }}
                        onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                        <Minus size={12} />
                      </button>
                      <span className="fw-bold" style={{ minWidth: 24, textAlign: "center", fontSize: "0.88rem" }}>{quantity}</span>
                      <button className="btn p-0 border-0 bg-transparent d-flex" style={{ color: "#333" }}
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {!isCustomer ? (
                    <button className="btn w-100 fw-bold rounded-pill py-2 d-flex align-items-center justify-content-center gap-1"
                      style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.82rem" }}
                      onClick={() => navigate("/auth")}>
                      <LogIn size={13} /> Sign in to Buy
                    </button>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn w-100 fw-bold rounded-pill py-2 d-flex align-items-center justify-content-center gap-1"
                        style={{
                          background: added ? "#10b981" : "#FFD814",
                          border: added ? "none" : "1px solid #FFA41C",
                          color: added ? "#fff" : "#111",
                          fontSize: "0.82rem", transition: "all 0.3s",
                        }}
                        onClick={handleAddToCart} disabled={adding || added}>
                        {adding
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                          : added
                            ? <><CheckCircle2 size={13} /> Added to Cart</>
                            : <><ShoppingCart size={13} /> Add to Cart</>
                        }
                      </button>
                      <button
                        className="btn w-100 fw-bold rounded-pill py-2 d-flex align-items-center justify-content-center gap-1"
                        style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.82rem" }}
                        onClick={handleBuyNow} disabled={buying}>
                        {buying
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                          : <><Zap size={13} /> Buy Now</>
                        }
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Secure transaction note */}
              <div className="mt-3 d-flex align-items-center gap-1" style={{ fontSize: "0.7rem", color: "#888" }}>
                <ShieldCheck size={11} /> Secure transaction
              </div>
            </div>
          </div>

        </div>

        {/* Mobile image + buttons */}
        <div className="d-md-none mt-3">
          <div className="rounded-2 overflow-hidden border mb-3" style={{ aspectRatio: "1/1", background: "#f8f8f8" }}>
            <img src={images[selectedImage] || ""} alt={product.name} className="w-100 h-100" style={{ objectFit: "contain" }} />
          </div>
          <h2 className="fw-bold mb-1" style={{ fontSize: "1rem" }}>{product.name}</h2>
          <div className="fw-black mb-3" style={{ fontSize: "1.3rem", color: "#B12704" }}>{fmt(product.price)}</div>
          {!outOfStock && (
            <div className="d-flex gap-2">
              {isCustomer ? (
                <>
                  <button className="btn flex-grow-1 fw-bold rounded-pill py-2"
                    style={{ background: "#FFD814", border: "1px solid #FFA41C", color: "#111", fontSize: "0.85rem" }}
                    onClick={handleAddToCart} disabled={adding || added}>
                    {adding ? "..." : added ? "Added" : "Add to Cart"}
                  </button>
                  <button className="btn flex-grow-1 fw-bold rounded-pill py-2 text-white"
                    style={{ background: "var(--prime-gradient)", border: "none", fontSize: "0.85rem" }}
                    onClick={handleBuyNow} disabled={buying}>
                    {buying ? "..." : "Buy Now"}
                  </button>
                </>
              ) : (
                <button className="btn w-100 fw-bold rounded-pill py-2 text-white"
                  style={{ background: "var(--prime-gradient)", border: "none", fontSize: "0.85rem" }}
                  onClick={() => navigate("/auth")}>
                  Sign in to Purchase
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ background: "#f7f7f7", borderTop: "1px solid #e7e7e7", marginTop: 32 }}>
          <div className="container py-4" style={{ maxWidth: 1200 }}>
            <h2 className="fw-black mb-4" style={{ fontSize: "1.1rem", letterSpacing: "-0.2px" }}>
              Related products
            </h2>
            <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: "thin" }}>
              {related.map((p) => {
                const disc = p.comparePrice && p.comparePrice > p.price
                  ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                  : null;
                return (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="rounded-3 bg-white flex-shrink-0"
                    style={{ width: 180, border: "1px solid #e7e7e7", cursor: "pointer", overflow: "hidden",
                      transition: "box-shadow 0.18s, transform 0.18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
                  >
                    <div className="position-relative" style={{ height: 160, background: "#f8f8f8" }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-100 h-100" style={{ objectFit: "contain" }} />
                        : <div className="w-100 h-100 d-flex align-items-center justify-content-center"><Package size={32} style={{ color: "#ddd" }} /></div>
                      }
                      {disc && (
                        <span className="position-absolute top-0 end-0 m-2 fw-bold text-white rounded-pill px-2 py-1"
                          style={{ background: "var(--prime-orange)", fontSize: "0.65rem" }}>
                          -{disc}%
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="fw-semibold text-dark mb-1"
                        style={{ fontSize: "0.8rem", lineHeight: 1.3,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.name}
                      </div>
                      <div className="fw-black" style={{ fontSize: "0.95rem", color: "#B12704" }}>
                        {fmt(p.price)}
                      </div>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <div className="text-muted text-decoration-line-through" style={{ fontSize: "0.72rem" }}>
                          {fmt(p.comparePrice)}
                        </div>
                      )}
                      <div className="mt-1 fw-semibold" style={{ fontSize: "0.7rem", color: p.stock > 0 ? "#007600" : "#cc0000" }}>
                        {p.stock > 0 ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews ── */}
      <div style={{ background: "#fff", borderTop: "1px solid #e7e7e7" }}>
        <div className="container py-4" style={{ maxWidth: 1200 }}>
          <h2 className="fw-black mb-4" style={{ fontSize: "1.1rem", letterSpacing: "-0.2px" }}>
            Customer Reviews
            {reviewData && reviewData.total > 0 && (
              <span className="ms-2 fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                ({reviewData.total} {reviewData.total === 1 ? "review" : "reviews"})
              </span>
            )}
          </h2>

          <div className="row g-4">
            {/* Left — summary + form */}
            <div className="col-12 col-md-4">
              {/* Rating summary */}
              {reviewData && reviewData.total > 0 && (
                <div className="p-3 rounded-3 border mb-4" style={{ background: "#fafafa" }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="fw-black" style={{ fontSize: "2.5rem", color: "#1a1a1a", lineHeight: 1 }}>{reviewData.avg.toFixed(1)}</span>
                    <div>
                      <div className="d-flex gap-1 mb-1">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(reviewData.avg) ? "#f59e0b" : "#e5e7eb"}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{reviewData.total} ratings</div>
                    </div>
                  </div>
                  {reviewData.dist.map(({ star, count }) => (
                    <div key={star} className="d-flex align-items-center gap-2 mb-1">
                      <span style={{ fontSize: "0.75rem", color: "#555", minWidth: 32 }}>{star} ★</span>
                      <div className="flex-grow-1 rounded-pill overflow-hidden" style={{ height: 8, background: "#e5e7eb" }}>
                        <div className="rounded-pill" style={{ height: "100%", width: `${reviewData.total ? (count / reviewData.total) * 100 : 0}%`, background: "#f59e0b", transition: "width 0.4s" }} />
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#888", minWidth: 20 }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Write review form */}
              {isCustomer ? (
                <div className="p-3 rounded-3 border">
                  <div className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Write a Review</div>
                  <form onSubmit={handleReviewSubmit}>
                    {/* Star picker */}
                    <div className="mb-3">
                      <div className="text-muted mb-1" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Your Rating *</div>
                      <div className="d-flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                            style={{ background: "none", border: "none", padding: 2, cursor: "pointer" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24"
                              fill={(hoverRating || reviewForm.rating) >= s ? "#f59e0b" : "#e5e7eb"}
                              style={{ transition: "fill 0.1s" }}>
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-2">
                      <input
                        className="form-control form-control-sm fw-semibold"
                        placeholder="Review title *"
                        value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        maxLength={120}
                      />
                    </div>
                    <div className="mb-3">
                      <textarea
                        className="form-control form-control-sm fw-semibold"
                        placeholder="Share your experience with this product *"
                        rows={4}
                        value={reviewForm.body}
                        onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                        maxLength={2000}
                        style={{ resize: "vertical" }}
                      />
                    </div>
                    {reviewError && <div className="text-danger mb-2 fw-semibold" style={{ fontSize: "0.8rem" }}>{reviewError}</div>}
                    {reviewSuccess && <div className="text-success mb-2 fw-semibold" style={{ fontSize: "0.8rem" }}>{reviewSuccess}</div>}
                    <button type="submit" disabled={submitting}
                      className="btn fw-bold w-100 rounded-pill py-2"
                      style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.85rem" }}>
                      {submitting ? <span className="spinner-border spinner-border-sm" style={{ width: 13, height: 13 }} /> : "Submit Review"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-3 rounded-3 border text-center" style={{ background: "#fafafa" }}>
                  <div className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>Sign in to leave a review</div>
                  <button className="btn fw-bold rounded-pill px-4 py-2"
                    style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.82rem" }}
                    onClick={() => navigate("/auth")}>
                    <LogIn size={13} className="me-1" /> Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Right — review list */}
            <div className="col-12 col-md-8">
              {!reviewData || reviewData.total === 0 ? (
                <div className="text-center py-5 text-muted">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mb-3 d-block mx-auto"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <div className="fw-bold" style={{ fontSize: "0.9rem" }}>No reviews yet</div>
                  <div style={{ fontSize: "0.8rem" }}>Be the first to review this product</div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviewData.reviews.map(r => (
                    <div key={r._id} className="p-3 rounded-3 border" style={{ background: "#fafafa" }}>
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                        <div>
                          <div className="d-flex gap-1 mb-1">
                            {[1,2,3,4,5].map(s => (
                              <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= r.rating ? "#f59e0b" : "#e5e7eb"}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                          <div className="fw-black" style={{ fontSize: "0.88rem", color: "#1a1a1a" }}>{r.title}</div>
                        </div>
                        {isCustomer && user?.id === r.user && (
                          <button type="button" onClick={() => handleDeleteReview(r._id)}
                            className="btn p-1 border-0 bg-transparent flex-shrink-0"
                            style={{ color: "#ef4444" }} title="Delete review">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </div>
                      <p className="mb-1 text-dark" style={{ fontSize: "0.85rem", lineHeight: 1.55 }}>{r.body}</p>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                        By <span className="fw-semibold">{r.userName}</span> · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
    <StorefrontFooter />
    </>
  );
};

export default ProductDetail;
