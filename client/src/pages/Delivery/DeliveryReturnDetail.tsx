import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Package, CheckCircle2, RotateCcw, Store } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { OrderDetailSkeleton, SHIMMER_CSS } from '../../components/Delivery/DeliverySkeleton';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const STEPS = ['pickup_accepted', 'picked_up', 'returned_to_store'] as const;
const STEP_LABELS: Record<string, string> = {
  pickup_accepted:   'Accepted',
  picked_up:         'Picked Up',
  returned_to_store: 'Returned to Store',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const DeliveryReturnDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const ctx = useOutletContext<Ctx>();
  const { dark, surface, text, muted, border } = ctx || {};

  const [order, setOrder]       = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    axiosInstance.get('/delivery/returns')
      .then(res => {
        const found = res.data.data.find((o: any) => o._id === id);
        if (!found) navigate('/delivery/orders');
        else setOrder(found);
      })
      .catch(() => navigate('/delivery/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status: string) => {
    setUpdating(true);
    try {
      await axiosInstance.put(`/delivery/returns/${id}/status`, { status });
      setOrder((prev: any) => ({ ...prev, returnPickupStatus: status }));
      showToast({ type: 'success', title: 'Updated', message: STEP_LABELS[status] });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update status.' });
    } finally { setUpdating(false); }
  };

  if (loading) return (
    <>
      <style>{SHIMMER_CSS}</style>
      <OrderDetailSkeleton dark={dark} surface={surface} border={border} />
    </>
  );
  if (!order) return null;

  const addr    = order.shippingAddress;
  const curStep = STEPS.indexOf(order.returnPickupStatus);

  const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
    <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '16px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );

  const SLabel: React.FC<{ label: string }> = ({ label }) => (
    <p style={{ margin: '0 0 10px', fontSize: '0.62rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <style>{SHIMMER_CSS}</style>

      <button onClick={() => navigate('/delivery/orders')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontWeight: 700, fontSize: '0.82rem', marginBottom: 14, padding: 0 }}>
        <ArrowLeft size={15} /> My Deliveries
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>{order.orderId}</h2>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
              Return Pickup
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>Collect from customer → bring to store</p>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '4px 11px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          {STEP_LABELS[order.returnPickupStatus] || order.returnPickupStatus}
        </span>
      </div>

      {/* Timeline */}
      <Card>
        <SLabel label="Return Progress" />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((step, idx) => {
            const done   = idx <= curStep;
            const active = idx === curStep;
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: idx < STEPS.length - 1 ? 'none' : 1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? (active ? 'var(--prime-gradient)' : '#10b981') : (dark ? 'rgba(255,255,255,0.08)' : '#f0f0f2'), border: active ? '2px solid #ff8c42' : 'none', transition: 'all 0.3s' }}>
                    {done && !active ? <CheckCircle2 size={14} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#fff' : (dark ? 'rgba(255,255,255,0.2)' : '#ccc') }} />}
                  </div>
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: done ? (active ? '#ff8c42' : '#10b981') : muted, marginTop: 4, textAlign: 'center', maxWidth: 60 }}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: idx < curStep ? '#10b981' : (dark ? 'rgba(255,255,255,0.08)' : '#f0f0f2'), margin: '0 2px', marginBottom: 18, transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Customer — collect from here */}
      <Card>
        <SLabel label="Collect From (Customer)" />
        <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: '0.95rem', color: text }}>{order.customer?.name}</p>
        <a href={`tel:${order.customer?.phone}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 50, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}>
          <Phone size={13} /> {order.customer?.phone}
        </a>
      </Card>

      {/* Customer address */}
      <Card>
        <SLabel label="Pickup Address" />
        <div style={{ display: 'flex', gap: 10 }}>
          <MapPin size={14} color="#ff8c42" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: text, lineHeight: 1.7 }}>
            {[addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip].filter(Boolean).join(', ')}
          </p>
        </div>
      </Card>

      {/* Deliver to seller's store */}
      <Card style={{ border: '1.5px solid rgba(124,58,237,0.25)', background: dark ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.03)' }}>
        <SLabel label="Return To (Seller Store)" />
        {order.seller?.storePhone || order.seller?.storeLocation ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Store size={16} color="#7c3aed" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: text }}>{order.seller?.storeName || 'Seller Store'}</p>
              {order.seller?.storeLocation && <p style={{ margin: '2px 0 6px', fontSize: '0.75rem', color: muted }}>{order.seller.storeLocation}</p>}
              {order.seller?.storePhone && (
                <a href={`tel:${order.seller.storePhone}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 50, background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>
                  <Phone size={12} /> {order.seller.storePhone}
                </a>
              )}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.82rem', color: muted }}>Contact admin for store address.</p>
        )}
      </Card>

      {/* Items to collect */}
      <Card>
        <SLabel label={`Items to Collect (${order.items?.length || 0})`} />
        {(order.items || []).map((item: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < order.items.length - 1 ? 10 : 0, marginBottom: i < order.items.length - 1 ? 10 : 0, borderBottom: i < order.items.length - 1 ? `1px solid ${border}` : 'none' }}>
            {item.image && <img src={item.image} alt={item.name} style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: text }}>{item.name}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>Qty: {item.quantity} · {fmt(item.price)}</p>
            </div>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: muted, fontSize: '0.82rem' }}>Order Value</span>
          <span style={{ fontWeight: 900, fontSize: '1rem', color: text }}>{fmt(order.totalAmount)}</span>
        </div>
      </Card>

      {/* Action button */}
      {order.returnPickupStatus === 'pickup_accepted' && (
        <button onClick={() => handleStatus('picked_up')} disabled={updating}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: updating ? 0.7 : 1, boxShadow: '0 4px 16px rgba(255,107,43,0.3)', boxSizing: 'border-box' }}>
          <Package size={18} /> {updating ? 'Updating...' : 'Mark as Picked Up'}
        </button>
      )}

      {order.returnPickupStatus === 'picked_up' && (
        <button onClick={() => handleStatus('returned_to_store')} disabled={updating}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: updating ? 0.7 : 1, boxShadow: '0 4px 16px rgba(124,58,237,0.3)', boxSizing: 'border-box' }}>
          <Store size={18} /> {updating ? 'Updating...' : 'Returned to Store'}
        </button>
      )}

      {order.returnPickupStatus === 'returned_to_store' && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#059669', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <CheckCircle2 size={16} /> Return Completed
        </div>
      )}
    </motion.div>
  );
};

export default DeliveryReturnDetail;
