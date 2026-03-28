import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, RefreshCw } from 'lucide-react';
import { getAdvancedStats, type AdvancedStats } from '../../services/admin/statsService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import styles from '../../components/Admin/admin.module.css';

type Range = '7d' | '30d' | '90d' | 'custom';

const RANGES: { label: string; value: Range }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const BAR_COLORS = ['#ff8c42', '#ff6b2b', '#e55a1c', '#c44a00', '#a33a00'];

const AdvancedAnalytics: React.FC = () => {
  const [range, setRange] = useState<Range>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = range === 'custom' ? { from, to } : { range };
      const res = await getAdvancedStats(params as any);
      setData(res);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  }, [range, from, to]);

  useEffect(() => {
    if (range !== 'custom') load();
  }, [range]);

  const card = (title: string, value: string, icon: React.ReactNode, sub?: string) => (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div>
        <p className={styles.kpiLabel}>{title}</p>
        <p className={styles.kpiValue}>{value}</p>
        {sub && <p className={styles.kpiSub}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ maxWidth: 1400, margin: '0 auto' }}>
      <PrimeLoader isLoading={loading} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className={styles.pageLabel}>Analytics</p>
        <h2 className={styles.pageTitle}>Advanced Analytics</h2>
        <p className={styles.pageSubtitle}>Deep-dive into revenue trends, top products, and customer acquisition.</p>
      </div>

      {/* Range picker */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            style={{ padding: '8px 20px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              background: range === r.value ? 'var(--prime-gradient)' : '#f5f5f5',
              color: range === r.value ? '#fff' : '#555' }}>
            {r.label}
          </button>
        ))}
        {range === 'custom' && (
          <>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }} />
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }} />
            <button onClick={load} disabled={!from || !to}
              style={{ padding: '8px 20px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: (!from || !to) ? 0.5 : 1 }}>
              Apply
            </button>
          </>
        )}
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e5e7eb', borderRadius: 50, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {data && (
        <>
          {/* Funnel KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            {card('Total Orders', data.conversionFunnel.totalOrders.toString(), <ShoppingBag size={22} color="#ff8c42" />)}
            {card('Unique Customers', data.conversionFunnel.uniqueCustomers.toString(), <Users size={22} color="#ff8c42" />)}
            {card('Avg Orders / Customer', data.conversionFunnel.avgOrdersPerCustomer.toFixed(2), <TrendingUp size={22} color="#ff8c42" />, 'Conversion depth')}
            {card('Avg Order Value', data.aovByDay.length ? fmt(Math.round(data.aovByDay.reduce((s, d) => s + d.aov, 0) / data.aovByDay.length)) : '—', <TrendingUp size={22} color="#ff8c42" />, 'Period average')}
          </div>

          {/* AOV Trend */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: '24px', marginBottom: 20 }}>
            <p style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>Average Order Value Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.aovByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="aovGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8c42" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff8c42" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#aaa' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [fmt(v as number), 'AOV']} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 10, border: '1px solid #f0f0f2', fontSize: 12 }} />
                <Area type="monotone" dataKey="aov" stroke="#ff8c42" strokeWidth={2.5} fill="url(#aovGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Acquisition */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: '24px', marginBottom: 20 }}>
            <p style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>Customer Acquisition</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.customerAcquisition} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#aaa' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v as number, 'New Customers']} contentStyle={{ borderRadius: 10, border: '1px solid #f0f0f2', fontSize: 12 }} />
                <Area type="monotone" dataKey="newCustomers" stroke="#3b82f6" strokeWidth={2.5} fill="url(#custGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* By Revenue */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: '24px' }}>
              <p style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>Top 5 by Revenue</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topByRevenue} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#aaa' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#555' }} width={100} />
                  <Tooltip formatter={(v) => [fmt(v as number), 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid #f0f0f2', fontSize: 12 }} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {data.topByRevenue.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By Sales */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', padding: '24px' }}>
              <p style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>Top 5 by Units Sold</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topBySales} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#aaa' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#555' }} width={100} />
                  <Tooltip formatter={(v) => [v as number, 'Units']} contentStyle={{ borderRadius: 10, border: '1px solid #f0f0f2', fontSize: 12 }} />
                  <Bar dataKey="units" radius={[0, 6, 6, 0]}>
                    {data.topBySales.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AdvancedAnalytics;
