import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Logo from "../../assets/Logo.png";
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { getInitialsAvatar } from '../../utils/avatarUtils';
import type { Permissions } from '../../services/authService';

const SvgIcon: React.FC<{ d: React.ReactNode; active: boolean }> = ({ d, active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, color: active ? 'var(--prime-orange)' : 'rgba(255,255,255,0.4)' }}>
    {d}
  </svg>
);

const NavItem: React.FC<{ path: string; label: string; icon: React.ReactNode }> = ({ path, label, icon }) => {
  const location = useLocation();
  const active = location.pathname === path || location.pathname.startsWith(path + '/');
  return (
    <Link to={path} style={{ textDecoration: 'none', display: 'block', marginBottom: 1 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px',
          borderRadius: 9, transition: 'background 0.15s',
          background: active ? 'rgba(255,140,66,0.13)' : 'transparent',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <SvgIcon d={icon} active={active} />
        <span style={{
          fontSize: '0.92rem', fontWeight: active ? 700 : 400,
          color: active ? '#fff' : 'rgba(255,255,255,0.5)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {label}
        </span>
        {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--prime-orange)', flexShrink: 0 }} />}
      </div>
    </Link>
  );
};

const NavGroup: React.FC<{ label: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '1px',
      }}>
        {label}
        <ChevronDown size={11} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

const Divider = () => <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />;

const I = {
  dashboard: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  products:  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />,
  category:  <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4" /><path d="M12 11v10" /></>,
  orders:    <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
  customers: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  staff:     <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  offers:    <><path d="M9 14l6-6" /><circle cx="9.5" cy="9.5" r="0.5" fill="currentColor" /><circle cx="14.5" cy="14.5" r="0.5" fill="currentColor" /><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z" /></>,
  reviews:   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  returns:   <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" /></>,
  analytics: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  auditlog:  <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
  bulk:      <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></>,
  admstaff:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  delivery:  <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
  settings:  <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  store:     <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  account:   <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { storeName } = useSettings();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdminStaff = user?.role === 'admin_staff';
  const isStaff      = user?.role === 'staff';

  const canView = (module: keyof Permissions): boolean => {
    if (isSuperAdmin || isAdminStaff) return true;
    if (!user?.permissions) return false;
    const m = user.permissions[module] as Record<string, boolean> | undefined;
    return m?.view === true;
  };

  const handleLogout = async () => { setLoggingOut(true); await logout(); navigate('/auth'); };
  const displayName = user?.name || 'Admin';
  const displayRole = isSuperAdmin ? 'Super Admin' : isAdminStaff ? 'Admin Staff' : 'Staff';

  return (
    <div className="d-none d-lg-flex flex-column flex-shrink-0 shadow-lg"
      style={{ width: 240, height: '100%', background: '#0f172a', borderRight: '1px solid #1e293b', overflow: 'hidden', color: '#fff' }}>

      {loggingOut && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(255,140,66,0.2)', borderTop: '3px solid var(--prime-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Signing out...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <img src={Logo} alt={storeName} style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
        <span className="brand-name-breathe" style={{ fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{storeName}</span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px', scrollbarWidth: 'none' }}>

        <NavItem path="/admin/dashboard" label="Dashboard" icon={I.dashboard} />
        <Divider />

        {(canView('products') || canView('categories')) && (
          <NavGroup label="Catalog" defaultOpen>
            {canView('products')   && <NavItem path="/admin/products"      label="Products"    icon={I.products} />}
            {canView('categories') && <NavItem path="/admin/categories"    label="Categories"  icon={I.category} />}
            {canView('products')   && <NavItem path="/admin/bulk-products" label="Bulk Import" icon={I.bulk} />}
          </NavGroup>
        )}

        {(canView('orders') || canView('customers')) && (
          <NavGroup label="Sales" defaultOpen>
            {canView('orders')    && <NavItem path="/admin/orders"    label="Orders"    icon={I.orders} />}
            {canView('orders')    && <NavItem path="/admin/returns"   label="Returns"   icon={I.returns} />}
            {canView('customers') && <NavItem path="/admin/customers" label="Customers" icon={I.customers} />}
          </NavGroup>
        )}

        {isSuperAdmin && (
          <NavGroup label="Marketing">
            <NavItem path="/admin/offers"  label="Offers & Coupons" icon={I.offers} />
            <NavItem path="/admin/reviews" label="Reviews"          icon={I.reviews} />
          </NavGroup>
        )}

        {isSuperAdmin && (
          <NavGroup label="People">
            <NavItem path="/admin/staff"             label="Sellers"           icon={I.staff} />
            <NavItem path="/admin/admin-staff"       label="Admin Staff"       icon={I.admstaff} />
            <NavItem path="/admin/delivery-partners" label="Delivery Partners" icon={I.delivery} />
          </NavGroup>
        )}

        {isSuperAdmin && (
          <NavGroup label="Insights">
            <NavItem path="/admin/analytics" label="Analytics" icon={I.analytics} />
            <NavItem path="/admin/audit-log" label="Audit Log" icon={I.auditlog} />
          </NavGroup>
        )}

        {isStaff && (
          <>
            <Divider />
            <NavItem path="/admin/store-profile"    label="Store Profile"    icon={I.store} />
            <NavItem path="/admin/account-settings" label="Account Settings" icon={I.account} />
          </>
        )}

        {isSuperAdmin && (
          <>
            <Divider />
            <NavItem path="/admin/settings" label="Settings" icon={I.settings} />
          </>
        )}
      </div>

      {/* User card */}
      <div style={{ padding: '8px 8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 9 }}
            onClick={() => navigate(isSuperAdmin ? '/admin/profile' : '/admin/account-settings')}>
            <img src={user?.profilePicture || getInitialsAvatar(displayName)} alt="avatar"
              width="32" height="32" className="rounded-circle" style={{ objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{displayRole}</p>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, flexShrink: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


