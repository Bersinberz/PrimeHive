import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../../assets/Logo.png";
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeName } = useSettings();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
    { name: 'Products', path: '/admin/products', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /> },
    { name: 'Category', path: '/admin/categories', icon: <> <path d="M3 7l9-4 9 4v10l-9 4-9-4z" /> <path d="M3 7l9 4 9-4" /> <path d="M12 11v10" /> </> },
    { name: 'Orders', path: '/admin/orders', icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
    { name: 'Customers', path: '/admin/customers', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /> },
    { name: 'Staff', path: '/admin/staff', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { name: 'analytics', path: '/admin/analytics', icon: <path d="M18 20V10M12 20V4M6 20v-6" /> },
    { name: 'Settings', path: '/admin/settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> }
  ];

  const displayName = user?.name || "Admin User";
  const displayRole = user?.role === "superadmin" ? "Super Admin" : "Staff";

  return (
    <div
      className="d-none d-lg-flex flex-column flex-shrink-0 p-3 shadow-lg text-white"
      style={{ width: '280px', height: '100%', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b' }}
    >
      <div className="d-flex align-items-center mb-5 mt-3 px-3">
        <img
          src={Logo}
          alt={`${storeName} Logo`}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            marginRight: "10px"
          }}
        />
        {/* Applied the global glowing gradient class here */}
        <span className="fs-4 brand-name-breathe tracking-wide">{storeName}</span>
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-2 px-2">
        {menuItems.map((item) => {
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
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff8c42&color=fff&rounded=true`} alt="Admin" width="40" height="40" className="rounded-circle shadow-sm" />
            <div className="ms-3 flex-grow-1">
              <h6 className="mb-0 fw-bold fs-6">{displayName}</h6>
              <small className="text-white-50 d-block" style={{ fontSize: '0.75rem' }}>{displayRole}</small>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-link text-white-50 p-0 ms-2 shadow-none"
              title="Logout"
              style={{ transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
