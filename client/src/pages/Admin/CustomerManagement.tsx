import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// --- Types ---
type CustomerStatus = 'Active' | 'Inactive' | 'Banned';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  ordersCount: number;
  totalSpent: string;
  status: CustomerStatus;
  location: string;
}

const CustomerManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // --- Mock Data ---
  const [customers] = useState<Customer[]>([
    { id: 'CUST-001', name: 'Emma Wilson', email: 'emma.wilson@example.com', phone: '+1 (555) 123-4567', joinedDate: 'Jan 12, 2024', ordersCount: 12, totalSpent: '$1,240.00', status: 'Active', location: 'San Francisco, CA' },
    { id: 'CUST-002', name: 'Liam Brown', email: 'liam.b@example.com', phone: '+1 (555) 987-6543', joinedDate: 'Mar 05, 2024', ordersCount: 8, totalSpent: '$850.50', status: 'Active', location: 'Austin, TX' },
    { id: 'CUST-003', name: 'Olivia Jones', email: 'olivia.j@example.com', phone: '+1 (555) 456-7890', joinedDate: 'Aug 19, 2024', ordersCount: 3, totalSpent: '$210.00', status: 'Inactive', location: 'Miami, FL' },
    { id: 'CUST-004', name: 'Noah Miller', email: 'noah.m@badactor.com', phone: '+1 (555) 000-0000', joinedDate: 'Oct 01, 2025', ordersCount: 0, totalSpent: '$0.00', status: 'Banned', location: 'Unknown' },
  ]);

  // Framer Motion Variants
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  // Helper for Status Badge Styling
  const getStatusBadgeClass = (status: CustomerStatus) => {
    switch (status) {
      case 'Active': return 'bg-success bg-opacity-10 text-success';
      case 'Inactive': return 'bg-warning bg-opacity-10 text-warning';
      case 'Banned': return 'bg-danger bg-opacity-10 text-danger';
      default: return 'bg-light text-dark';
    }
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setView('profile');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          /* =========================================
             VIEW 1: CUSTOMERS LIST
             ========================================= */
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Customers</h2>
                <p className="text-muted mb-0">Manage your store's customer base and account statuses.</p>
              </div>
              <div className="d-flex gap-3">
                <div className="input-group shadow-sm" style={{ width: '300px' }}>
                  <span className="input-group-text bg-white border-light border-end-0 text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </span>
                  <input type="text" className="form-control border-light border-start-0 shadow-none" placeholder="Search customers..." />
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="card border-0 shadow-sm bg-white overflow-hidden" style={{ borderRadius: '16px' }}>
              <div className="table-responsive p-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light bg-opacity-50">
                    <tr>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Customer</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-center">Orders</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Total Spent</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary">Status</th>
                      <th className="py-3 px-4 border-0 text-uppercase small fw-bold text-secondary text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 border-light">
                          <div className="d-flex align-items-center">
                            <img src={`https://ui-avatars.com/api/?name=${c.name.replace(' ', '+')}&background=f8fafc&color=475569`} alt={c.name} className="rounded-circle me-3 border" width="44" height="44" />
                            <div>
                              <span className="fw-bold text-dark d-block mb-1">{c.name}</span>
                              <small className="text-muted">{c.email}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-light text-center fw-medium text-secondary">
                          <span className="badge bg-light text-dark px-3 py-2 rounded-pill border">{c.ordersCount}</span>
                        </td>
                        <td className="py-3 px-4 border-light text-end fw-bolder text-dark">{c.totalSpent}</td>
                        <td className="py-3 px-4 border-light">
                          <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusBadgeClass(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-light text-end">
                          <button onClick={() => handleViewProfile(c)} className="btn btn-sm fw-bold px-3 py-2 rounded-3 text-primary bg-primary bg-opacity-10 border-0 shadow-none transition-all hover-opacity" title="View Profile">
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

        ) : (
          /* =========================================
             VIEW 2: CUSTOMER PROFILE
             ========================================= */
          selectedCustomer && (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              
              {/* Header */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <button onClick={() => setView('list')} className="btn btn-light rounded-circle p-2 border-0 shadow-sm" style={{ width: '40px', height: '40px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div>
                  <h3 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Customer Profile</h3>
                  <p className="text-muted mb-0">Manage details, history, and account restrictions.</p>
                </div>
              </div>

              <div className="row g-4">
                
                {/* LEFT COLUMN: Identity & Contact */}
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                  {/* ID Card */}
                  <div className="card border-0 shadow-sm bg-white p-4 text-center position-relative overflow-hidden" style={{ borderRadius: '16px' }}>
                    <div className="position-absolute top-0 start-0 w-100 h-25" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}></div>
                    
                    <div className="position-relative mt-4 mb-3">
                      <img src={`https://ui-avatars.com/api/?name=${selectedCustomer.name.replace(' ', '+')}&background=fff&color=0f172a`} alt={selectedCustomer.name} className="rounded-circle border border-4 border-white shadow-sm" width="96" height="96" />
                    </div>
                    
                    <h5 className="fw-bolder text-dark mb-1">{selectedCustomer.name}</h5>
                    <p className="text-muted small mb-3">{selectedCustomer.location}</p>
                    
                    <div className="mb-4">
                      <span className={`badge rounded-pill px-4 py-2 fw-bold ${getStatusBadgeClass(selectedCustomer.status)}`}>
                        Account Status: {selectedCustomer.status}
                      </span>
                    </div>

                    <div className="d-flex flex-column text-start gap-3 mt-4 pt-4 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small fw-bold text-uppercase">Email</span>
                        <span className="fw-medium text-dark">{selectedCustomer.email}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small fw-bold text-uppercase">Phone</span>
                        <span className="fw-medium text-dark">{selectedCustomer.phone}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small fw-bold text-uppercase">Customer Since</span>
                        <span className="fw-medium text-dark">{selectedCustomer.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Future Feature: Promote to Admin */}
                  <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-3 shadow-sm text-warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      </div>
                      <h6 className="fw-bolder text-dark mb-0">Staff Privileges</h6>
                    </div>
                    <p className="text-muted small mb-4">Grant this customer access to the PrimeHive Admin Dashboard.</p>
                    <button className="btn w-100 fw-bold py-2 disabled border-0 text-white" style={{ background: '#cbd5e1', borderRadius: '8px', cursor: 'not-allowed' }} title="Coming in future update">
                      Promote to Admin (Coming Soon)
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Stats & Danger Zone */}
                <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                  
                  {/* Stats Row */}
                  <div className="row g-4">
                    <div className="col-sm-6">
                      <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="text-muted fw-bold text-uppercase mb-0">Total Lifetime Value</h6>
                          <div className="p-2 bg-success bg-opacity-10 text-success rounded-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                          </div>
                        </div>
                        <h2 className="fw-bolder text-dark mb-0">{selectedCustomer.totalSpent}</h2>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="card border-0 shadow-sm bg-white p-4 h-100" style={{ borderRadius: '16px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="text-muted fw-bold text-uppercase mb-0">Total Orders</h6>
                          <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                          </div>
                        </div>
                        <h2 className="fw-bolder text-dark mb-0">{selectedCustomer.ordersCount}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="card border-0 shadow-sm p-4 mt-auto" style={{ borderRadius: '16px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                    <h5 className="fw-bolder text-danger mb-4 d-flex align-items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Danger Zone
                    </h5>
                    
                    <div className="d-flex flex-column gap-3">
                      {/* Deactivate Action */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center p-3 bg-white rounded-3 shadow-sm border-0">
                        <div className="mb-3 mb-sm-0 me-3">
                          <h6 className="fw-bold text-dark mb-1">Deactivate Account</h6>
                          <p className="text-muted small mb-0">Temporarily suspend the customer's ability to log in and make purchases.</p>
                        </div>
                        <button className="btn btn-outline-warning fw-bold px-4" style={{ whiteSpace: 'nowrap', borderRadius: '8px' }}>
                          Deactivate
                        </button>
                      </div>

                      {/* Ban Action */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center p-3 bg-white rounded-3 shadow-sm border-0">
                        <div className="mb-3 mb-sm-0 me-3">
                          <h6 className="fw-bold text-dark mb-1">Ban Customer</h6>
                          <p className="text-muted small mb-0">Permanently revoke access and blacklist this email address.</p>
                        </div>
                        <button className="btn btn-danger fw-bold px-4 text-white" style={{ whiteSpace: 'nowrap', borderRadius: '8px' }}>
                          Ban User
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomerManagement;