import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Zap, ChevronLeft, ChevronRight, TrendingUp, Tag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../services/storefront/productService";
import type { StorefrontProduct } from "../../services/storefront/productService";
import { getActiveOffers } from "../../services/storefront/offerService";
import type { ActiveOfferBanner } from "../../services/storefront/offerService";
import StorefrontFooter from "../../components/Storefront/StorefrontFooter";

// Static brand slides (no color overlay — just a dark scrim)
const STATIC_SLIDES = [
  {
    id: "s1",
    type: "static" as const,
    title: "Welcome to PrimeHive",
    subtitle: "Discover amazing products curated just for you.",
    badge: "🏠 Home of Great Deals",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80&fit=crop",
  },
  {
    id: "s2",
    type: "static" as const,
    title: "Exclusive Member Offers",
    subtitle: "Sign in today for special discounts and member-only perks.",
    badge: "🔥 Members Only",
    img: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400&q=80&fit=crop",
  },
  {
    id: "s3",
    type: "static" as const,
    title: "Top Electronics Deals",
    subtitle: "Headphones, smartwatches, keyboards and more at unbeatable prices.",
    badge: "⚡ Tech Week",
    img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&q=80&fit=crop",
  },
  {
    id: "s4",
    type: "static" as const,
    title: "Fashion for Everyone",
    subtitle: "Kurtas, hoodies, sneakers — style that fits every occasion.",
    badge: "👗 Style Drop",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=80&fit=crop",
  },
  {
    id: "s5",
    type: "static" as const,
    title: "Upgrade Your Home",
    subtitle: "Cookware, air purifiers, décor — everything your home deserves.",
    badge: "🏡 Home Refresh",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80&fit=crop",
  },
  {
    id: "s6",
    type: "static" as const,
    title: "Fast & Reliable Delivery",
    subtitle: "Order today and get it at your doorstep in no time.",
    badge: "🚚 Quick Delivery",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=80&fit=crop",
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "popular";

  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [offers, setOffers] = useState<ActiveOfferBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Merge static slides + one slide per active offer
  const slides = useMemo(() => {
    const offerSlides = offers.map(o => ({
      id: `offer-${o._id}`,
      type: "offer" as const,
      offer: o,
    }));
    // Interleave: static[0], offer[0], static[1], offer[1], ...
    const merged: any[] = [];
    const maxLen = Math.max(STATIC_SLIDES.length, offerSlides.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < STATIC_SLIDES.length) merged.push(STATIC_SLIDES[i]);
      if (i < offerSlides.length) merged.push(offerSlides[i]);
    }
    return merged;
  }, [offers]);

  useEffect(() => { setPage(1); }, [sort]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getProducts({ page, limit: 24, sort: sort as any });
      setProducts(result.data.filter(p => p.stock > 0));
      setTotalPages(result.pagination.totalPages);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getActiveOffers().then(setOffers).catch(() => {}); }, []);

  const getDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const slide = slides[currentSlide];

  return (
    <>
    <div className="container py-xl-4 py-3">

      {/* ── Hero Slideshow ── */}
      <div className="position-relative overflow-hidden mb-5 rounded-4 shadow-sm"
        style={{ height: 450, background: "#111" }}>

        <AnimatePresence mode="wait">
          {slide && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
              className="w-100 h-100 position-absolute"
            >
              {slide.type === "static" ? (
                <>
                  <img src={slide.img} alt="" className="w-100 h-100"
                    style={{ objectFit: "cover", objectPosition: "center" }} />
                  {/* Neutral dark scrim — no colour tint */}
                  <div className="position-absolute w-100 h-100"
                    style={{ top: 0, left: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.1) 100%)" }} />
                  <div className="position-absolute w-100 d-flex flex-column align-items-center justify-content-center text-center px-4"
                    style={{ bottom: 60, left: 0, color: "#fff" }}>
                    <span className="badge rounded-pill mb-3 px-3 py-2 fw-semibold"
                      style={{ background: "rgba(255,255,255,0.18)", fontSize: "0.85rem", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)" }}>
                      {slide.badge}
                    </span>
                    <h1 className="fw-black mb-2" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)", letterSpacing: "-1px", textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>
                      {slide.title}
                    </h1>
                    <p className="fw-medium m-0 opacity-90" style={{ fontSize: "1.05rem", maxWidth: 560, textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                      {slide.subtitle}
                    </p>
                  </div>
                </>
              ) : (
                /* Offer slide — split layout */
                <>
                  {/* Left: dark panel */}
                  <div className="position-absolute h-100 d-flex flex-column justify-content-center px-5"
                    style={{ left: 0, width: "42%", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", zIndex: 1 }}>
                    <span className="badge rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-1"
                      style={{ background: "var(--prime-gradient)", color: "#fff", fontSize: "0.78rem", padding: "6px 12px", width: "fit-content" }}>
                      <Tag size={12} /> Limited Offer
                    </span>
                    <h2 className="fw-black text-white mb-2" style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                      {slide.offer.label}
                    </h2>
                    <p className="mb-3" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.92rem" }}>
                      {slide.offer.discountType === "percentage"
                        ? `Save ${slide.offer.discountValue}% on ${slide.offer.products.length} product${slide.offer.products.length !== 1 ? "s" : ""}`
                        : `Flat ₹${slide.offer.discountValue} off on ${slide.offer.products.length} product${slide.offer.products.length !== 1 ? "s" : ""}`}
                    </p>
                    {slide.offer.endDate && (
                      <div className="d-flex align-items-center gap-2 mb-4"
                        style={{ color: "#f59e0b", fontSize: "0.82rem", fontWeight: 700 }}>
                        <Clock size={14} />
                        Ends {new Date(slide.offer.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                    <button
                      className="btn fw-bold rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2"
                      style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.88rem", width: "fit-content" }}
                      onClick={() => navigate("/browse")}>
                      Shop Now <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* Right: product thumbnails grid */}
                  <div className="position-absolute h-100 d-flex align-items-center justify-content-center"
                    style={{ left: "42%", right: 0, background: "#f5f5f5", zIndex: 1, overflow: "hidden" }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 8,
                      padding: 16,
                      width: "100%",
                      maxHeight: "100%",
                      overflow: "hidden",
                    }}>
                      {slide.offer.products.slice(0, 6).map((p: any) => {
                        const savedPct = Math.round(((p.price - p.discountedPrice) / p.price) * 100);
                        return (
                          <div key={p._id}
                            className="rounded-3 bg-white position-relative overflow-hidden"
                            style={{ aspectRatio: "1/1", border: "1px solid #eee", cursor: "pointer" }}
                            onClick={() => navigate(`/products/${p._id}`)}>
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} className="w-100 h-100" style={{ objectFit: "contain" }} />
                              : <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"><ShoppingCart size={20} style={{ color: "#ccc" }} /></div>
                            }
                            <span className="position-absolute top-0 end-0 m-1 fw-black text-white rounded-pill px-1"
                              style={{ background: "var(--prime-gradient)", fontSize: "0.6rem" }}>
                              -{savedPct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <button className="btn position-absolute top-50 start-0 translate-middle-y border-0 text-white"
          style={{ zIndex: 10, background: "rgba(0,0,0,0.25)", borderRadius: "0 8px 8px 0", padding: "12px 8px" }}
          onClick={() => setCurrentSlide(s => (s === 0 ? slides.length - 1 : s - 1))}>
          <ChevronLeft size={28} />
        </button>
        <button className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-white"
          style={{ zIndex: 10, background: "rgba(0,0,0,0.25)", borderRadius: "8px 0 0 8px", padding: "12px 8px" }}
          onClick={() => setCurrentSlide(s => (s + 1) % slides.length)}>
          <ChevronRight size={28} />
        </button>

        {/* Indicators */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2" style={{ zIndex: 10 }}>
          {slides.map((s, i) => (
            <div key={s.id} onClick={() => setCurrentSlide(i)}
              className="rounded-pill"
              style={{ width: currentSlide === i ? 24 : 8, height: 8, background: "#fff", opacity: currentSlide === i ? 1 : 0.45, cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert rounded-4 border-0 mb-4 shadow-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Product Grid */}
      <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
        <h3 className="fw-black text-dark m-0 d-flex align-items-center gap-2">
          <TrendingUp size={22} style={{ color: "var(--prime-orange)" }} /> Best Sellers
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
            const discount = !product.activeOffer ? getDiscount(product.price, product.comparePrice) : null;
            return (
              <div key={product._id} className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
                <div className="product-card-image">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f0f2" }}>
                      <ShoppingCart size={32} style={{ color: "#ccc" }} />
                    </div>
                  )}
                  {product.activeOffer ? (
                    <span className="position-absolute m-3 badge rounded-pill shadow-sm"
                      style={{ top: 0, right: 0, background: "var(--prime-gradient)", fontSize: "0.75rem", padding: "6px 10px" }}>
                      {product.activeOffer.label}
                    </span>
                  ) : discount ? (
                    <span className="position-absolute m-3 badge rounded-pill shadow-sm"
                      style={{ top: 0, right: 0, background: "var(--prime-gradient)", fontSize: "0.75rem", padding: "6px 10px" }}>
                      -{discount}%
                    </span>
                  ) : null}
                </div>
                <div className="product-card-body pt-3">
                  <div className="card-name fw-bold" style={{ fontSize: "1.15rem" }}>{product.name}</div>
                  <div className="product-card-price mt-2 mb-3">
                    {product.activeOffer ? (
                      <>
                        <span className="current-price fs-4">{formatPrice(product.activeOffer.discountedPrice)}</span>
                        <span className="compare-price ms-2 text-decoration-line-through text-muted" style={{ fontSize: "0.85rem" }}>
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="current-price fs-4">{formatPrice(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="compare-price">{formatPrice(product.comparePrice)}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-5 pt-4">
          <button className="btn btn-sm rounded-pill px-4 py-2 fw-bold"
            style={{ border: "2px solid #e8e8e8", background: "#fff" }}
            disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Previous
          </button>
          <span className="fw-bold px-3 py-2 bg-light rounded-pill border mx-2">Page {page} of {totalPages}</span>
          <button className="btn btn-sm rounded-pill px-4 py-2 fw-bold"
            style={{ border: "2px solid #e8e8e8", background: "#fff" }}
            disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
    <StorefrontFooter />
    </>
  );
};

export default HomePage;
