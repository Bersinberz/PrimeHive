import React, { useState } from 'react';
import Logo from "../../assets/Logo.png";
import { motion } from 'framer-motion';

interface LoginFormProps {
  setIsLogin: (isLogin: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setIsLogin }) => {
  const [showPassword, setShowPassword] = useState(false);

  const primeTextStyle = { color: 'var(--prime-deep)' };
  const primeButtonStyle = {
    background: 'var(--prime-gradient)',
    border: 'none',
    boxShadow: 'var(--prime-shadow)',
    transition: 'all 0.3s ease'
  };

  return (
    <motion.div
      key="login-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-100 w-lg-50 h-100 p-4 p-md-5 d-flex flex-column justify-content-center bg-white ms-auto"
      style={{ zIndex: 1, maxWidth: '500px' }} // Added maxWidth for cleaner centering on large screens
    >
      <div className="w-100 mx-auto" style={{ maxWidth: '400px' }}>
        <div className="d-flex align-items-center mb-5">
          <img src={Logo} alt="Logo" width="40" className="me-2" />
          <span className="h3 fw-bold mb-0 brand-name-breathe text-dark">PrimeHive</span>
        </div>

        <div className="mb-5">
          <h2 className="fw-bold mb-2 text-dark" style={{ letterSpacing: '-0.5px' }}>Welcome Back!</h2>
          <p className="text-muted">Sign in to track orders and manage your account.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
            <input type="email" className="form-control form-control-lg shadow-none py-3 fs-6" placeholder="Enter Your Email Address" style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }} />
          </div>
          
          <div className="mb-4">
            <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Password</label>
            <div className="position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control form-control-lg shadow-none py-3 fs-6 pe-5" 
                placeholder="Enter your password" 
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

          <div className="text-end mb-4">
            <a href="#" className="text-decoration-none small fw-bold" style={primeTextStyle}>Forgot password?</a>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-lg w-100 py-3 fw-bold text-white mb-4 mt-2" style={{ ...primeButtonStyle, borderRadius: '12px', fontSize: '1.1rem' }}>
            Sign In
          </motion.button>
        </form>

        <p className="text-center small text-muted mb-0">
          New to Hive?{' '}
          <span className="fw-bold text-decoration-none" style={{ ...primeTextStyle, cursor: 'pointer' }} onClick={() => setIsLogin(false)}>
            Create an account
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;