import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

type SettingsSection = 'general' | 'shipping' | 'security';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  // Framer Motion Variants
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{ maxWidth: '1400px' }}
    >
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Store Settings</h2>
          <p className="text-muted mb-0">Manage your store preferences, taxes, and security.</p>
        </div>
        <div>
          <button className="btn text-white fw-bold shadow-sm px-5 py-2 border-0" style={{ background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))', borderRadius: '10px' }}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Vertical Navigation */}
        <div className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm bg-white p-3" style={{ borderRadius: '16px' }}>
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={() => setActiveSection('general')}
                className={`btn d-flex align-items-center gap-3 w-100 text-start border-0 py-3 px-3 fw-bold transition-all ${activeSection === 'general' ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'bg-transparent text-muted hover-bg-light'}`}
                style={{ borderRadius: '12px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                General Defaults
              </button>
              
              <button 
                onClick={() => setActiveSection('shipping')}
                className={`btn d-flex align-items-center gap-3 w-100 text-start border-0 py-3 px-3 fw-bold transition-all ${activeSection === 'shipping' ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'bg-transparent text-muted hover-bg-light'}`}
                style={{ borderRadius: '12px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Shipping & Taxes
              </button>

              <button 
                onClick={() => setActiveSection('security')}
                className={`btn d-flex align-items-center gap-3 w-100 text-start border-0 py-3 px-3 fw-bold transition-all ${activeSection === 'security' ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'bg-transparent text-muted hover-bg-light'}`}
                style={{ borderRadius: '12px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Admin & Security
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="col-12 col-lg-9">
          <div className="card border-0 shadow-sm bg-white p-4 p-md-5 h-100" style={{ borderRadius: '16px' }}>
            <AnimatePresence mode="wait">
              
              {/* 1️⃣ GENERAL SETTINGS */}
              {activeSection === 'general' && (
                <motion.div key="general" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Store Details</h5>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Store Name</label>
                      <input type="text" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark" defaultValue="PrimeHive Electronics" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Support Email</label>
                      <input type="email" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark" defaultValue="support@primehive.com" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Store Currency</label>
                      <select className="form-select form-select-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark">
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="INR">INR (₹) - Indian Rupee</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Timezone</label>
                      <select className="form-select form-select-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark">
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                      </select>
                    </div>
                    <div className="col-12 mt-4 pt-4 border-top">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Order ID Prefix</label>
                      <input type="text" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark w-50" defaultValue="ORD-" />
                      <small className="text-muted d-block mt-2">Example: ORD-1001, ORD-1002</small>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2️⃣ SHIPPING & TAX SETTINGS */}
              {activeSection === 'shipping' && (
                <motion.div key="shipping" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Shipping & Taxes</h5>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Standard Shipping Rate</label>
                      <div className="input-group input-group-lg border-light bg-light rounded-3 overflow-hidden">
                        <span className="input-group-text border-0 bg-transparent text-muted fw-bold">$</span>
                        <input type="number" className="form-control border-0 bg-transparent shadow-none fw-medium text-dark" defaultValue="15.00" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Free Shipping Threshold</label>
                      <div className="input-group input-group-lg border-light bg-light rounded-3 overflow-hidden">
                        <span className="input-group-text border-0 bg-transparent text-muted fw-bold">$</span>
                        <input type="number" className="form-control border-0 bg-transparent shadow-none fw-medium text-dark" defaultValue="100.00" />
                      </div>
                      <small className="text-muted d-block mt-1">Orders above this amount get free shipping.</small>
                    </div>
                    
                    <div className="col-12 mt-3 pt-4 border-top">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-3">Tax Configuration</label>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label className="form-label text-muted small fw-bold">Default Tax Rate (%)</label>
                          <input type="number" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark" defaultValue="8.5" />
                        </div>
                        <div className="col-md-6 d-flex align-items-center pt-md-4">
                          <div className="form-check form-switch fs-5">
                            <input className="form-check-input shadow-none" type="checkbox" role="switch" id="taxInclusive" defaultChecked />
                            <label className="form-check-label fs-6 fw-medium text-dark ms-2" htmlFor="taxInclusive">Prices include tax</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3️⃣ SECURITY & ADMIN PROFILE */}
              {activeSection === 'security' && (
                <motion.div key="security" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3">Admin Profile</h5>
                  
                  <div className="d-flex align-items-center gap-4 mb-5">
                    <div className="position-relative">
                      <img src="https://ui-avatars.com/api/?name=Admin+User&background=ff8c42&color=fff" alt="Admin" className="rounded-circle shadow-sm" width="80" height="80" />
                      <button className="position-absolute bottom-0 end-0 btn btn-sm btn-light rounded-circle shadow-sm border p-1" title="Change Avatar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      </button>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Admin User</h6>
                      <p className="text-muted small mb-0">admin@primehive.com</p>
                    </div>
                  </div>

                  <h5 className="fw-bolder mb-4 text-dark border-bottom pb-3 mt-4 pt-2">Change Password</h5>
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Current Password</label>
                      <input type="password" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark w-75" placeholder="••••••••" />
                    </div>
                    <div className="col-md-6 mt-4">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">New Password</label>
                      <input type="password" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark" placeholder="••••••••" />
                    </div>
                    <div className="col-md-6 mt-4">
                      <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Confirm New Password</label>
                      <input type="password" className="form-control form-control-lg border-light bg-light rounded-3 shadow-none fw-medium text-dark" placeholder="••••••••" />
                    </div>
                    <div className="col-12 mt-4 pt-4 border-top">
                      <button className="btn btn-outline-danger fw-bold px-4 py-2" style={{ borderRadius: '8px' }}>
                        Log out of all devices
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;