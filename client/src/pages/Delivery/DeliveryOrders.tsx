import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ChevronRight, RefreshCw } from 'lucide-react';
import { getMyDeliveries, type DeliveryOrder } from '../../services/delivery/deliveryService';
import PrimeLoader from '../../components/PrimeLoader';

const TABS = [
  { key: '',                label: 'All' },
  { key: 'assigned',        label: 'Assigned' },
  { key: 'picked_up',       label: 'Picked Up' },
  { key: 'out_for_delivery',label: 'Out for Delivery' },
  { key: 'delivered',       label: 'Delivered' },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  assigned:         { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  picked_up:        { color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  out_for_delivery: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  delivered:        { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const DeliveryOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('status') || '');
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDeliveries({ deliveryStatus: tab || undefined });
      setOrders(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PrimeLoader isLoading={loading} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px' }}>My Deliveries</h2>
        <button onClick={load} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 50, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#666', fontWeight: 600 }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '7px 16px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap',
              background: tab === t.key ? 'var(--prime-gradient)' : '#f5f5f5',
              color: tab === t.key ? '#fff' : '#555' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb' }}>
            <Package size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>No deliveries found</p>
          </div>
        )}
        {orders.map(order => {
          const ds = STATUS_STYLE[order.deliveryStatus] || { color: '#aaa', bg: '#f5f5f5' };
          return (
            <motion.div key={order._id} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/delivery/orders/${order._id}`)}
              style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: ds.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={20} color={ds.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1a1a1a' }}>{order.orderId}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ds.color, background: ds.bg, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                    {order.deliveryStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>{order.customer?.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#aaa' }}>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} · {fmt(order.totalAmount)}
                </p>
              </div>
              <ChevronRight size={16} color="#ccc" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DeliveryOrders;
