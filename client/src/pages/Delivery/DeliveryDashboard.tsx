import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, CheckCircle2, Clock } from 'lucide-react';
import { getMyDeliveries } from '../../services/delivery/deliveryService';
import { useAuth } from '../../context/AuthContext';
import PrimeLoader from '../../components/PrimeLoader';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ assigned: 0, out_for_delivery: 0, delivered: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyDeliveries();
        const all = res.data;
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

  const cards = [
    { label: 'Assigned',        value: counts.assigned,         icon: <Package size={22} color="#2563eb" />,  bg: 'rgba(37,99,235,0.08)',  color: '#2563eb',  status: 'assigned' },
    { label: 'Out for Delivery', value: counts.out_for_delivery, icon: <Truck size={22} color="#d97706" />,   bg: 'rgba(245,158,11,0.08)', color: '#d97706',  status: 'out_for_delivery' },
    { label: 'Delivered Today',  value: counts.delivered,        icon: <CheckCircle2 size={22} color="#059669" />, bg: 'rgba(16,185,129,0.08)', color: '#059669', status: 'delivered' },
    { label: 'Total Orders',     value: counts.total,            icon: <Clock size={22} color="#7c3aed" />,   bg: 'rgba(124,58,237,0.08)', color: '#7c3aed',  status: '' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PrimeLoader isLoading={loading} />

      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa', fontWeight: 600 }}>Welcome back,</p>
        <h2 style={{ margin: '2px 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px' }}>{user?.name} 👋</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <motion.div key={c.label} whileTap={{ scale: 0.97 }}
            onClick={() => c.status && navigate(`/delivery/orders?status=${c.status}`)}
            style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f2', padding: '18px 16px', cursor: c.status ? 'pointer' : 'default' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {c.icon}
            </div>
            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px' }}>{c.value}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#aaa', fontWeight: 600 }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      <button onClick={() => navigate('/delivery/orders')}
        style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Truck size={18} /> View My Deliveries
      </button>
    </motion.div>
  );
};

export default DeliveryDashboard;
