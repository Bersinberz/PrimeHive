import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "../../assets/Logo.png";
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { getInitialsAvatar } from '../../utils/avatarUtils';
import type { Permissions } from '../../services/authService';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeName } = useSettings();
  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/auth");
  };

  const isSuperAdmin = user?.role === 'superadmin';

  // Helper: check if staff has view permission for a module
  const canView = (module: keyof Permissions): boolean => {
    if (isSuperAdmin) return true;
    if (!user?.permissions) return false;
    const m = user.permissions[module] as Record<string, boolean> | undefined;
    return m?.view === true;
  };

  const allMenuItems = [
    { name: 'Dashboard',  path: '/admin/dashboard',  module: 'dashboard'  as keyof Permissions, icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
    { name: 'Products',   path: '/admin/products',   module: 'products'   as keyof Permissions, icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /> },
    { name: 'Category',   path: '/admin/categories', module: 'categories' as keyof Permissions, icon: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4" /><path d="M12 11v10" /></> },
    { name: 'Orders',     path: '/admin/orders',     module: 'orders'     as keyof Permissions, icon: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></> },
    { name: 'Customers',  path: '/admin/customers',  module: 'customers'  as keyof Permissions, superAdminOnly: true, icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /> },
    { name: 'Staff',      path: '/admin/staff',      module: 'staff'      as keyof Permissions, superAdminOnly: true, icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { name: 'Settings',   path: '/admin/settings',   module: 'settings'   as keyof Permissions, superAdminOnly: true, icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
    { name: 'Store Profile', path: '/admin/store-profile', module: 'dashboard' as keyof Permissions, staffOnly: true, icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
    { name: 'Account Settings', path: '/admin/account-settings', module: 'dashboard' as keyof Permissions, staffOnly: true, icon: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
  ];

  // Filter: superAdminOnly → superadmin only; staffOnly → staff only; others by view permission
  const menuItems = allMenuItems.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin;
    if ((item as any).staffOnly) return !isSuperAdmin;
    return canView(item.module);
  });

  const displayName = user?.name || "Admin User";
  const displayRole = user?.role === "superadmin" ? "Super Admin" : "Staff";

  return (
    <div
      className="d-none d-lg-flex flex-column flex-shrink-0 p-3 shadow-lg text-white"
      style={{ width: '280px', height: '100%', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b' }}
    >
      {/* Logout overlay */}
      {loggingOut && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid rgba(255,140,66,0.2)', borderTop: '3px solid var(--prime-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Signing out...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
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
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: '12px' }} onClick={() => navigate(isSuperAdmin ? '/admin/profile' : '/admin/account-settings')}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" width="40" height="40" className="rounded-circle shadow-sm" style={{ objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <img src={getInitialsAvatar(displayName)} alt="Admin" width="40" height="40" className="rounded-circle shadow-sm" style={{ flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <h6 className="mb-0 fw-bold fs-6" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</h6>
                <small className="text-white-50 d-block" style={{ fontSize: '0.75rem' }}>{displayRole}</small>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn btn-link text-white-50 p-0 ms-2 shadow-none"
              title="Logout"
              style={{ transition: 'color 0.2s', opacity: loggingOut ? 0.5 : 1 }}
              onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.color = '#ef4444'; }}
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
