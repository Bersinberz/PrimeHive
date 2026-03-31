import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const DeliverySupport: React.FC = () => {
  const ctx = useOutletContext<Ctx>();
  const { surface, text, muted, border } = ctx || {};
  const { storeName, supportPhone, supportEmail, storeLocation } = useSettings();

  const navigate = useNavigate();

  const items = [
    {
      icon: <Phone size={20} color="#2563eb" />,
      bg: 'rgba(37,99,235,0.1)',
      label: 'Call Us',
      value: supportPhone,
      action: () => { window.location.href = `tel:${supportPhone}`; },
      actionLabel: 'Call Now',
      actionColor: '#2563eb',
      actionBg: 'rgba(37,99,235,0.08)',
    },
    {
      icon: <Mail size={20} color="#7c3aed" />,
      bg: 'rgba(124,58,237,0.1)',
      label: 'Email Us',
      value: supportEmail,
      action: () => { window.location.href = `mailto:${supportEmail}`; },
      actionLabel: 'Send Email',
      actionColor: '#7c3aed',
      actionBg: 'rgba(124,58,237,0.08)',
    },
    {
      icon: <MapPin size={20} color="#059669" />,
      bg: 'rgba(16,185,129,0.1)',
      label: 'Office Location',
      value: storeLocation,
      action: () => { window.open(`https://maps.google.com/?q=${encodeURIComponent(storeLocation)}`, '_blank'); },
      actionLabel: 'Open Maps',
      actionColor: '#059669',
      actionBg: 'rgba(16,185,129,0.08)',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={() => navigate('/delivery/settings')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontWeight: 700, fontSize: '0.82rem', marginBottom: 16, padding: 0, WebkitTapHighlightColor: 'transparent' } as any}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Settings
      </button>
      <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>Contact Support</h2>
      <p style={{ margin: '0 0 24px', fontSize: '0.82rem', color: muted }}>Reach out to {storeName} for any help or queries.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <div key={item.label} style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: '0.68rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
            </div>
            <button onClick={item.action}
              style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: item.actionBg, color: item.actionColor, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0, WebkitTapHighlightColor: 'transparent' } as any}>
              {item.actionLabel}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: '18px 16px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Support Hours</p>
        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: text }}>Monday – Saturday</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: muted }}>9:00 AM – 6:00 PM IST</p>
      </div>
    </motion.div>
  );
};

export default DeliverySupport;
