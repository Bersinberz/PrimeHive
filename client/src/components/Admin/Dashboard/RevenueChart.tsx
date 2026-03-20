import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    <div className="card border-0 shadow-sm bg-white h-100 p-4" style={{ borderRadius: '16px' }}>
      <h5 className="fw-bolder mb-4 text-dark">Revenue Analytics</h5>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8c42" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ff8c42" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
            labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          />
          <Area type="monotone" dataKey="revenue" stroke="#ff8c42" strokeWidth={3} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;