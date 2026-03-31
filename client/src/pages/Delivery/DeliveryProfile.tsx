import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Camera, Save, User, Phone, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitialsAvatar } from '../../utils/avatarUtils';
import axiosInstance from '../../services/axiosInstance';
import { useToast } from '../../context/ToastContext';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const DeliveryProfile: React.FC = () => {
  const ctx = useOutletContext<Ctx>();
  const { dark, surface, text, muted, border } = ctx || {};
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName]               = useState(user?.name || '');
  const [phone, setPhone]             = useState((user as any)?.phone?.replace(/^\+91\s?/, '') || '');
  const [vehicleType, setVehicleType] = useState((user as any)?.vehicleType || '');
  const [vehicleNumber, setVehicleNumber] = useState((user as any)?.vehicleNumber || '');
  const [saving, setSaving]           = useState(false);
  const [preview, setPreview]         = useState<string | null>(null);
  const [file, setFile]               = useState<File | null>(null);
  
  const navigate = useNavigate();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (phone) fd.append('phone', `+91${phone}`);
      if (vehicleType) fd.append('vehicleType', vehicleType);
      if (vehicleNumber) fd.append('vehicleNumber', vehicleNumber);
      if (file) fd.append('profilePicture', file);

      const { data } = await axiosInstance.put('/delivery/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data);
      showToast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e?.response?.data?.message || 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const IS: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${border}`, background: surface,
    fontSize: '0.88rem', color: text, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={() => navigate('/delivery/settings')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontWeight: 700, fontSize: '0.82rem', marginBottom: 16, padding: 0, WebkitTapHighlightColor: 'transparent' } as any}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Settings
      </button>
      <h2 style={{ margin: '0 0 20px', fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>My Profile</h2>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 88, height: 88 }}>
          <img
            src={preview || user?.profilePicture || getInitialsAvatar(user?.name || '?')}
            alt={user?.name}
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ff8c42' }}
          />
          <button onClick={() => fileRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--prime-gradient)', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={13} color="#fff" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handlePhoto} />
        </div>
        <p style={{ margin: '10px 0 2px', fontWeight: 800, fontSize: '1rem', color: text }}>{user?.name}</p>
        <p style={{ margin: 0, fontSize: '0.72rem', color: muted }}>Delivery Partner</p>
      </div>

      {/* Form */}
      <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Personal Info</p>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: muted, marginBottom: 6 }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={14} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={name} onChange={e => setName(e.target.value)} style={{ ...IS, paddingLeft: 34 }} placeholder="Your name" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: muted, marginBottom: 6 }}>Phone</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ padding: '12px 10px', background: dark ? 'rgba(255,255,255,0.05)' : '#f5f5f7', border: `1.5px solid ${border}`, borderRight: 'none', borderRadius: '12px 0 0 12px', fontSize: '0.82rem', color: muted, fontWeight: 600, whiteSpace: 'nowrap' }}>🇮🇳 +91</span>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ ...IS, borderRadius: '0 12px 12px 0', flex: 1 }} placeholder="10-digit number" inputMode="numeric" />
          </div>
        </div>
      </div>

      <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vehicle Info</p>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: muted, marginBottom: 6 }}>Vehicle Type</label>
          <div style={{ position: 'relative' }}>
            <Truck size={14} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={vehicleType} onChange={e => setVehicleType(e.target.value)} style={{ ...IS, paddingLeft: 34 }} placeholder="e.g. Bike, Van" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: muted, marginBottom: 6 }}>Vehicle Number</label>
          <div style={{ position: 'relative' }}>
            <Phone size={14} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} style={{ ...IS, paddingLeft: 34 }} placeholder="e.g. TN01AB1234" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1, boxShadow: '0 4px 16px rgba(255,107,43,0.3)' }}>
        <Save size={17} /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </motion.div>
  );
};

export default DeliveryProfile;
