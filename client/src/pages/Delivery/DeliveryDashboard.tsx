import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, CheckCircle2, Clock, Search, IndianRupee, MapPin, ChevronRight } from 'lucide-react';
import { getMyDeliveries, getMyEarnings, type DeliveryOrder } from '../../services/delivery/deliveryService';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton, SHIMMER_CSS } from '../../components/Delivery/DeliverySkeleton';
import { useNavigate, useOutletContext } from 'react-router-dom';

type Ctx = { dark: boolean; online: boolean; surface: string; text: string; muted: string; border: string };

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  assigned:         { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  picked_up:        { color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  out_for_delivery: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  delivered:        { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
};

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ctx = useOutletContext<Ctx>();
  const { dark, online, surface, text, muted, border } = ctx || {};

  const [counts, setCounts]   = useState({ assigned: 0, out_for_delivery: 0, delivered: 0, total: 0 });
  const [orders, setOrders]   = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [earnings, setEarnings] = useState({ today: 0, thisWeek: 0, total: 0, perOrder: 50 });

  useEffect(() => {
    const load = async () => {
      try {
        const [res, earn] = await Promise.all([getMyDeliveries(), getMyEarnings()]);
        const all = res.data;
        setOrders(all);
        setEarnings(earn);
        setCounts({
          assigned:         all.filter(o => o.deliveryStatus === 'assigned').length,
          out_for_delivery: all.filter(o => o.deliveryStatus === 'out_for_delivery').length,
          delivered:        all.filter(o => o.deliveryStatus === 'delivered').length,
          total:            all.length,
        });
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = orders.filter(o =>
    !search ||
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name.toLowerCase().includes(search.toLowerCase())
  );

  const active = counts.assigned + counts.out_for_delivery;

  const cards = [
    { label: 'Assigned',         value: counts.assigned,         icon: <Package size={20} color="#2563eb" />,      bg: 'rgba(37,99,235,0.1)',   color: '#2563eb',  status: 'assigned' },
    { label: 'Out for Delivery',  value: counts.out_for_delivery, icon: <Truck size={20} color="#d97706" />,        bg: 'rgba(245,158,11,0.1)',  color: '#d97706',  status: 'out_for_delivery' },
    { label: 'Delivered',         value: counts.delivered,        icon: <CheckCircle2 size={20} color="#059669" />, bg: 'rgba(16,185,129,0.1)',  color: '#059669',  status: 'delivered' },
    { label: 'Total',             value: counts.total,            icon: <Clock size={20} color="#7c3aed" />,        bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed',  status: '' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <style>{SHIMMER_CSS}</style>
      {loading && <DashboardSkeleton dark={dark} surface={surface} border={border} />}
      {!loading && (<>

      {/* ── GREETING + STATUS BANNER ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: '20px 20px 16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,140,66,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,140,66,0.05)' }} />
        <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Welcome back</p>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{user?.name} 👋</h2>

        {/* Mini stats row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '6px 12px' }}>
            <Package size={13} color="#ff8c42" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{active} Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '6px 12px' }}>
            <CheckCircle2 size={13} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{counts.delivered} Done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: online ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', borderRadius: 10, padding: '6px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: online ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: online ? '#10b981' : '#ef4444' }}>{online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* ── EARNINGS + QUICK ACTIONS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Earnings */}
        <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={16} color="#059669" />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today</span>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#059669', letterSpacing: '-1px' }}>{fmt(earnings.today)}</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: muted, fontWeight: 600 }}>Today's Earnings</p>
        </div>

        {/* Quick actions */}
        <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.68rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</p>
          {[
            { label: 'View Deliveries',    path: '/delivery/orders' },
            { label: 'Completed Orders',   path: '/delivery/orders?status=delivered' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', color: text, fontSize: '0.78rem', fontWeight: 600 }}>
              {a.label} <ChevronRight size={13} color={muted} />
            </button>
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {cards.map(c => (
          <motion.div key={c.label} whileTap={{ scale: 0.97 }}
            onClick={() => c.status && navigate(`/delivery/orders?status=${c.status}`)}
            style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '16px', cursor: c.status ? 'pointer' : 'default' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              {c.icon}
            </div>
            <p style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900, color: text, letterSpacing: '-1px' }}>{c.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: muted, fontWeight: 600 }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── SEARCH ── */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={15} color={muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search order ID or customer name..."
          style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 12, border: `1.5px solid ${border}`, background: surface, fontSize: '0.85rem', color: text, outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}
        />      </div>

      {/* ── RECENT ORDERS ── */}
      {search && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Search Results</p>
          {filtered.length === 0 && (
            <p style={{ color: muted, fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No orders found</p>
          )}
          {filtered.slice(0, 5).map(order => {
            const ds = STATUS_STYLE[order.deliveryStatus] || { color: '#aaa', bg: '#f5f5f5' };
            return (
              <motion.div key={order._id} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/delivery/orders/${order._id}`)}
                style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: ds.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={18} color={ds.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: text }}>{order.orderId}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ds.color, background: ds.bg, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                      {order.deliveryStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: muted }}>{order.customer?.name}</p>
                </div>
                <ChevronRight size={14} color={muted} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── CTA ── */}
      {!search && (
        <button onClick={() => navigate('/delivery/orders')}
          style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(255,107,43,0.3)' }}>
          <Truck size={18} /> View My Deliveries
        </button>
      )}
      </>)}
    </motion.div>
  );
};

export default DeliveryDashboard;
