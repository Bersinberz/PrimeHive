import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { getWishlist, removeFromWishlist, type WishlistProduct } from '../../services/storefront/wishlistService';
import { addToCart } from '../../services/storefront/cartService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch(() => showToast({ type: 'error', title: 'Error', message: 'Failed to load wishlist' }))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    try {
      const updated = await removeFromWishlist(productId);
      setItems(updated);
      showToast({ type: 'success', title: 'Removed', message: 'Item removed from wishlist' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to remove item' });
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      showToast({ type: 'success', title: 'Added to Cart', message: 'Item added to your cart' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to add to cart' });
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) return <PrimeLoader isLoading />;

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
      <button className="btn p-0 border-0 d-flex align-items-center gap-2 fw-bold mb-4"
        style={{ color: '#888', fontSize: '0.88rem', background: 'transparent' }}
        onClick={() => navigate('/account')}>
        <ArrowLeft size={16} /> My Account
      </button>

      <div className="mb-4">
        <h3 className="fw-black mb-1" style={{ letterSpacing: '-0.5px' }}>
          <Heart size={20} className="me-2" style={{ color: '#ef4444' }} />
          Wishlist
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5">
          <Heart size={48} style={{ color: '#ddd', marginBottom: 16 }} />
          <p className="fw-bold mb-1">Your wishlist is empty</p>
          <p className="text-muted mb-4" style={{ fontSize: '0.88rem' }}>Save items you love to buy them later</p>
          <button className="btn fw-bold text-white px-4"
            style={{ background: 'var(--prime-gradient)', border: 'none', borderRadius: 10 }}
            onClick={() => navigate('/browse')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="row g-3">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item._id} className="col-12 col-sm-6 col-lg-4"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}>
                <div className="form-panel p-0 overflow-hidden h-100 d-flex flex-column">
                  {/* Image */}
                  <div style={{ position: 'relative', paddingTop: '66%', background: '#f5f5f7', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${item._id}`)}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart size={32} style={{ color: '#ddd' }} />
                      </div>
                    )}
                    {item.stock === 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: 20 }}>Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <p className="fw-bold mb-1 text-truncate" style={{ fontSize: '0.92rem', cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${item._id}`)}>
                      {item.name}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>{item.category}</p>
                    <div className="d-flex align-items-center gap-2 mt-2 mb-3">
                      <span className="fw-black" style={{ fontSize: '1rem', color: 'var(--prime-deep)' }}>{fmt(item.price)}</span>
                      {item.comparePrice && item.comparePrice > item.price && (
                        <span style={{ fontSize: '0.82rem', color: '#aaa', textDecoration: 'line-through' }}>{fmt(item.comparePrice)}</span>
                      )}
                    </div>

                    <div className="d-flex gap-2 mt-auto">
                      <button
                        className="btn fw-bold flex-grow-1"
                        disabled={item.stock === 0 || addingToCart === item._id}
                        onClick={() => handleAddToCart(item._id)}
                        style={{ background: item.stock === 0 ? '#f5f5f5' : 'var(--prime-gradient)', color: item.stock === 0 ? '#aaa' : '#fff', border: 'none', borderRadius: 10, fontSize: '0.82rem' }}>
                        {addingToCart === item._id
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          : <><ShoppingCart size={13} className="me-1" />Add to Cart</>}
                      </button>
                      <button
                        className="btn"
                        disabled={removing === item._id}
                        onClick={() => handleRemove(item._id)}
                        style={{ border: '1.5px solid #fee2e2', background: '#fff', color: '#ef4444', borderRadius: 10, padding: '8px 12px' }}>
                        {removing === item._id
                          ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default WishlistPage;
