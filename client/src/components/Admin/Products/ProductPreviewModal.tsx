import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, User, Phone, Mail, MapPin, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../../services/admin/productService';
import { formatPhone } from '../../../utils/formatPhone';

interface Props {
  product: Product | null;
  onClose: () => void;
}

const ProductPreviewModal: React.FC<Props> = ({ product, onClose }) => {
  const [imgIndex, setImgIndex] = useState(0);

  if (!product) return null;

  const images = product.images ?? [];
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const stockStatus = product.stock > 10 ? { label: 'In Stock', color: '#16a34a', bg: '#f0fdf4' }
    : product.stock > 0 ? { label: 'Low Stock', color: '#d97706', bg: '#fffbeb' }
    : { label: 'Out of Stock', color: '#dc2626', bg: '#fef2f2' };

  const creator = product.createdBy;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '820px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Product Preview
            </span>
            <button onClick={onClose} style={{ background: '#f4f4f6', border: 'none', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '20px 24px 24px' }}>
            {/* Left: Images */}
            <div>
              <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#f8f9fa', aspectRatio: '1', marginBottom: '10px' }}>
                {images.length > 0 ? (
                  <img src={images[imgIndex]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Package size={48} color="#ccc" />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                      style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <div key={i} onClick={() => setImgIndex(i)} style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: i === imgIndex ? '2px solid var(--prime-orange, #ff8c42)' : '2px solid transparent', flexShrink: 0 }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Info */}
              <div>
                <div style={{ fontSize: '12px', color: '#ff8c42', fontWeight: 700, marginBottom: '4px' }}>{product.category}</div>
                <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.3 }}>{product.name}</h2>
                <div style={{ fontSize: '12px', color: '#bbb', marginBottom: '12px' }}>SKU: {product.sku || product._id.substring(0, 8)}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span style={{ fontSize: '1rem', color: '#bbb', textDecoration: 'line-through' }}>₹{product.comparePrice.toLocaleString('en-IN')}</span>
                  )}
                  {discount && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '20px' }}>-{discount}%</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: stockStatus.color, background: stockStatus.bg, padding: '3px 10px', borderRadius: '20px' }}>{stockStatus.label}</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>{product.stock} units</span>
                </div>

                {product.description && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.7 }}>{product.description}</p>
                )}
              </div>

              {/* Creator Card */}
              {creator && (
                <div style={{ background: '#f8f9ff', border: '1px solid #e8eaff', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                    Listed by
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    {creator.profilePicture ? (
                      <img src={creator.profilePicture} alt={creator.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b35,#ff8c42)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={20} color="#fff" />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#1a1a1a' }}>{creator.name}</div>
                      {creator.storeName && <div style={{ fontSize: '12px', color: '#ff8c42', fontWeight: 600 }}>{creator.storeName}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <InfoRow icon={<Mail size={13} />} value={creator.email} href={`mailto:${creator.email}`} />
                    {creator.phone && <InfoRow icon={<Phone size={13} />} value={formatPhone(creator.phone)} href={`tel:${creator.phone}`} />}
                    {creator.storeLocation && <InfoRow icon={<MapPin size={13} />} value={creator.storeLocation} />}
                    {creator.storePhone && <InfoRow icon={<Phone size={13} />} value={creator.storePhone} label="Store" />}
                    {creator.storeDescription && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#aaa', marginTop: '1px', flexShrink: 0 }}><Store size={13} /></span>
                        <span style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{creator.storeDescription}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; value: string; href?: string; label?: string }> = ({ icon, value, href, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ color: '#aaa', flexShrink: 0 }}>{icon}</span>
    {label && <span style={{ fontSize: '11px', color: '#bbb', fontWeight: 600 }}>{label}:</span>}
    {href ? (
      <a href={href} style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>{value}</a>
    ) : (
      <span style={{ fontSize: '12px', color: '#555' }}>{value}</span>
    )}
  </div>
);

export default ProductPreviewModal;
