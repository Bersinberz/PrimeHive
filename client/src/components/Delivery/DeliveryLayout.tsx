import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, LogOut, User, Moon, Sun,
  Phone, AlertCircle, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/Logo.png';
import { getInitialsAvatar } from '../../utils/avatarUtils';
import { toggleOnlineStatus, getMyNotifications, type DeliveryNotification } from '../../services/delivery/deliveryService';

const ONLINE_KEY = 'delivery_online';
const DARK_KEY   = 'delivery_dark';

const NAV = [
  { path: '/delivery/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/delivery/orders',    label: 'Deliveries', Icon: Package },
];

const DeliveryLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [dark, setDark]     = useState(() => localStorage.getItem(DARK_KEY) === 'true');
  const [online, setOnline] = useState(() => localStorage.getItem(ONLINE_KEY) !== 'false');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifs, setNotifs]           = useState<DeliveryNotification[]>([]);
  const [unread, setUnread]           = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef<string>(localStorage.getItem('delivery_notif_seen') || '');

  useEffect(() => { localStorage.setItem(DARK_KEY,   String(dark));   }, [dark]);
  useEffect(() => {
    localStorage.setItem(ONLINE_KEY, String(online));
    toggleOnlineStatus(online).catch(() => {});
  }, [online]);

  const fetchNotifs = async () => {
    try {
      const data = await getMyNotifications();
      setNotifs(data);
      const newest = data[0]?.time || '';
      const newCount = data.filter(n => n.time > lastSeenRef.current).length;
      setUnread(newCount);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/auth'); };

  const bg      = dark ? '#0f172a' : '#f1f5f9';
  const surface = dark ? '#1e293b' : '#ffffff';
  const text    = dark ? '#f1f5f9' : '#1a1a1a';
  const muted   = dark ? 'rgba(241,245,249,0.45)' : '#888';
  const border  = dark ? 'rgba(255,255,255,0.08)' : '#f0f0f2';
  const navBg   = dark ? '#0a0f1e' : '#0f172a';

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s' } as any}>

      {/* ── TOP NAV ── */}
      <nav style={{
        background: navBg, padding: '0 14px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 200,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        WebkitTapHighlightColor: 'transparent',
      }}>
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={Logo} alt="PrimeHive" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span className="brand-name-breathe" style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.5px' }}>PrimeHive</span>

        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

          {/* Online toggle */}
          <button onClick={() => setOnline(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
            borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem',
            background: online ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: online ? '#10b981' : '#ef4444', transition: 'all 0.2s',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: online ? '#10b981' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
            {online ? 'Online' : 'Offline'}
          </button>

          {/* Dark mode */}
          <button onClick={() => setDark(v => !v)} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
            padding: '7px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => {
                setNotifOpen(v => !v); setProfileOpen(false);
                // mark all as seen
                if (!notifOpen && notifs.length > 0) {
                  const newest = notifs[0].time;
                  lastSeenRef.current = newest;
                  localStorage.setItem('delivery_notif_seen', newest);
                  setUnread(0);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
                padding: '7px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}>
              <Bell size={15} />
              {unread > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #0a0f1e' }} />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 'min(280px, calc(100vw - 28px))', background: surface, borderRadius: 16, border: `1px solid ${border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', zIndex: 300, overflow: 'hidden' }}>
                  <div style={{ padding: '13px 16px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: text }}>Notifications</p>
                    {notifs.length > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: muted }}>{notifs.length} recent</span>}
                  </div>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: muted, fontSize: '0.8rem' }}>No notifications yet</div>
                  ) : (
                    <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
                      {notifs.map(n => {
                        const mins = Math.floor((Date.now() - new Date(n.time).getTime()) / 60000);
                        const timeStr = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
                        return (
                          <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, marginTop: 4, flexShrink: 0 }} />
                            <div>
                              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: text }}>{n.title}</p>
                              <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: muted }}>{n.body}</p>
                              <p style={{ margin: '1px 0 0', fontSize: '0.68rem', color: muted }}>{timeStr}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile avatar */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
              style={{
                background: 'none', border: '2px solid rgba(255,140,66,0.4)', borderRadius: '50%',
                padding: 0, cursor: 'pointer', width: 32, height: 32, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}>
              <img
                src={user?.profilePicture || getInitialsAvatar(user?.name || '?')}
                alt={user?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 'min(220px, calc(100vw - 28px))', background: surface, borderRadius: 16, border: `1px solid ${border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', zIndex: 300, overflow: 'hidden' }}>
                  {/* User info */}
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={user?.profilePicture || getInitialsAvatar(user?.name || '?')} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: muted }}>Delivery Partner</p>
                    </div>
                  </div>
                  {/* Nav links */}
                  {[
                    { icon: <LayoutDashboard size={14} />, label: 'Dashboard',       path: '/delivery/dashboard' },
                    { icon: <Package size={14} />,         label: 'My Deliveries',   path: '/delivery/orders' },
                    { icon: <Package size={14} />,         label: 'Completed Orders',path: '/delivery/orders?status=delivered' },
                  ].map(item => (
                    <button key={item.label} onClick={() => { navigate(item.path); setProfileOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', color: text, fontSize: '0.82rem', fontWeight: 600, textAlign: 'left', WebkitTapHighlightColor: 'transparent' } as any}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : '#f5f5f5')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <span style={{ color: muted }}>{item.icon}</span>{item.label}
                    </button>
                  ))}
                  <div style={{ height: 1, background: border }} />
                  <button onClick={() => { window.location.href = 'tel:+919385598932'; }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.82rem', fontWeight: 600, WebkitTapHighlightColor: 'transparent' } as any}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <Phone size={14} /> Call Support
                  </button>
                  <button onClick={() => setProfileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600, WebkitTapHighlightColor: 'transparent' } as any}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <AlertCircle size={14} /> Report Issue
                  </button>
                  <div style={{ height: 1, background: border }} />
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.82rem', fontWeight: 700, WebkitTapHighlightColor: 'transparent' } as any}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main style={{ flex: 1, padding: '16px 14px 84px', maxWidth: 700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Outlet context={{ dark, online, surface, text, muted, border }} />
      </main>

      {/* ── BOTTOM TAB BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: surface, borderTop: `1px solid ${border}`,
        display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
      }}>
        {NAV.map(({ path, label, Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: active ? '#ff8c42' : muted, padding: '8px 0 6px', transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent' }}>
              <div style={{ width: 34, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: active ? 'rgba(255,140,66,0.12)' : 'transparent', transition: 'background 0.2s' }}>
                <Icon size={18} />
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>{label}</span>
            </Link>
          );
        })}
        <button onClick={() => navigate('/delivery/profile')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: location.pathname === '/delivery/profile' ? '#ff8c42' : muted, padding: '8px 0 6px', transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent' }}>
          <div style={{ width: 34, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: location.pathname === '/delivery/profile' ? 'rgba(255,140,66,0.12)' : 'transparent', transition: 'background 0.2s' }}>
            <User size={18} />
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryLayout;
