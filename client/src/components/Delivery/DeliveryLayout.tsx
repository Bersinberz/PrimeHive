import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Truck, Package, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const NAV = [
  { path: '/delivery/dashboard', label: 'Dashboard', Icon: Truck },
  { path: '/delivery/orders',    label: 'My Deliveries', Icon: Package },
];

const DeliveryLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { storeName } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => { await logout(); navigate('/auth'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top navbar */}
      <nav style={{ background: '#0f172a', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Truck size={22} color="#ff8c42" />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{storeName} · Delivery</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>{user?.name}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      {/* Bottom tab bar (mobile) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0f0f2', display: 'flex', zIndex: 100, padding: '8px 0' }}>
        {NAV.map(({ path, label, Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: active ? 'var(--prime-orange)' : '#aaa' }}>
              <Icon size={20} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>{label}</span>
            </Link>
          );
        })}
        <button onClick={() => navigate('/delivery/profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: location.pathname === '/delivery/profile' ? 'var(--prime-orange)' : '#aaa' }}>
          <User size={20} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>Profile</span>
        </button>
      </div>

      {/* Page content */}
      <main style={{ flex: 1, padding: '20px 16px 80px', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
