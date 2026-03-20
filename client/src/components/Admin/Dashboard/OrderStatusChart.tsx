import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b', Paid: '#64748b', Processing: '#0ea5e9',
  Shipped: '#3b82f6', Delivered: '#22c55e', Cancelled: '#ef4444', Refunded: '#a855f7',
};

interface OrderStatusChartProps {
  data: any[];
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  return (
    <div className="card border-0 shadow-sm h-100 p-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <h5 className="fw-bolder mb-3 text-white">Orders by Status</h5>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data} dataKey="count" nameKey="status"
            cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none"
          >
            {data.map((entry: any, i: number) => (
              <Cell key={i} fill={STATUS_COLORS[entry.status] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            formatter={(value: any, name: any) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
        {data.map((s) => (
          <div key={s.status} className="d-flex align-items-center gap-2">
            <span style={{ width: '8px', height: '8px', backgroundColor: STATUS_COLORS[s.status] || '#64748b', borderRadius: '50%', display: 'inline-block' }}></span>
            <span className="text-white-50 small">{s.status} ({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart;