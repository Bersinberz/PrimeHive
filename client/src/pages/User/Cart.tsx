import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, Package, LogIn, Bookmark, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem, loading, savedItems, saveForLater, moveToCart, removeSaved } = useCart();
  const { user, isAuthenticated } = useAuth();

  const isCustomer = isAuthenticated && user?.role === "user";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <ShoppingCart size={48} style={{ color: "var(--prime-orange)" }} />
          </div>
          <h3 className="fw-bold text-dark mb-2">Your cart is empty</h3>
          <p className="text-muted mb-4">Looks like you haven't added anything yet.</p>
          <Link
            to="/"
            className="btn rounded-pill px-5 py-2 fw-bold text-white"
            style={{ background: "var(--prime-gradient)", border: "none" }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ letterSpacing: "-0.5px" }}>
        Your Cart{" "}
        <span className="text-muted fw-normal fs-5">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h2>

      <div className="row g-4">
        {/* Cart Items */}
        <div className="col-lg-8">
          {items.length === 0 ? (
            <div className="form-panel p-4 text-center text-muted" style={{ fontSize: "0.9rem" }}>
              <ShoppingBag size={32} className="mb-2 opacity-50" />
              <p className="mb-0">No items in cart. Check your saved items below.</p>
            </div>
          ) : (
            <div className="form-panel p-0 overflow-hidden">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.product}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="d-flex align-items-center gap-3 p-4"
                    style={{ borderBottom: index < items.length - 1 ? "1px solid #f0f0f2" : "none" }}
                  >
                    {/* Image */}
                    <div
                      className="rounded-3 overflow-hidden flex-shrink-0"
                      style={{ width: 80, height: 80, background: "#f0f0f2", cursor: "pointer" }}
                      onClick={() => navigate(`/products/${item.product}`)}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                          <Package size={24} style={{ color: "#ccc" }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow-1 min-w-0">
                      <p
                        className="fw-bold mb-1 text-truncate"
                        style={{ fontSize: "0.95rem", cursor: "pointer" }}
                        onClick={() => navigate(`/products/${item.product}`)}
                      >
                        {item.name}
                      </p>
                      <p className="mb-1 fw-bold" style={{ color: "var(--prime-deep)" }}>
                        {formatPrice(item.price)}
                      </p>
                      {item.stock < 10 && (
                        <p className="mb-1 text-warning" style={{ fontSize: "0.75rem" }}>
                          Only {item.stock} left
                        </p>
                      )}
                      {/* Action links */}
                      <div className="d-flex gap-3 mt-1">
                        <button
                          className="btn p-0 border-0 bg-transparent"
                          style={{ fontSize: "0.78rem", color: "var(--prime-orange)", fontWeight: 600 }}
                          onClick={() => saveForLater(item.product)}
                          disabled={loading}
                        >
                          <Bookmark size={12} className="me-1" />
                          Save for later
                        </button>
                        <button
                          className="btn p-0 border-0 bg-transparent"
                          style={{ fontSize: "0.78rem", color: "#ef4444", fontWeight: 600 }}
                          onClick={() => removeItem(item.product)}
                          disabled={loading}
                        >
                          <Trash2 size={12} className="me-1" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div
                      className="d-flex align-items-center rounded-3 overflow-hidden flex-shrink-0"
                      style={{ border: "1.5px solid var(--prime-border)" }}
                    >
                      <button
                        className="btn border-0 px-2 py-1"
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 fw-bold" style={{ minWidth: 32, textAlign: "center", fontSize: "0.9rem" }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn border-0 px-2 py-1"
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        disabled={loading || item.quantity >= item.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-end flex-shrink-0" style={{ minWidth: 80 }}>
                      <p className="fw-bold mb-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Saved for Later */}
          {savedItems.length > 0 && (
            <div className="mt-4">
              <h5 className="fw-bold mb-3" style={{ fontSize: "1rem" }}>
                <Bookmark size={16} className="me-2" style={{ color: "var(--prime-orange)" }} />
                Saved for Later ({savedItems.length})
              </h5>
              <div className="form-panel p-0 overflow-hidden">
                <AnimatePresence>
                  {savedItems.map((item, index) => (
                    <motion.div
                      key={item.product}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="d-flex align-items-center gap-3 p-4"
                      style={{ borderBottom: index < savedItems.length - 1 ? "1px solid #f0f0f2" : "none" }}
                    >
                      {/* Image */}
                      <div
                        className="rounded-3 overflow-hidden flex-shrink-0"
                        style={{ width: 72, height: 72, background: "#f0f0f2", cursor: "pointer" }}
                        onClick={() => navigate(`/products/${item.product}`)}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                            <Package size={20} style={{ color: "#ccc" }} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow-1 min-w-0">
                        <p
                          className="fw-bold mb-1 text-truncate"
                          style={{ fontSize: "0.9rem", cursor: "pointer" }}
                          onClick={() => navigate(`/products/${item.product}`)}
                        >
                          {item.name}
                        </p>
                        <p className="mb-2 fw-bold" style={{ color: "var(--prime-deep)", fontSize: "0.9rem" }}>
                          {formatPrice(item.price)}
                        </p>
                        <div className="d-flex gap-3">
                          <button
                            className="btn p-0 border-0 bg-transparent"
                            style={{ fontSize: "0.78rem", color: "var(--prime-orange)", fontWeight: 600 }}
                            onClick={() => moveToCart(item.product)}
                          >
                            <ShoppingCart size={12} className="me-1" />
                            Move to cart
                          </button>
                          <button
                            className="btn p-0 border-0 bg-transparent"
                            style={{ fontSize: "0.78rem", color: "#ef4444", fontWeight: 600 }}
                            onClick={() => removeSaved(item.product)}
                          >
                            <Trash2 size={12} className="me-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="form-panel" style={{ position: "sticky", top: 90 }}>

            {/* Subtotal line */}
            <p className="mb-4" style={{ fontSize: "1.05rem", color: "#111" }}>
              Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"}):&nbsp;
              <span className="fw-black" style={{ fontSize: "1.25rem" }}>{formatPrice(totalPrice)}</span>
            </p>

            {isCustomer ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn w-100 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: "var(--prime-gradient)",
                  border: "none",
                  borderRadius: 999,
                  fontSize: "1rem",
                  padding: "12px 0",
                }}
                onClick={() => navigate("/checkout")}
                disabled={items.length === 0}
              >
                Proceed to Buy
              </motion.button>
            ) : (
              <>
                <div
                  className="rounded-3 p-3 mb-3 text-center"
                  style={{ background: "rgba(255,140,66,0.06)", border: "1.5px dashed var(--prime-orange)" }}
                >
                  <p className="mb-1 fw-semibold" style={{ fontSize: "0.9rem" }}>Sign in to checkout</p>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>Your cart is saved and ready</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn w-100 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "var(--prime-gradient)",
                    border: "none",
                    borderRadius: 999,
                    fontSize: "1rem",
                    padding: "12px 0",
                  }}
                  onClick={() => navigate("/auth")}
                >
                  <LogIn size={16} /> Sign In to Checkout
                </motion.button>
              </>
            )}

            <div className="text-center mt-3">
              <Link to="/" style={{ fontSize: "0.82rem", color: "var(--prime-orange)", textDecoration: "none" }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
