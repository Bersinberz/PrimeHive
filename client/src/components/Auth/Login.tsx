import React, { useState } from 'react';
import Logo from "../../assets/Logo.png";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import PrimeLoader from '../PrimeLoader';
import { useSettings } from '../../context/SettingsContext';
import { forgotPasswordApi } from '../../services/authService';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  setIsLogin: (isLogin: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setIsLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { storeName } = useSettings();

  const primeTextStyle = { color: 'var(--prime-deep)' };
  const primeButtonStyle = {
    background: 'var(--prime-gradient)',
    border: 'none',
    boxShadow: 'var(--prime-shadow)',
    transition: 'all 0.3s ease',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) { setError("Please enter both email and password."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (/\s/.test(password)) { setError("Password must not contain spaces."); return; }

    try {
      setLoading(true);
      const user = await login(trimmedEmail, password);
      if (user.role === "delivery_partner") {
        navigate("/delivery/dashboard");
      } else if (["superadmin", "staff", "admin_staff"].includes(user.role)) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    const trimmed = forgotEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    try {
      setForgotLoading(true);
      await forgotPasswordApi(trimmed);
      setForgotSent(true);
    } catch {
      // Always show success to prevent enumeration
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <PrimeLoader isLoading={loading} />

      <motion.div
        key="login-form"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-100 w-lg-50 h-100 p-4 p-md-5 d-flex flex-column justify-content-center bg-white ms-auto"
        style={{ zIndex: 1, maxWidth: '500px' }}
      >
        <div className="w-100 mx-auto" style={{ maxWidth: '400px' }}>

          <AnimatePresence mode="wait">

            {/* ── Forgot Password Panel ── */}
            {showForgot ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); setForgotError(""); }}
                  className="d-flex align-items-center gap-2 mb-4 btn btn-link p-0 text-muted text-decoration-none"
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <ArrowLeft size={15} /> Back to Sign In
                </button>

                {forgotSent ? (
                  <div className="text-center py-3">
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={32} color="#10b981" strokeWidth={2.5} />
                    </div>
                    <h4 className="fw-bold mb-2 text-dark">Check your inbox</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                      If an account exists for <strong>{forgotEmail}</strong>, we've sent a password reset link.
                      It expires in <strong>1 hour</strong>.
                    </p>
                    <p className="text-muted mt-3" style={{ fontSize: '0.82rem' }}>
                      Didn't receive it? Check your spam folder or{' '}
                      <span
                        style={{ color: 'var(--prime-deep)', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => { setForgotSent(false); setForgotEmail(""); }}
                      >
                        try again
                      </span>.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="fw-bold mb-2 text-dark">Forgot password?</h2>
                    <p className="text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Enter your account email and we'll send you a link to reset your password.
                    </p>

                    {forgotError && (
                      <div className="text-danger small fw-bold mb-3">{forgotError}</div>
                    )}

                    <form onSubmit={handleForgotSubmit}>
                      <div className="mb-4">
                        <label className="small fw-bold text-muted mb-2 text-uppercase">Email Address</label>
                        <input
                          type="email"
                          className="form-control form-control-lg shadow-none py-3 fs-6"
                          placeholder="Enter your account email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                          autoFocus
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={forgotLoading}
                        className="btn btn-lg w-100 py-3 fw-bold text-white"
                        style={{ ...primeButtonStyle, borderRadius: '12px', fontSize: '1rem', opacity: forgotLoading ? 0.7 : 1 }}
                      >
                        {forgotLoading ? "Sending..." : "Send Reset Link"}
                      </motion.button>
                    </form>
                  </>
                )}
              </motion.div>

            ) : (

              /* ── Login Panel ── */
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="d-flex align-items-center mb-5">
                  <img src={Logo} alt="Logo" width="40" className="me-2" />
                  <span className="h3 fw-bold mb-0 brand-name-breathe text-dark">{storeName}</span>
                </div>

                <div className="mb-4">
                  <h2 className="fw-bold mb-2 text-dark">Welcome Back!</h2>
                  <p className="text-muted">Sign in to track orders and manage your account.</p>
                </div>

                {error && (
                  <div className="text-danger small fw-bold mb-3 text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="small fw-bold text-muted mb-2 text-uppercase">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg shadow-none py-3 fs-6"
                      placeholder="Enter Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="small fw-bold text-muted text-uppercase mb-0">Password</label>
                      <button
                        type="button"
                        onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                        className="btn btn-link p-0 text-decoration-none"
                        style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--prime-deep)' }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg shadow-none py-3 fs-6 pe-5"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y text-muted me-2 shadow-none"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="btn btn-lg w-100 py-3 fw-bold text-white mb-4 mt-3"
                    style={{ ...primeButtonStyle, borderRadius: '12px', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
                  >
                    Sign In
                  </motion.button>
                </form>

                <p className="text-center small text-muted mb-0">
                  New to Hive?{' '}
                  <span
                    className="fw-bold text-decoration-none"
                    style={{ ...primeTextStyle, cursor: 'pointer' }}
                    onClick={() => setIsLogin(false)}
                  >
                    Create an account
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </>
  );
};

export default LoginForm;
