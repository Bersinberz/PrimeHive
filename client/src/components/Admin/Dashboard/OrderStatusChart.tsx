import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b', Paid: '#64748b', Processing: '#0ea5e9',
  Shipped: '#3b82f6', Delivered: '#22c55e', Cancelled: '#ef4444', Refunded: '#a855f7',
};

interface OrderStatusChartProps {
  data: any[];
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '20px', padding: '28px', height: '100%',
      }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
        Breakdown
      </p>
      <h5 style={{ fontWeight: 900, color: '#fff', fontSize: '1.1rem', margin: '0 0 20px', letterSpacing: '-0.3px' }}>
        Orders by Status
      </h5>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data} dataKey="count" nameKey="status"
            cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none"
          >
            {data.map((entry: any, i: number) => (
              <Cell key={i} fill={STATUS_COLORS[entry.status] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f2', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontWeight: 600 }}
            formatter={(value: any, name: any) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
        {data.map((s) => (
          <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: STATUS_COLORS[s.status] || '#64748b', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>{s.status} ({s.count})</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OrderStatusChart;
