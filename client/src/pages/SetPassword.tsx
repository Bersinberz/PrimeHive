import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, XCircle, ShieldCheck, LogIn } from 'lucide-react';
import { setPasswordApi } from '../services/authService';
import { useSettings } from '../context/SettingsContext';

const RULES = [
  { id: 'length',  label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',   test: (v: string) => /[A-Z]/.test(v) },
  { id: 'lower',   label: 'One lowercase letter',   test: (v: string) => /[a-z]/.test(v) },
  { id: 'number',  label: 'One number',             test: (v: string) => /[0-9]/.test(v) },
  { id: 'special', label: 'One special character',  test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const getStrength = (pwd: string) => {
  const passed = RULES.filter(r => r.test(pwd)).length;
  if (passed <= 1) return { label: 'Too weak',   color: '#ef4444', width: '20%' };
  if (passed === 2) return { label: 'Weak',       color: '#f97316', width: '40%' };
  if (passed === 3) return { label: 'Fair',       color: '#f59e0b', width: '60%' };
  if (passed === 4) return { label: 'Strong',     color: '#22c55e', width: '80%' };
  return               { label: 'Very strong', color: '#10b981', width: '100%' };
};

const LOGO = 'https://res.cloudinary.com/dhkgj2u8s/image/upload/v1774112861/logo_gq8unu.png';

/* ── Skeleton shimmer block ── */
const Bone: React.FC<{ w?: string; h?: number; r?: number; mb?: number }> = ({ w = '100%', h = 16, r = 8, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: 'linear-gradient(90deg,#f0f0f2 25%,#e8e8ea 50%,#f0f0f2 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

/* ── Page skeleton shown while loading ── */
const PageSkeleton: React.FC = () => (
  <div style={{
    minHeight: '100vh', background: '#f7f8fc',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  }}>
    <div style={{ width: '100%', maxWidth: 460 }}>
      {/* Top bar skeleton */}
      <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg,#ff6b35,#ff8c42)', marginBottom: 32, opacity: 0.35 }} />
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Bone w="56px" h={56} r={16} />
          <Bone w="140px" h={20} r={6} />
          <Bone w="200px" h={14} r={6} />
        </div>
        {/* Input skeletons */}
        <Bone h={52} r={14} mb={16} />
        <Bone h={52} r={14} mb={20} />
        {/* Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[80, 65, 70, 55, 75].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bone w="16px" h={16} r={50} />
              <Bone w={`${w}%`} h={12} r={6} />
            </div>
          ))}
        </div>
        {/* Button */}
        <Bone h={52} r={14} />
      </div>
    </div>
  </div>
);

/* ── Submit spinner overlay ── */
const SubmitOverlay: React.FC = () => (
  <motion.div
    key="overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}
  >
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,140,66,0.12)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--prime-orange)', animation: 'sp 0.85s linear infinite' }} />
      <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,140,66,0.35)', animation: 'sp 1.5s linear infinite reverse' }} />
      <img src={LOGO} alt="" width="32" height="32" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderRadius: 10, objectFit: 'cover' }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1a1a1a' }}>Setting your password…</p>
      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#aaa' }}>Please wait a moment</p>
    </div>
  </motion.div>
);

const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { storeName } = useSettings();
  const token = searchParams.get('token') || '';

  const [pageReady, setPageReady]     = useState(false);
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [touched, setTouched]         = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  const strength  = useMemo(() => getStrength(password), [password]);
  const allPassed = RULES.every(r => r.test(password));
  const confirmOk = confirm.length > 0 && confirm === password;
  const canSubmit = allPassed && confirmOk && !!token && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (!token)     { setError('Invalid or missing setup link. Please use the link from your email.'); return; }
    if (!allPassed) { setError('Please meet all password requirements.'); return; }
    if (!confirmOk) { setError('Passwords do not match.'); return; }
    try {
      setLoading(true);
      await setPasswordApi(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '14px 48px 14px 16px',
    border: '1.5px solid #e8e8e8', borderRadius: '14px',
    fontSize: '0.95rem', fontWeight: 500, color: '#1a1a1a',
    background: '#fafafa', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  };

  /* ── Page skeleton while loading ── */
  if (!pageReady) return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <PageSkeleton />
    </>
  );

  /* ── Success state ── */
  if (success) return (
    <>
      <style>{`@keyframes pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ minHeight: '100vh', background: '#f7f8fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: '52px 40px', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}
        >
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pop 0.5s ease forwards' }}>
            <CheckCircle size={36} color="#10b981" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#1a1a1a', margin: '0 0 10px' }}>Password set!</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 32px', lineHeight: 1.6 }}>
            Your account is ready. You can now sign in to {storeName}.
          </p>
          <button
            onClick={() => navigate('/auth')}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: 'linear-gradient(135deg,#ff6b35,#ff8c42)',
              border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <LogIn size={18} /> Go to Sign In
          </button>
        </motion.div>
      </div>
    </>
  );

  /* ── Main form ── */
  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .sp-input:focus{border-color:var(--prime-orange)!important;background:#fff!important;box-shadow:0 0 0 3px rgba(255,140,66,0.1)!important}
      `}</style>

      <AnimatePresence>{loading && <SubmitOverlay />}</AnimatePresence>

      <div style={{ minHeight: '100vh', background: '#f7f8fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 460 }}
        >
          {/* Orange top bar */}
          <div style={{ height: 5, borderRadius: '3px 3px 0 0', background: 'linear-gradient(90deg,#ff6b35,#ff8c42)', marginBottom: 0 }} />

          <div style={{ background: '#fff', borderRadius: '0 0 24px 24px', padding: '40px 36px 36px', boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
            {/* Logo + heading */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <img src={LOGO} alt={storeName} width={52} height={52} style={{ borderRadius: 14, objectFit: 'cover', marginBottom: 14 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={18} color="var(--prime-orange)" strokeWidth={2.5} />
                <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#1a1a1a' }}>Set Your Password</h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Create a secure password for your {storeName} account</p>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Password field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="sp-input"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={inputBase}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0, display: 'flex' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 5, borderRadius: 3, background: '#f0f0f2', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 3, transition: 'width 0.4s ease, background 0.4s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="sp-input"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    style={{
                      ...inputBase,
                      borderColor: confirm.length > 0 ? (confirmOk ? '#10b981' : '#ef4444') : '#e8e8e8',
                    }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0, display: 'flex' }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {confirm.length > 0 && (
                    <div style={{ position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)' }}>
                      {confirmOk ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Rules checklist */}
              <div style={{ background: '#fafafa', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RULES.map(rule => {
                  const ok = rule.test(password);
                  return (
                    <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: 10, animation: ok ? 'fadeUp 0.2s ease' : 'none' }}>
                      {ok
                        ? <CheckCircle size={15} color="#10b981" strokeWidth={2.5} />
                        : <XCircle    size={15} color={touched && !ok ? '#ef4444' : '#d1d5db'} strokeWidth={2.5} />
                      }
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: ok ? '#10b981' : '#9ca3af', transition: 'color 0.2s' }}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <XCircle size={15} color="#ef4444" />
                  <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                  background: canSubmit ? 'linear-gradient(135deg,#ff6b35,#ff8c42)' : '#e5e7eb',
                  color: canSubmit ? '#fff' : '#9ca3af',
                  fontWeight: 800, fontSize: '0.95rem', cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.25s', letterSpacing: '0.2px',
                }}
              >
                Set Password
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SetPassword;
