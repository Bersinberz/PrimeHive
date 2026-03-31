import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  User, Lock, Moon, Sun, Wifi, WifiOff,
  Phone, AlertCircle, Trash2, LogOut, ChevronRight, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitialsAvatar } from '../../utils/avatarUtils';
import { deleteMyAccount } from '../../services/delivery/deliveryService';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../services/axiosInstance';

type Ctx = {
  dark: boolean; setDark: (v: boolean | ((p: boolean) => boolean)) => void;
  online: boolean; setOnline: (v: boolean | ((p: boolean) => boolean)) => void;
  surface: string; text: string; muted: string; border: string;
};

const DeliverySettings: React.FC = () => {
  const ctx = useOutletContext<Ctx>();
  const { dark, setDark, online, setOnline, surface, text, muted, border } = ctx || {};
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPwdModal, setShowPwdModal]       = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [currentPwd, setCurrentPwd]           = useState('');
  const [newPwd, setNewPwd]                   = useState('');
  const [confirmPwd, setConfirmPwd]           = useState('');
  const [pwdSaving, setPwdSaving]             = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      await logout();
      navigate('/auth');
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete account.' });
    } finally { setDeleting(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd) { showToast({ type: 'error', title: 'Required', message: 'Fill in all fields.' }); return; }
    if (newPwd !== confirmPwd)  { showToast({ type: 'error', title: 'Mismatch', message: 'Passwords do not match.' }); return; }
    if (newPwd.length < 6)     { showToast({ type: 'error', title: 'Too short', message: 'Password must be at least 6 characters.' }); return; }
    setPwdSaving(true);
    try {
      await axiosInstance.put('/delivery/profile', { currentPassword: currentPwd, newPassword: newPwd });
      showToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated.' });
      setShowPwdModal(false);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e?.response?.data?.message || 'Failed to change password.' });
    } finally { setPwdSaving(false); }
  };

  const IS: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1.5px solid ${border}`, background: surface,
    fontSize: '0.88rem', color: text, outline: 'none', boxSizing: 'border-box',
  };

  const Toggle: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
    <div onClick={e => { e.stopPropagation(); onToggle(); }}
      style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'var(--prime-gradient)' : (dark ? 'rgba(255,255,255,0.15)' : '#d1d5db'), position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
    </div>
  );

  const Row: React.FC<{ icon: React.ReactNode; label: string; sub?: string; onClick?: () => void; right?: React.ReactNode; danger?: boolean }> = ({ icon, label, sub, onClick, right, danger }) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default', textAlign: 'left', transition: 'background 0.15s', WebkitTapHighlightColor: 'transparent' } as any}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : '#f8f8f8')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'rgba(239,68,68,0.1)' : dark ? 'rgba(255,255,255,0.07)' : '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: danger ? '#ef4444' : muted }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: danger ? '#ef4444' : text }}>{label}</p>
        {sub && <p style={{ margin: 0, fontSize: '0.7rem', color: muted }}>{sub}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={15} color={muted} />)}
    </button>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 8px 4px', fontSize: '0.62rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{title}</p>
      <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: border, margin: '0 16px' }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>Settings</h2>

      {/* Profile card */}
      <button onClick={() => navigate('/delivery/profile')}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '16px', marginBottom: 20, cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent', transition: 'border-color 0.2s' } as any}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#ff8c42')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
        <img src={user?.profilePicture || getInitialsAvatar(user?.name || '?')} alt={user?.name}
          style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff8c42', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#ff8c42', fontWeight: 600 }}>Edit Profile →</p>
        </div>
        <ChevronRight size={16} color={muted} />
      </button>

      {/* Account */}
      <Section title="Account">
        <Row icon={<User size={16} />} label="Edit Profile" sub="Name, phone, vehicle info" onClick={() => navigate('/delivery/profile')} />
        <Divider />
        <Row icon={<Lock size={16} />} label="Change Password" sub="Update your login password" onClick={() => setShowPwdModal(true)} />
      </Section>

      {/* Preferences — functional toggles */}
      <Section title="Preferences">
        <Row
          icon={dark ? <Moon size={16} /> : <Sun size={16} />}
          label="Dark Mode"
          sub={dark ? 'On' : 'Off'}
          onClick={() => setDark(v => !v)}
          right={<Toggle on={dark} onToggle={() => setDark(v => !v)} />}
        />
        <Divider />
        <Row
          icon={online ? <Wifi size={16} /> : <WifiOff size={16} />}
          label="Online Status"
          sub={online ? 'Accepting orders' : 'Not accepting orders'}
          onClick={() => setOnline(v => !v)}
          right={<Toggle on={online} onToggle={() => setOnline(v => !v)} />}
        />
      </Section>

      {/* Support */}
      <Section title="Support & Help">
        <Row icon={<Phone size={16} />} label="Contact Support" sub="Call or email PrimeHive" onClick={() => navigate('/delivery/support')} />
        <Divider />
        <Row icon={<AlertCircle size={16} />} label="Report an Issue" sub="Tell us what went wrong" onClick={() => navigate('/delivery/report-issue')} />
        <Divider />
        <Row icon={<Shield size={16} />} label="Privacy Policy" sub="How we use your data" onClick={() => navigate('/delivery/privacy')} />
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <Row icon={<LogOut size={16} />} label="Sign Out" danger onClick={async () => { await logout(); navigate('/auth'); }} />
        <Divider />
        <Row icon={<Trash2 size={16} />} label="Delete Account" sub="Permanently remove your account" danger onClick={() => setShowDeleteModal(true)} />
      </Section>

      <p style={{ textAlign: 'center', fontSize: '0.68rem', color: muted, marginTop: 8 }}>PrimeHive Delivery v1.0</p>

      {/* ── Change Password Modal ── */}
      <AnimatePresence>
        {showPwdModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setShowPwdModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ background: surface, borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 500 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: border, margin: '0 auto 20px' }} />
              <h3 style={{ margin: '0 0 20px', fontWeight: 900, fontSize: '1.1rem', color: text }}>Change Password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="Current password" style={IS} />
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="New password" style={IS} />
                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Confirm new password" style={IS} />
                <button onClick={handleChangePassword} disabled={pwdSaving}
                  style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', opacity: pwdSaving ? 0.7 : 1 }}>
                  {pwdSaving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Account Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '1.1rem', color: text, textAlign: 'center' }}>Delete Account?</h3>
              <p style={{ margin: '0 0 24px', fontSize: '0.82rem', color: muted, textAlign: 'center', lineHeight: 1.6 }}>
                This will permanently remove your account. You won't be able to log in again.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowDeleteModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${border}`, background: 'transparent', color: text, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleting}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DeliverySettings;
