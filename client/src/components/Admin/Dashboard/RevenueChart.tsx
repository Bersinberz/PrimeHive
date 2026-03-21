import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface RevenueChartProps {
  data: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f2', padding: '28px', height: '100%' }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
        Analytics
      </p>
      <h5 style={{ fontWeight: 900, color: '#1a1a1a', fontSize: '1.1rem', margin: '0 0 24px', letterSpacing: '-0.3px' }}>
        Revenue This Week
      </h5>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8c42" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ff8c42" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f7" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
            tick={{ fill: '#bbb', fontSize: 11, fontWeight: 600 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fill: '#bbb', fontSize: 11, fontWeight: 600 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '14px', border: '1px solid #f0f0f2', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontWeight: 600 }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
            labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          />
          <Area type="monotone" dataKey="revenue" stroke="#ff8c42" strokeWidth={2.5} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default RevenueChart;
