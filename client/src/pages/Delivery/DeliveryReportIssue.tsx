import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AlertCircle, Send } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import { useToast } from '../../context/ToastContext';

type Ctx = { dark: boolean; surface: string; text: string; muted: string; border: string };

const CATEGORIES = ['Order Issue', 'Payment Problem', 'App Bug', 'Customer Complaint', 'Vehicle Issue', 'Other'];

const DeliveryReportIssue: React.FC = () => {
  const ctx = useOutletContext<Ctx>();
  const { surface, text, muted, border } = ctx || {};
  const { showToast } = useToast();

  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    if (!category || !message.trim()) {
      showToast({ type: 'error', title: 'Required', message: 'Please select a category and describe the issue.' });
      return;
    }
    setSending(true);
    try {
      await axiosInstance.post('/delivery/report-issue', { category, message });
      setSent(true);
      showToast({ type: 'success', title: 'Report sent', message: 'We\'ll look into it and get back to you.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to send report. Please try again.' });
    } finally { setSending(false); }
  };

  const IS: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${border}`, background: surface,
    fontSize: '0.88rem', color: text, outline: 'none', boxSizing: 'border-box',
  };

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Send size={28} color="#059669" />
      </div>
      <h3 style={{ fontWeight: 900, color: text, margin: '0 0 8px' }}>Report Sent!</h3>
      <p style={{ color: muted, fontSize: '0.88rem', margin: '0 0 24px' }}>Our team will review your issue and respond shortly.</p>
      <button onClick={() => { setSent(false); setCategory(''); setMessage(''); }}
        style={{ padding: '10px 24px', borderRadius: 50, border: `1px solid ${border}`, background: 'transparent', color: text, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
        Report Another Issue
      </button>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={() => navigate('/delivery/settings')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontWeight: 700, fontSize: '0.82rem', marginBottom: 16, padding: 0, WebkitTapHighlightColor: 'transparent' } as any}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        Settings
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <AlertCircle size={20} color="#f59e0b" />
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: text, letterSpacing: '-0.5px' }}>Report an Issue</h2>
      </div>
      <p style={{ margin: '0 0 24px', fontSize: '0.82rem', color: muted }}>Tell us what went wrong and we'll fix it.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: muted, marginBottom: 8 }}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '7px 14px', borderRadius: 50, border: category === c ? 'none' : `1px solid ${border}`, background: category === c ? 'var(--prime-gradient)' : surface, color: category === c ? '#fff' : muted, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: muted, marginBottom: 8 }}>Describe the Issue</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
            placeholder="Please describe the issue in detail..."
            style={{ ...IS, resize: 'none', lineHeight: 1.6 }} />
        </div>

        <button onClick={handleSubmit} disabled={sending}
          style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sending ? 0.7 : 1, boxShadow: '0 4px 16px rgba(255,107,43,0.3)' }}>
          <Send size={17} /> {sending ? 'Sending...' : 'Submit Report'}
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryReportIssue;
