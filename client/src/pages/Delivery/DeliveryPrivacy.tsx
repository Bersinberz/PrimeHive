import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide when you register as a delivery partner, including your name, email address, phone number, vehicle details, and profile picture. We also collect location data while you are on an active delivery to enable order tracking.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to assign and manage delivery orders, communicate order updates, calculate earnings, and improve our platform. We do not sell your personal data to third parties.',
  },
  {
    title: '3. Location Data',
    body: 'Location access is used only during active deliveries to help customers track their orders. We do not track your location when you are offline or outside of active delivery sessions.',
  },
  {
    title: '4. Data Sharing',
    body: 'We share your name and phone number with customers only for the purpose of completing a delivery. Your data may be shared with payment processors and logistics partners as necessary to operate the service.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your account data for as long as your account is active. If you delete your account, your personal data will be removed within 30 days, except where retention is required by law.',
  },
  {
    title: '6. Security',
    body: 'We use industry-standard encryption and security practices to protect your data. Passwords are hashed and never stored in plain text. Access to personal data is restricted to authorised personnel only.',
  },
  {
    title: '7. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time through the app settings. You may also contact our support team to exercise these rights.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via the app or email. Continued use of the platform after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '9. Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact our support team through the app or via the support email listed in the Contact Support section.',
  },
];

const DeliveryPrivacy: React.FC = () => {
  const ctx = useOutletContext<Ctx>();
  const { surface, text, muted, border } = ctx || {};
  const navigate = useNavigate();
  const { storeName } = useSettings();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={() => navigate('/delivery/settings')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontWeight: 700, fontSize: '0.82rem', marginBottom: 16, padding: 0, WebkitTapHighlightColor: 'transparent' } as any}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Settings
      </button>

      <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>Privacy Policy</h2>
      <p style={{ margin: '0 0 20px', fontSize: '0.78rem', color: muted }}>Last updated: March 2026 · {storeName}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, padding: '16px' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '0.88rem', color: text }}>{s.title}</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: muted, lineHeight: 1.7 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.68rem', color: muted, marginTop: 20 }}>
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </p>
    </motion.div>
  );
};

export default DeliveryPrivacy;
