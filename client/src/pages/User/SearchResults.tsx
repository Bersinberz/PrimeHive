import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { motion } from "framer-motion";
import { getProducts, getCategories } from "../../services/storefront/productService";
import type { StorefrontProduct, Category } from "../../services/storefront/productService";

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "popular",    label: "Most Popular" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  // Load categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Reset page when query/filters change
  useEffect(() => { setPage(1); }, [query, selectedCategory, minPrice, maxPrice, sort]);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) { setProducts([]); setTotal(0); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await getProducts({
        search: query,
        page,
        limit: 24,
        sort: sort as any,
        category: selectedCategory || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });
      setProducts(res.data.filter(p => p.stock > 0));
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, page, sort, selectedCategory, minPrice, maxPrice]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const getDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || sort !== "newest";

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-black m-0" style={{ fontSize: "1.6rem", color: "#1a1a1a" }}>
            {query ? (
              <>Results for <span style={{ color: "var(--prime-orange)" }}>"{query}"</span></>
            ) : "Search Products"}
          </h2>
          {!loading && query && (
            <p className="text-muted m-0 mt-1" style={{ fontSize: "0.9rem" }}>
              {total} product{total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Sort dropdown */}
          <div className="position-relative">
            <select
              className="form-select fw-bold border-0 shadow-sm"
              style={{ borderRadius: 10, fontSize: "0.88rem", paddingRight: 32, background: "#fff", cursor: "pointer" }}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex gap-4 align-items-start">
        {/* Sidebar Filters — always visible */}
        <div style={{ width: 240, flexShrink: 0, background: "#fff", borderRadius: 16, border: "1px solid #f0f0f2", padding: 20 }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className="fw-black" style={{ fontSize: "0.95rem" }}>Filters</span>
            {hasActiveFilters && (
              <button className="btn btn-sm p-0 border-0 text-muted fw-bold" style={{ fontSize: "0.8rem" }} onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="fw-bold mb-2 d-block" style={{ fontSize: "0.78rem", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
            <select
              className="form-select form-select-sm border-0 bg-light fw-bold"
              style={{ borderRadius: 8, fontSize: "0.88rem" }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-3">
            <label className="fw-bold mb-2 d-block" style={{ fontSize: "0.78rem", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price Range (₹)</label>
            <div className="d-flex gap-2">
              <input
                type="number" placeholder="Min" min={0}
                className="form-control form-control-sm border-0 bg-light fw-bold"
                style={{ borderRadius: 8, fontSize: "0.88rem" }}
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <input
                type="number" placeholder="Max" min={0}
                className="form-control form-control-sm border-0 bg-light fw-bold"
                style={{ borderRadius: 8, fontSize: "0.88rem" }}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-grow-1">
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card" style={{ minHeight: 300, opacity: 0.6 }}>
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
            <div className="text-center py-5 my-4">
              <Search size={52} style={{ color: "#e0e0e0", marginBottom: 16 }} />
              <h4 className="fw-black text-dark mb-2">No results found</h4>
              <p className="text-muted mb-4">
                We couldn't find any products matching <strong>"{query}"</strong>.
                {hasActiveFilters && " Try removing some filters."}
              </p>
              {hasActiveFilters && (
                <button className="btn fw-bold px-4 py-2" style={{ background: "var(--prime-gradient)", color: "#fff", border: "none", borderRadius: 10 }} onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => {
                  const discount = getDiscount(product.price, product.comparePrice);
                  return (
                    <motion.div
                      key={product._id}
                      className="product-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <div className="product-card-image">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} loading="lazy" />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f0f2" }}>
                            <ShoppingCart size={32} style={{ color: "#ccc" }} />
                          </div>
                        )}
                        {discount && (
                          <span className="position-absolute m-3 badge rounded-pill shadow-sm"
                            style={{ top: 0, right: 0, background: "var(--prime-gradient)", fontSize: "0.75rem", padding: "6px 10px" }}>
                            -{discount}%
                          </span>
                        )}
                      </div>

                      <div className="product-card-body pt-3">
                        <div className="card-category" style={{ fontSize: "0.75rem", color: "#aaa", fontWeight: 700, marginBottom: 4 }}>{product.category}</div>
                        <div className="card-name fw-bold" style={{ fontSize: "1.05rem" }}>{product.name}</div>
                        <div className="product-card-price mt-2 mb-3">
                          <span className="current-price fs-5">{formatPrice(product.price)}</span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="compare-price">{formatPrice(product.comparePrice)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-5 pt-2">
                  <button
                    className="btn btn-sm rounded-pill px-4 py-2 fw-bold"
                    style={{ border: "2px solid #e8e8e8", background: "#fff" }}
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >← Previous</button>
                  <span className="fw-bold px-3 py-2 bg-light rounded-pill border mx-2">Page {page} of {totalPages}</span>
                  <button
                    className="btn btn-sm rounded-pill px-4 py-2 fw-bold"
                    style={{ border: "2px solid #e8e8e8", background: "#fff" }}
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
