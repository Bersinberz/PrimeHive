import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  // Get the current URL path to determine which link is active
  const location = useLocation();

  // Sidebar Menu Items - Now with 'path' routing
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
    { name: 'Products', path: '/admin/products', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /> },
    { name: 'Orders', path: '/admin/orders', icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
    { name: 'Customers', path: '/admin/customers', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <path d="M18 20V10M12 20V4M6 20v-6" /> },
    { name: 'Media Library', path: '/admin/media', icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></> },
    { name: 'Settings', path: '/admin/settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> }
  ];

  return (
    <div 
      className="d-none d-lg-flex flex-column flex-shrink-0 p-3 shadow-lg text-white" 
      style={{ width: '280px', height: '100%', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b' }} 
    >
      <div className="d-flex align-items-center mb-5 mt-3 px-3">
        <div className="rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', background: 'var(--prime-gradient, linear-gradient(135deg, #ff8c42 0%, #ff5722 100%))' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        </div>
        <span className="fs-5 fw-bold text-white tracking-wide">PrimeHive</span>
      </div>
      
      <ul className="nav nav-pills flex-column mb-auto gap-2 px-2">
        <li className="nav-item mb-2 small text-uppercase text-white-50 fw-bold px-3 tracking-wider">Menu</li>
        {menuItems.map((item) => {
          // Check if the current URL path matches the item's path
          const isActive = location.pathname.includes(item.path);

          return (
            <li className="nav-item" key={item.name}>
              <Link 
                to={item.path}
                className={`nav-link d-flex align-items-center gap-3 w-100 text-start border-0 py-3 text-decoration-none ${isActive ? 'fw-bold text-white shadow-sm' : 'text-white-50 hover-text-white'}`}
                style={{ 
                  backgroundColor: isActive ? 'rgba(255, 140, 66, 0.15)' : 'transparent',
                  color: isActive ? 'var(--prime-deep, #ff8c42)' : '',
                  borderRadius: '12px', 
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--prime-deep, #ff8c42)' : 'inherit' }}>
                  {item.icon}
                </svg>
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-auto px-2 pb-2">
        <div className="p-3 rounded-4" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="d-flex align-items-center text-white text-decoration-none">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=ff8c42&color=fff&rounded=true" alt="Admin" width="40" height="40" className="rounded-circle shadow-sm" />
            <div className="ms-3">
              <h6 className="mb-0 fw-bold fs-6">Admin User</h6>
              <small className="text-white-50 d-block" style={{ fontSize: '0.75rem' }}>Manager</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;