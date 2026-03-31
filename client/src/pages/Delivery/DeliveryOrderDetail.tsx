import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Camera, CheckCircle2, IndianRupee, ShieldCheck, Store } from 'lucide-react';
import {
  getDeliveryOrderById, updateDeliveryStatus, uploadProof,
  sendDeliveryOtp, verifyDeliveryOtp, type DeliveryOrder,
} from '../../services/delivery/deliveryService';
import { useToast } from '../../context/ToastContext';
import { OrderDetailSkeleton, SHIMMER_CSS } from '../../components/Delivery/DeliverySkeleton';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const STATUS_FLOW: Record<string, { next: string; label: string }> = {
  picked_up:        { next: 'out_for_delivery', label: 'Start Delivery' },
  out_for_delivery: { next: 'delivered',        label: 'Mark as Delivered' },
};

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  assigned:         { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',  label: 'Assigned' },
  picked_up:        { color: '#d97706', bg: 'rgba(245,158,11,0.1)', label: 'Picked Up' },
  out_for_delivery: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', label: 'Out for Delivery' },
  delivered:        { color: '#059669', bg: 'rgba(16,185,129,0.1)', label: 'Delivered' },
};

const TIMELINE_STEPS = ['assigned', 'picked_up', 'out_for_delivery', 'delivered'];
const TIMELINE_LABELS: Record<string, string> = {
  assigned: 'Order Placed', picked_up: 'Picked Up', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const isCOD = (method: string) =>
  method?.toLowerCase().includes('cod') || method?.toLowerCase().includes('cash');

const DeliveryOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const ctx = useOutletContext<Ctx>();
  const { dark, surface, text, muted, border } = ctx || {};

  const [order, setOrder]         = useState<DeliveryOrder | null>(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);
  const [uploading, setUploading] = useState(false);

  // OTP state
  const [otpStep, setOtpStep]     = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const [otpValue, setOtpValue]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getDeliveryOrderById(id)
      .then(o => {
        setOrder(o);
        if (o.deliveryOtpVerified) setOtpStep('verified');
      })
      .catch(() => navigate('/delivery/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    const flow = STATUS_FLOW[order.deliveryStatus];
    if (!flow) return;

    // Require OTP verification before marking delivered
    if (flow.next === 'delivered' && otpStep !== 'verified') {
      showToast({ type: 'error', title: 'OTP Required', message: 'Please verify the delivery OTP first.' });
      return;
    }

    setUpdating(true);
    try {
      await updateDeliveryStatus(order._id, flow.next);
      setOrder(prev => prev ? { ...prev, deliveryStatus: flow.next as any } : prev);
      showToast({ type: 'success', title: 'Status updated', message: TIMELINE_LABELS[flow.next] });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e?.response?.data?.message || 'Failed to update status.' });
    } finally { setUpdating(false); }
  };

  const handleSendOtp = async () => {
    if (!order) return;
    setOtpStep('sending');
    try {
      await sendDeliveryOtp(order._id);
      setOtpStep('sent');
      showToast({ type: 'success', title: 'OTP sent', message: 'OTP sent to customer email.' });
    } catch {
      setOtpStep('idle');
      showToast({ type: 'error', title: 'Error', message: 'Failed to send OTP.' });
    }
  };

  const handleVerifyOtp = async () => {
    if (!order || !otpValue) return;
    setOtpStep('verifying');
    try {
      await verifyDeliveryOtp(order._id, otpValue);
      setOtpStep('verified');
      setOrder(prev => prev ? { ...prev, deliveryOtpVerified: true } : prev);
      showToast({ type: 'success', title: 'OTP verified', message: 'You can now mark as delivered.' });
    } catch (e: any) {
      setOtpStep('sent');
      showToast({ type: 'error', title: 'Invalid OTP', message: e?.response?.data?.message || 'Incorrect OTP.' });
    }
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

  if (loading) return (
    <>
      <style>{SHIMMER_CSS}</style>
      <OrderDetailSkeleton dark={dark} surface={surface} border={border} />
    </>
  );
  if (!order)  return null;

  const ds      = STATUS_META[order.deliveryStatus] || { color: '#aaa', bg: '#f5f5f5', label: order.deliveryStatus };
  const flow    = STATUS_FLOW[order.deliveryStatus];
  const addr    = order.shippingAddress;
  const cod     = isCOD(order.paymentMethod);
  const curStep = TIMELINE_STEPS.indexOf(order.deliveryStatus);

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
            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: cod ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: cod ? '#dc2626' : '#059669' }}>
              {cod ? '💵 COD' : '✅ Paid'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ds.color, background: ds.bg, padding: '4px 11px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          {ds.label}
        </span>
      </div>

      {/* ── DELIVERY TIMELINE ── */}
      <Card>
        <SLabel label="Delivery Progress" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {TIMELINE_STEPS.map((step, idx) => {
            const done   = idx <= curStep;
            const active = idx === curStep;
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: idx < TIMELINE_STEPS.length - 1 ? 'none' : 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? (active ? 'var(--prime-gradient)' : '#10b981') : (dark ? 'rgba(255,255,255,0.08)' : '#f0f0f2'),
                    border: active ? '2px solid #ff8c42' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done && !active
                      ? <CheckCircle2 size={14} color="#fff" />
                      : <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#fff' : (dark ? 'rgba(255,255,255,0.2)' : '#ccc') }} />
                    }
                  </div>
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: done ? (active ? '#ff8c42' : '#10b981') : muted, marginTop: 4, textAlign: 'center', maxWidth: 52 }}>
                    {TIMELINE_LABELS[step]}
                  </span>
                </div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: idx < curStep ? '#10b981' : (dark ? 'rgba(255,255,255,0.08)' : '#f0f0f2'), margin: '0 2px', marginBottom: 18, transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Customer */}
      <Card>
        <SLabel label="Customer" />
        <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: '0.95rem', color: text }}>{order.customer?.name}</p>
        <a href={`tel:${order.customer?.phone}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 50, background: 'rgba(37,99,235,0.08)', color: '#2563eb', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}>
          <Phone size={13} /> {order.customer?.phone}
        </a>
      </Card>

      {/* Shop contact */}
      {order.seller?.storePhone && (
        <Card>
          <SLabel label="Seller Contact" />
          <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.95rem', color: text }}>
            {order.seller.storeName || 'Seller'}
          </p>
          {order.seller.storeLocation && (
            <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: muted }}>{order.seller.storeLocation}</p>
          )}
          <a href={`tel:${order.seller.storePhone}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 50, background: 'rgba(255,140,66,0.08)', color: '#ff8c42', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}>
            <Store size={13} /> {order.seller.storePhone}
          </a>
        </Card>
      )}

      {/* Address */}
      <Card>
        <SLabel label="Deliver To" />
        <div style={{ display: 'flex', gap: 10 }}>
          <MapPin size={14} color="#ff8c42" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: text, lineHeight: 1.7 }}>
            {[addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip].filter(Boolean).join(', ')}
          </p>
        </div>
      </Card>

      {/* Payment */}
      <Card>
        <SLabel label="Payment" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: cod ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={16} color={cod ? '#dc2626' : '#059669'} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: text }}>{cod ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>{cod ? 'Collect cash from customer' : 'Already paid online'}</p>
            </div>
          </div>
          <span style={{ fontWeight: 900, fontSize: '1rem', color: text }}>{fmt(order.totalAmount)}</span>
        </div>
      </Card>

      {/* Items */}
      <Card>
        <SLabel label={`Items (${order.items.length})`} />
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < order.items.length - 1 ? 10 : 0, marginBottom: i < order.items.length - 1 ? 10 : 0, borderBottom: i < order.items.length - 1 ? `1px solid ${border}` : 'none' }}>
            {item.image && <img src={item.image} alt={item.name} style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: text }}>{item.name}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>Qty: {item.quantity} · {fmt(item.price)}</p>
            </div>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: muted, fontSize: '0.82rem' }}>Total</span>
          <span style={{ fontWeight: 900, fontSize: '1rem', color: text }}>{fmt(order.totalAmount)}</span>
        </div>
      </Card>

      {/* ── OTP VERIFICATION (only for out_for_delivery) ── */}
      {order.deliveryStatus === 'out_for_delivery' && (
        <Card style={{ border: otpStep === 'verified' ? '1.5px solid rgba(16,185,129,0.4)' : `1px solid ${border}` }}>
          <SLabel label="Delivery OTP Verification" />
          {otpStep === 'verified' || order.deliveryOtpVerified ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 12 }}>
              <ShieldCheck size={20} color="#059669" />
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.88rem', color: '#059669' }}>OTP Verified</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>Customer confirmed delivery</p>
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: muted, lineHeight: 1.6 }}>
                Send a 6-digit OTP to the customer's email. Ask them to share it with you to confirm delivery.
              </p>
              {otpStep === 'idle' && (
                <button onClick={handleSendOtp}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                  Send OTP to Customer
                </button>
              )}
              {otpStep === 'sending' && (
                <div style={{ textAlign: 'center', padding: '12px', color: muted, fontSize: '0.85rem' }}>Sending OTP...</div>
              )}
              {(otpStep === 'sent' || otpStep === 'verifying') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>✓ OTP sent to customer email</p>
                  <input
                    value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${border}`, background: surface, fontSize: '1.2rem', color: text, outline: 'none', textAlign: 'center', letterSpacing: '8px', fontWeight: 800, boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleSendOtp} style={{ flex: 1, padding: '11px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent', color: muted, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                      Resend
                    </button>
                    <button onClick={handleVerifyOtp} disabled={otpValue.length !== 6 || otpStep === 'verifying'}
                      style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', opacity: otpValue.length !== 6 ? 0.6 : 1 }}>
                      {otpStep === 'verifying' ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Action button */}
      {flow && (
        <button onClick={handleStatusUpdate} disabled={updating}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: updating ? 0.7 : 1, boxShadow: '0 4px 16px rgba(255,107,43,0.3)', boxSizing: 'border-box' }}>
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
