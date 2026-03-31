import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Package, ChevronRight, RefreshCw, Search, Phone, MapPin,
  CheckCircle2, XCircle, Clock, IndianRupee, AlertTriangle,
} from 'lucide-react';
import { getMyDeliveries, acceptOrder, rejectOrder, type DeliveryOrder } from '../../services/delivery/deliveryService';
import { useToast } from '../../context/ToastContext';
import { OrderCardSkeleton, SHIMMER_CSS } from '../../components/Delivery/DeliverySkeleton';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const TABS = [
  { key: '',                 label: 'All' },
  { key: 'assigned',         label: 'Assigned' },
  { key: 'picked_up',        label: 'Picked Up' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
];

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  assigned:         { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',  label: 'Assigned' },
  picked_up:        { color: '#d97706', bg: 'rgba(245,158,11,0.1)', label: 'Picked Up' },
  out_for_delivery: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', label: 'Out for Delivery' },
  delivered:        { color: '#059669', bg: 'rgba(16,185,129,0.1)', label: 'Delivered' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const timeAgo = (d: string) => {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const isCOD = (method: string) =>
  method?.toLowerCase().includes('cod') || method?.toLowerCase().includes('cash');

const POLL_MS = 30000;

const DeliveryOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ctx = useOutletContext<Ctx>();
  const { dark, surface, text, muted, border } = ctx || {};
  const { showToast } = useToast();

  const [tab, setTab]         = useState(searchParams.get('status') || '');
  const [orders, setOrders]   = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [acting, setActing]   = useState<string | null>(null);
  const [pulling, setPulling] = useState(false);
  const touchY = useRef(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMyDeliveries({ deliveryStatus: tab || undefined });
      setOrders(res.data);
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (e.changedTouches[0].clientY - touchY.current > 80 && window.scrollY === 0) {
      setPulling(true);
      load().finally(() => setPulling(false));
    }
  };
  const handleAccept = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActing(id);
    try {
      await acceptOrder(id);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, deliveryStatus: 'picked_up' as any } : o));
      showToast({ type: 'success', title: 'Order accepted', message: 'Status updated to Picked Up.' });
    } catch { showToast({ type: 'error', title: 'Failed', message: 'Could not accept order.' }); }
    finally { setActing(null); }
  };

  const handleReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActing(id);
    try {
      await rejectOrder(id);
      setOrders(prev => prev.filter(o => o._id !== id));
      showToast({ type: 'success', title: 'Order rejected', message: 'Order has been unassigned.' });
    } catch { showToast({ type: 'error', title: 'Failed', message: 'Could not reject order.' }); }
    finally { setActing(null); }
  };

  const filtered = orders.filter(o =>
    !search ||
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const p: Record<string, number> = { assigned: 0, picked_up: 1, out_for_delivery: 2, delivered: 3 };
    const diff = (p[a.deliveryStatus] ?? 9) - (p[b.deliveryStatus] ?? 9);
    return diff !== 0 ? diff : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <style>{SHIMMER_CSS}</style>
      <AnimatePresence>
        {pulling && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 36 }} exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8c42', fontSize: '0.78rem', fontWeight: 700, gap: 6 }}>
            <RefreshCw size={14} className="spin" /> Refreshing...
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>My Deliveries</h2>
        <button onClick={() => load()} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 50, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: muted, fontWeight: 600 }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={14} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID or customer..."
          style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12, border: `1.5px solid ${border}`, background: surface, fontSize: '0.82rem', color: text, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '6px 14px', borderRadius: 50, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap',
              border: tab === t.key ? 'none' : `1px solid ${border}`,
              background: tab === t.key ? 'var(--prime-gradient)' : surface,
              color: tab === t.key ? '#fff' : muted,
            } as any}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Skeleton cards while loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map(i => <OrderCardSkeleton key={i} dark={dark} surface={surface} border={border} />)}
        </div>
      )}

      {!loading && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: muted }}>
            <Package size={36} style={{ marginBottom: 10, opacity: 0.25 }} />
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: text, margin: '0 0 4px' }}>No deliveries found</p>
            <p style={{ fontSize: '0.78rem', color: muted, margin: 0 }}>Pull down to refresh</p>
          </div>
        )}

        {sorted.map((order, i) => {
          const sm      = STATUS_META[order.deliveryStatus] || { color: '#aaa', bg: '#f5f5f5', label: order.deliveryStatus };
          const cod     = isCOD(order.paymentMethod);
          const isNew   = order.deliveryStatus === 'assigned';
          const addr    = order.shippingAddress;
          const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent([addr?.line1, addr?.city, addr?.state].filter(Boolean).join(', '))}`;

          return (
            <motion.div key={order._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{
                background: surface, borderRadius: 18, overflow: 'hidden',
                border: isNew ? '2px solid rgba(37,99,235,0.4)' : `1px solid ${border}`,
                boxShadow: isNew ? '0 4px 20px rgba(37,99,235,0.1)' : '0 1px 6px rgba(0,0,0,0.04)',
              }}>

              {isNew && (
                <div style={{ background: 'linear-gradient(90deg,#2563eb,#3b82f6)', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={11} color="#fff" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px' }}>New Order Assigned</span>
                </div>
              )}

              {/* Card body */}
              <div onClick={() => navigate(`/delivery/orders/${order._id}`)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      <span style={{ fontWeight: 900, fontSize: '0.9rem', color: text }}>{order.orderId}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: cod ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: cod ? '#dc2626' : '#059669' }}>
                        {cod ? '💵 COD' : '✅ Paid'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: text }}>{order.customer?.name}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sm.color, background: sm.bg, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>{sm.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>{fmt(order.totalAmount)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
                    <MapPin size={11} color={muted} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.73rem', color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[addr?.line1, addr?.city, addr?.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 8 }}>
                    <Clock size={10} color={muted} />
                    <span style={{ fontSize: '0.68rem', color: muted, fontWeight: 600 }}>{timeAgo(order.assignedAt || order.createdAt)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: dark ? 'rgba(255,255,255,0.05)' : '#f5f5f7', borderRadius: 8, padding: '3px 9px' }}>
                    <Package size={10} color={muted} />
                    <span style={{ fontSize: '0.68rem', color: muted, fontWeight: 600 }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '3px 9px' }}>
                    <IndianRupee size={10} color="#059669" />
                    <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>₹50 / delivery</span>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div style={{ borderTop: `1px solid ${border}`, padding: '10px 14px', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <a href={`tel:${order.customer?.phone}`} onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, background: 'rgba(37,99,235,0.08)', color: '#2563eb', textDecoration: 'none', fontWeight: 700, fontSize: '0.7rem' }}>
                  <Phone size={12} /> Call
                </a>
                <a href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, background: 'rgba(37,211,102,0.1)', color: '#25d366', textDecoration: 'none', fontWeight: 700, fontSize: '0.7rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, background: 'rgba(16,185,129,0.08)', color: '#059669', textDecoration: 'none', fontWeight: 700, fontSize: '0.7rem' }}>
                  <MapPin size={12} /> Maps
                </a>

                <div style={{ flex: 1 }} />

                {order.deliveryStatus === 'assigned' && (
                  <>
                    <button onClick={e => handleReject(order._id, e)} disabled={acting === order._id}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>
                      <XCircle size={12} /> Reject
                    </button>
                    <button onClick={e => handleAccept(order._id, e)} disabled={acting === order._id}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>
                      <CheckCircle2 size={12} /> Accept
                    </button>
                  </>
                )}

                {order.deliveryStatus !== 'assigned' && (
                  <button onClick={() => navigate(`/delivery/orders/${order._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, border: `1px solid ${border}`, background: 'transparent', color: muted, fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>
                    Details <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>}

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DeliveryOrders;
