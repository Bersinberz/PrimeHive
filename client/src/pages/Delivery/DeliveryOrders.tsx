import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Package, ChevronRight, RefreshCw, Search, Phone,
  CheckCircle2, XCircle, Clock, IndianRupee, AlertTriangle, RotateCcw,
} from 'lucide-react';
import { getMyDeliveries, acceptOrder, rejectOrder, type DeliveryOrder } from '../../services/delivery/deliveryService';
import axiosInstance from '../../services/axiosInstance';
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
  const [returnPickups, setReturnPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [acting, setActing]   = useState<string | null>(null);
  const [pulling, setPulling] = useState(false);
  const touchY = useRef(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [res, retRes] = await Promise.all([
        getMyDeliveries({ deliveryStatus: tab || undefined }),
        tab === '' || tab === 'assigned' ? axiosInstance.get('/delivery/returns') : Promise.resolve({ data: { data: [] } }),
      ]);
      setOrders(res.data);
      setReturnPickups((retRes as any).data?.data || []);
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
        {/* Return pickup cards */}
        {returnPickups.map((rp, i) => {
          const isAssigned = rp.returnPickupStatus === 'assigned';
          const isAccepted = rp.returnPickupStatus === 'pickup_accepted';
          const isPickedUp = rp.returnPickupStatus === 'picked_up';

          return (
            <motion.div key={rp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: surface, borderRadius: 18, overflow: 'hidden', border: isAssigned ? '2px solid rgba(124,58,237,0.4)' : `1px solid ${border}`, boxShadow: isAssigned ? '0 4px 20px rgba(124,58,237,0.1)' : '0 1px 6px rgba(0,0,0,0.04)' }}>

              {/* Banner */}
              <div style={{ background: 'linear-gradient(90deg,#7c3aed,#8b5cf6)', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={11} color="#fff" />
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {isAssigned ? 'Return Pickup Request' : isPickedUp ? 'Return · Picked Up' : 'Return · Accepted'}
                </span>
              </div>

              {/* Card body — tappable only after accepted */}
              <div
                onClick={() => !isAssigned && navigate(`/delivery/returns/${rp._id}`)}
                style={{ padding: '14px 16px', cursor: isAssigned ? 'default' : 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: text }}>{rp.orderId}</span>
                    {!isAssigned && <p style={{ margin: '2px 0 0', fontSize: '0.82rem', fontWeight: 700, color: text }}>{rp.customer?.name}</p>}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {rp.returnPickupStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: dark ? 'rgba(255,255,255,0.05)' : '#f5f5f7', borderRadius: 8, padding: '3px 9px' }}>
                    <Package size={10} color={muted} />
                    <span style={{ fontSize: '0.68rem', color: muted, fontWeight: 600 }}>{rp.items?.length || 0} item{rp.items?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(124,58,237,0.08)', borderRadius: 8, padding: '3px 9px' }}>
                    <IndianRupee size={10} color="#7c3aed" />
                    <span style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 700 }}>₹50 / pickup</span>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div style={{ borderTop: `1px solid ${border}`, padding: '10px 14px', display: 'flex', gap: 6, alignItems: 'center' }}>
                {isAssigned && (
                  <>
                    <button onClick={async e => {
                      e.stopPropagation();
                      try {
                        await axiosInstance.put(`/delivery/returns/${rp._id}/reject`);
                        setReturnPickups(prev => prev.filter(r => r._id !== rp._id));
                        showToast({ type: 'success', title: 'Rejected', message: 'Return pickup rejected.' });
                      } catch { showToast({ type: 'error', title: 'Error', message: 'Failed.' }); }
                    }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 9, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      <XCircle size={13} /> Reject
                    </button>
                    <button onClick={async e => {
                      e.stopPropagation();
                      try {
                        await axiosInstance.put(`/delivery/returns/${rp._id}/accept`);
                        setReturnPickups(prev => prev.map(r => r._id === rp._id ? { ...r, returnPickupStatus: 'pickup_accepted' } : r));
                        showToast({ type: 'success', title: 'Accepted', message: 'Return pickup accepted. Tap card for details.' });
                      } catch { showToast({ type: 'error', title: 'Error', message: 'Failed.' }); }
                    }} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      <CheckCircle2 size={13} /> Accept Pickup
                    </button>
                  </>
                )}
                {!isAssigned && (
                  <button onClick={() => navigate(`/delivery/returns/${rp._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, border: `1px solid ${border}`, background: 'transparent', color: muted, fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>
                    Details <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
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
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px' }}>New Order Request</span>
                </div>
              )}

              {/* Card body */}
              <div onClick={() => !isNew && navigate(`/delivery/orders/${order._id}`)}
                style={{ padding: '14px 16px', cursor: isNew ? 'default' : 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      <span style={{ fontWeight: 900, fontSize: '0.9rem', color: text }}>{order.orderId}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: cod ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: cod ? '#dc2626' : '#059669' }}>
                        {cod ? '💵 COD' : '✅ Paid'}
                      </span>
                    </div>
                    {/* Only show customer name after accepting */}
                    {!isNew && <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: text }}>{order.customer?.name}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sm.color, background: sm.bg, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>{sm.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>{fmt(order.totalAmount)}</span>
                  </div>
                </div>

                {/* For assigned: only show items count + time. For others: show address too */}
                {!isNew && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.73rem', color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {[addr?.city, addr?.state].filter(Boolean).join(', ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 8 }}>
                      <Clock size={10} color={muted} />
                      <span style={{ fontSize: '0.68rem', color: muted, fontWeight: 600 }}>{timeAgo(order.assignedAt || order.createdAt)}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: dark ? 'rgba(255,255,255,0.05)' : '#f5f5f7', borderRadius: 8, padding: '3px 9px' }}>
                    <Package size={10} color={muted} />
                    <span style={{ fontSize: '0.68rem', color: muted, fontWeight: 600 }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '3px 9px' }}>
                    <IndianRupee size={10} color="#059669" />
                    <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>₹50 / delivery</span>
                  </div>
                  {isNew && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 'auto' }}>
                      <Clock size={10} color={muted} />
                      <span style={{ fontSize: '0.68rem', color: muted, fontWeight: 600 }}>{timeAgo(order.assignedAt || order.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div style={{ borderTop: `1px solid ${border}`, padding: '10px 14px', display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* Assigned: only Accept / Reject */}
                {isNew && (
                  <>
                    <button onClick={e => handleReject(order._id, e)} disabled={acting === order._id}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 9, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      <XCircle size={13} /> Reject
                    </button>
                    <button onClick={e => handleAccept(order._id, e)} disabled={acting === order._id}
                      style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 9, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      <CheckCircle2 size={13} /> Accept Order
                    </button>
                  </>
                )}

                {/* Accepted: Call + Details */}
                {!isNew && (
                  <>
                    <a href={`tel:${order.customer?.phone}`} onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, background: 'rgba(37,99,235,0.08)', color: '#2563eb', textDecoration: 'none', fontWeight: 700, fontSize: '0.7rem' }}>
                      <Phone size={12} /> Call
                    </a>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => navigate(`/delivery/orders/${order._id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 9, border: `1px solid ${border}`, background: 'transparent', color: muted, fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>
                      Details <ChevronRight size={12} />
                    </button>
                  </>
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
