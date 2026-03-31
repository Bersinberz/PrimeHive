import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { IndianRupee, TrendingUp, Package, CheckCircle2 } from 'lucide-react';
import { getMyEarnings } from '../../services/delivery/deliveryService';
import { Bone, SHIMMER_CSS } from '../../components/Delivery/DeliverySkeleton';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const DeliveryEarnings: React.FC = () => {
  const ctx = useOutletContext<Ctx>();
  const { dark, surface, text, muted, border } = ctx || {};

  const [data, setData]     = useState<Awaited<ReturnType<typeof getMyEarnings>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEarnings().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Bone h={22} w="140px" r={6} mb={4} dark={dark} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[0,1,2].map(i => <div key={i} style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, padding: 16 }}><Bone h={28} r={6} mb={8} dark={dark} /><Bone h={12} w="60%" r={6} dark={dark} /></div>)}
        </div>
        <Bone h={14} w="100px" r={6} mb={4} dark={dark} />
        {[0,1,2,3].map(i => <div key={i} style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}><Bone w="120px" h={13} r={6} dark={dark} /><Bone w="60px" h={13} r={6} dark={dark} /></div>)}
      </div>
    </>
  );

  const summary = [
    { label: "Today",     value: data?.today    ?? 0, icon: <IndianRupee size={16} color="#059669" />, bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
    { label: "This Week", value: data?.thisWeek ?? 0, icon: <TrendingUp  size={16} color="#2563eb" />, bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
    { label: "All Time",  value: data?.total    ?? 0, icon: <Package     size={16} color="#7c3aed" />, bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <style>{SHIMMER_CSS}</style>

      <h2 style={{ margin: '0 0 18px', fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>My Earnings</h2>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {summary.map(s => (
          <div key={s.label} style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, padding: '14px 12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              {s.icon}
            </div>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: s.color, letterSpacing: '-0.5px' }}>{fmt(s.value)}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.62rem', color: muted, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per order rate */}
      <div style={{ background: dark ? 'rgba(255,140,66,0.08)' : 'rgba(255,140,66,0.06)', borderRadius: 12, border: '1px solid rgba(255,140,66,0.2)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IndianRupee size={16} color="#ff8c42" />
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: text }}>
          You earn <span style={{ color: '#ff8c42' }}>₹{data?.perOrder ?? 50}</span> per completed delivery
        </p>
      </div>

      {/* History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Delivery History ({data?.totalCount ?? 0})
        </p>
      </div>

      {(!data?.orders || data.orders.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: muted }}>
          <CheckCircle2 size={32} style={{ marginBottom: 10, opacity: 0.25 }} />
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: text, margin: '0 0 4px' }}>No deliveries yet</p>
          <p style={{ fontSize: '0.78rem', color: muted, margin: 0 }}>Completed deliveries will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.orders.map((order, i) => (
            <motion.div key={order.orderId}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={16} color="#059669" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: text }}>{order.orderId}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: muted }}>{order.city} · {fmtDate(order.deliveredAt)}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '0.9rem', color: '#059669' }}>+{fmt(order.earned)}</p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: muted }}>Order: {fmt(order.amount)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DeliveryEarnings;
