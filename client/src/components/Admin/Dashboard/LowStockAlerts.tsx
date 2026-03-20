import React from 'react';

interface LowStockAlertsProps {
  products: any[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  return (
    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bolder mb-0 text-danger d-flex align-items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Low Inventory
        </h5>
      </div>
      <div className="d-flex flex-column gap-3">
        {products.length > 0 ? products.map((item, i) => (
          <div key={i} className="p-3 bg-white rounded-4 shadow-sm border-0 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{item.product}</h6>
              <small className="text-muted d-block">{item.sku}</small>
            </div>
            <div className="text-end">
              <span className={`badge rounded-pill ${item.status === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'} mb-1`}>
                {item.stock} left
              </span>
            </div>
          </div>
        )) : (
          <div className="text-center py-3 text-muted small">All products are well stocked!</div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;