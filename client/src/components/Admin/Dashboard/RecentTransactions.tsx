import React from 'react';

interface RecentTransactionsProps {
  orders: any[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ orders }) => {
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      Delivered: 'bg-success bg-opacity-10 text-success',
      Processing: 'bg-info bg-opacity-10 text-info',
      Shipped: 'bg-primary bg-opacity-10 text-primary',
      Pending: 'bg-warning bg-opacity-10 text-warning',
      Paid: 'bg-secondary bg-opacity-10 text-secondary',
      Cancelled: 'bg-danger bg-opacity-10 text-danger',
      Refunded: 'bg-danger bg-opacity-10 text-danger',
    };
    return map[status] || 'bg-light text-dark';
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="card border-0 shadow-sm bg-white h-100 p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
      <div className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
        <h5 className="fw-bolder mb-0 text-dark">Recent Transactions</h5>
      </div>
      <div className="table-responsive px-4 pb-4">
        <table className="table table-hover align-middle mb-0">
          <thead className="small text-uppercase text-muted fw-bold">
            <tr>
              <th className="py-3 border-bottom-0 text-secondary">Order Details</th>
              <th className="py-3 border-bottom-0 text-secondary">Date</th>
              <th className="py-3 border-bottom-0 text-secondary">Status</th>
              <th className="py-3 border-bottom-0 text-secondary text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order._id}>
                <td className="py-3 border-light">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-3 d-flex align-items-center justify-content-center me-3 text-muted" style={{ width: '40px', height: '40px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">{order.orderId}</h6>
                      <small className="text-muted">{order.customer?.name || 'Unknown'}</small>
                    </div>
                  </div>
                </td>
                <td className="py-3 border-light text-muted small fw-medium">{formatTimeAgo(order.createdAt)}</td>
                <td className="py-3 border-light">
                  <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 border-light text-end fw-bolder text-dark fs-6">₹{order.totalAmount.toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-muted">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;