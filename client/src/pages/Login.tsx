import React from 'react';
import Logo from "../assets/Logo.png";
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const primeTextStyle = { color: 'var(--prime-deep)' };
  const primeButtonStyle = {
    background: 'var(--prime-gradient)',
    border: 'none',
    boxShadow: 'var(--prime-shadow)',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ 
        backgroundColor: 'var(--prime-bg-soft)', 
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 140, 66, 0.05) 0%, transparent 40%)',
        overflow: 'hidden' // Prevents page-level scrolling
      }}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shadow-lg rounded-5 bg-white d-flex"
        style={{
          maxWidth: '1000px',
          width: '100%',
          maxHeight: 'min-content', // Adjusted to fit content without scrolling
          border: '1px solid var(--prime-border)',
          overflow: 'hidden' // Prevents internal scrolling
        }}
      >
        <div className="row g-0 w-100">

          {/* Left Side: Brand Background Panel */}
          <div className="col-lg-6 d-none d-lg-flex position-relative overflow-hidden">
            <div
              className="w-100 h-100 p-5 text-white d-flex flex-column justify-content-center"
              style={{ background: 'var(--prime-gradient)' }}
            >
              {/* Decorative Circle */}
              <div className="position-absolute" style={{ width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: '-100px', left: '-100px' }} />

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                  Elevate your <br />
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>shopping.</span>
                </h1>
                <p className="lead opacity-75 fw-light" style={{ maxWidth: '350px' }}>
                  Access your personalized collection and exclusive member-only deals.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="col-lg-6 p-4 p-md-5 d-flex align-items-center bg-white">
            <div className="w-100">

              {/* Top Branding */}
              <div className="d-flex align-items-center mb-5">
                <img src={Logo} alt="Logo" width="40" className="me-2" />
                <span className="h3 fw-bold mb-0 brand-name-breathe">
                  PrimeHive
                </span>
              </div>

              <div className="mb-4">
                <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Welcome Back</h2>
                <p className="text-muted">Sign in to track orders and manage your account.</p>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-lg shadow-none py-3 fs-6"
                    placeholder="Enter Your Email Address"
                    style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg shadow-none py-3 fs-6"
                    placeholder="Enter your password"
                    style={{ border: '1.5px solid var(--prime-border)', borderRadius: '12px' }}
                  />
                </div>

                <div className="text-end mb-4">
                  <a href="#" className="text-decoration-none small fw-bold" style={primeTextStyle}>
                    Forgot password?
                  </a>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-lg w-100 py-3 fw-bold text-white mb-4"
                  style={{ ...primeButtonStyle, borderRadius: '12px', fontSize: '1.1rem' }}
                >
                  Sign In
                </motion.button>
              </form>

              <p className="text-center small text-muted mb-0">
                New to Hive? <a href="#" className="fw-bold text-decoration-none" style={primeTextStyle}>Create an account</a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;