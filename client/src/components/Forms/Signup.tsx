import React, { useState } from 'react';
import Logo from "../../assets/Logo.png";
import { motion, AnimatePresence } from 'framer-motion';
import { signupUser } from '../../services/authService';
import PrimeLoader from '../PrimeLoader';

interface SignupFormProps {
  setIsLogin: (isLogin: boolean) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ setIsLogin }) => {
  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primeTextStyle = { color: 'var(--prime-deep)' };
  const primeButtonStyle = {
    background: 'var(--prime-gradient)',
    border: 'none',
    boxShadow: 'var(--prime-shadow)',
    transition: 'all 0.3s ease'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    setError(null);

    if (step === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError("Please enter your first and last name.");
        return;
      }
      if (!formData.fullName) {
        setFormData(prev => ({ ...prev, fullName: `${prev.firstName} ${prev.lastName}`.trim() }));
      }
    }

    if (step === 2) {
      if (!formData.fullName || !formData.email) {
        setError("Please enter your full name and email address.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate Phone
    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    // Validate Password
    const pass = formData.password;
    if (pass.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(pass)) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }
    if (!/[a-z]/.test(pass)) {
      setError("Password must contain at least one lowercase letter.");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(pass)) {
      setError("Password must contain at least one number.");
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      setError("Password must contain at least one special character.");
      setLoading(false);
      return;
    }

    try {
      setShowLoader(true);
      await signupUser({
        name: formData.fullName,
        email: formData.email,
        phone: `+91${formData.phone}`, 
        password: formData.password,
      });

      setTimeout(() => {
        setIsLogin(true);
      }, 1500);

    } catch (err: any) {
      const errorStatus = err?.status || err?.response?.status || err?.statusCode;
      
      const isNetworkError = 
        errorStatus === 0 || 
        err?.code === "ERR_NETWORK" || 
        (err?.message && err.message.toLowerCase().includes("network error"));

      const globalErrorCodes = [400, 401, 403, 404, 500];

      if (isNetworkError || globalErrorCodes.includes(errorStatus)) {
        console.warn(`Global error intercepted. Local UI suppressed.`);
      } else {
        setError(err?.message || err?.data?.message || "An unexpected error occurred during signup.");
      }
    } finally {
      setShowLoader(false);
      setLoading(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <>
      <PrimeLoader isLoading={showLoader} />
      <motion.div
        key="signup-wizard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="w-100 w-lg-50 h-100 p-4 p-md-5 d-flex flex-column justify-content-center bg-white me-auto position-relative"
        style={{ zIndex: 1, maxWidth: '500px', overflowX: 'hidden' }}
      >
        {step > 1 && (
          <button 
            type="button" 
            onClick={handleBack}
            className="btn btn-link text-muted position-absolute shadow-none text-decoration-none d-flex align-items-center"
            style={{ top: '20px', left: '20px', gap: '5px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </button>
        )}

        <div className="w-100 mx-auto" style={{ maxWidth: '400px', marginTop: step > 1 ? '20px' : '0' }}>
          
          <div className="d-flex align-items-center mb-4">
            <img src={Logo} alt="Logo" width="40" className="me-2" />
            <span className="h3 fw-bold mb-0 brand-name-breathe text-dark">PrimeHive</span>
          </div>

          <div className="mb-4">
            <h2 className="fw-bold mb-2 text-dark" style={{ letterSpacing: '-0.5px' }}>Join the Hive</h2>
            <p className="text-muted">Create an account to unlock exclusive member deals.</p>
          </div>

          {/* Reduced progress indicators to 3 steps */}
          <div className="d-flex gap-2 mb-4">
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className="flex-grow-1 rounded-pill"
                style={{ 
                  height: '4px', 
                  backgroundColor: step >= num ? 'var(--prime-deep)' : 'var(--prime-border)',
                  transition: 'background-color 0.4s ease'
                }}
              />
            ))}
          </div>

          {error && (
            <div className="text-danger small fw-bold mb-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <div style={{ minHeight: '180px' }}>
              <AnimatePresence mode="wait">
                
                {step === 1 && (
                  <motion.div key="step-1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="mb-3">
                      <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        className="form-control form-control-lg shadow-none py-2 fs-6"
                        style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                        placeholder='Enter Your First Name'
                        value={formData.firstName}
                        autoComplete='off'
                        onChange={handleChange}
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        className="form-control form-control-lg shadow-none py-2 fs-6"
                        style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                        placeholder='Enter Your Last Name'
                        value={formData.lastName}
                        autoComplete='off'
                        onChange={handleChange}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="mb-3">
                      <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        className="form-control form-control-lg shadow-none py-2 fs-6"
                        style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                        placeholder='Enter Your Full Name'
                        value={formData.fullName}
                        autoComplete='off'
                        onChange={handleChange}
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control form-control-lg shadow-none py-2 fs-6"
                        style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                        placeholder='Enter Your Email Address'
                        value={formData.email}
                        autoComplete='off'
                        onChange={handleChange}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Combined Step 3: Phone and Password */}
                {step === 3 && (
                  <motion.div key="step-3" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="mb-3">
                      <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Phone Number</label>
                      <div className="input-group">
                        <span 
                          className="input-group-text fw-bold text-muted bg-light" 
                          style={{ 
                            border: '1.5px solid var(--prime-border)', 
                            borderRight: 'none',
                            borderTopLeftRadius: '12px', 
                            borderBottomLeftRadius: '12px' 
                          }}
                        >
                          +91
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          className="form-control form-control-lg shadow-none py-2 fs-6"
                          style={{ 
                            border: '1.5px solid var(--prime-border)', 
                            borderTopRightRadius: '12px', 
                            borderBottomRightRadius: '12px' 
                          }}
                          placeholder="Enter Your Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete='off'
                          maxLength={10}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Password</label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          className="form-control form-control-lg shadow-none py-2 fs-6 pe-5"
                          placeholder="Create a password"
                          style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                          value={formData.password}
                          autoComplete='off'
                          onChange={handleChange}
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
                      
                      <div className="mt-2 small text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        Must contain at least 6 characters, one uppercase, one lowercase, one number, and one special character.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type={step === 3 ? "submit" : "button"}
              onClick={step < 3 ? handleNext : undefined}
              disabled={loading}
              className="btn btn-lg w-100 py-3 fw-bold text-white mb-4 mt-2"
              style={{
                ...primeButtonStyle,
                borderRadius: '12px',
                fontSize: '1.1rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {step < 3 ? "Continue" : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center small text-muted mb-0">
            Already have an account?{' '}
            <span className="fw-bold text-decoration-none" style={{ ...primeTextStyle, cursor: 'pointer' }} onClick={() => setIsLogin(true)}>
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default SignupForm;