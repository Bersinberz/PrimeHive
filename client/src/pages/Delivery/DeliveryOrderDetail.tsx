import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Package, Camera, CheckCircle2 } from 'lucide-react';
import { getDeliveryOrderById, updateDeliveryStatus, uploadProof, type DeliveryOrder } from '../../services/delivery/deliveryService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }> = {
  assigned:         { next: 'picked_up',        label: 'Mark as Picked Up',       color: '#d97706' },
  picked_up:        { next: 'out_for_delivery',  label: 'Out for Delivery',         color: '#7c3aed' },
  out_for_delivery: { next: 'delivered',         label: 'Mark as Delivered',        color: '#059669' },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  assigned:         { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  picked_up:        { color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  out_for_delivery: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  delivered:        { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const DeliveryOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getDeliveryOrderById(id).then(setOrder).catch(() => navigate('/delivery/orders')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    const flow = STATUS_FLOW[order.deliveryStatus];
    if (!flow) return;
    setUpdating(true);
    try {
      await updateDeliveryStatus(order._id, flow.next);
      setOrder(prev => prev ? { ...prev, deliveryStatus: flow.next as any, status: flow.next === 'delivered' ? 'Delivered' : prev.status } : prev);
      showToast({ type: 'success', title: 'Updated', message: `Status: ${flow.next.replace(/_/g, ' ')}` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update status.' });
    } finally { setUpdating(false); }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;
    setUploading(true);
    try {
      const res = await uploadProof(order._id, file);
      setOrder(prev => prev ? { ...prev, proofOfDelivery: res.proofOfDelivery } : prev);
      showToast({ type: 'success', title: 'Uploaded', message: 'Proof of delivery saved.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to upload proof.' });
    } finally { setUploading(false); e.target.value = ''; }
  };

  if (loading) return <PrimeLoader isLoading />;
  if (!order) return null;

  const ds = STATUS_STYLE[order.deliveryStatus] || { color: '#aaa', bg: '#f5f5f5' };
  const flow = STATUS_FLOW[order.deliveryStatus];
  const addr = order.shippingAddress;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PrimeLoader isLoading={updating || uploading} />

      <button onClick={() => navigate('/delivery/orders')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontWeight: 700, fontSize: '0.85rem', marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> My Deliveries
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px' }}>{order.orderId}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#aaa' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ds.color, background: ds.bg, padding: '4px 12px', borderRadius: 20, textTransform: 'capitalize' }}>
          {order.deliveryStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Customer */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '16px', marginBottom: 12 }}>
        <p style={{ margin: '0 0 12px', fontSize: '0.68rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Customer</p>
        <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a' }}>{order.customer?.name}</p>
        <a href={`tel:${order.customer?.phone}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 50, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
          <Phone size={13} /> {order.customer?.phone}
        </a>
      </div>

      {/* Address */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '16px', marginBottom: 12 }}>
        <p style={{ margin: '0 0 10px', fontSize: '0.68rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Deliver To</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <MapPin size={16} color="var(--prime-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#444', lineHeight: 1.7 }}>
            {[addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip].filter(Boolean).join(', ')}
          </p>
        </div>
        <a href={`https://maps.google.com/?q=${encodeURIComponent([addr?.line1, addr?.city, addr?.state, addr?.zip].filter(Boolean).join(', '))}`}
          target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '8px 16px', borderRadius: 50, background: 'rgba(16,185,129,0.08)', color: '#059669', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
          Open in Maps
        </a>
      </div>

      {/* Items */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '16px', marginBottom: 12 }}>
        <p style={{ margin: '0 0 12px', fontSize: '0.68rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Items ({order.items.length})</p>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < order.items.length - 1 ? 10 : 0, marginBottom: i < order.items.length - 1 ? 10 : 0, borderBottom: i < order.items.length - 1 ? '1px solid #f5f5f7' : 'none' }}>
            {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a' }}>{item.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>Qty: {item.quantity} · {fmt(item.price)}</p>
            </div>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #f0f0f2', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: '#aaa', fontSize: '0.85rem' }}>Total</span>
          <span style={{ fontWeight: 900, fontSize: '1rem', color: '#1a1a1a' }}>{fmt(order.totalAmount)}</span>
        </div>
      </div>

      {/* Proof of delivery */}
      {order.deliveryStatus === 'delivered' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '16px', marginBottom: 12 }}>
          <p style={{ margin: '0 0 12px', fontSize: '0.68rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Proof of Delivery</p>
          {order.proofOfDelivery ? (
            <img src={order.proofOfDelivery} alt="Proof" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 200 }} />
          ) : (
            <>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="d-none" onChange={handleProofUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 50, border: '1.5px dashed #e5e7eb', background: '#fafafa', color: '#666', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                <Camera size={16} /> {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Action button */}
      {flow && (
        <button onClick={handleStatusUpdate} disabled={updating}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: updating ? 0.7 : 1 }}>
          <CheckCircle2 size={18} /> {updating ? 'Updating...' : flow.label}
        </button>
      )}

      {order.deliveryStatus === 'delivered' && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#059669', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <CheckCircle2 size={16} /> Delivery Completed
        </div>
      )}
    </motion.div>
  );
};

export default DeliveryOrderDetail;
