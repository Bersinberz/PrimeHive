import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/Login';
import SignupForm from '../components/Signup';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'var(--prime-bg-soft)',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 140, 66, 0.05) 0%, transparent 40%)',
      }}>

      <div
        className="shadow-lg rounded-5 bg-white position-relative overflow-hidden d-flex w-100"
        style={{
          maxWidth: '1000px',
          minHeight: '680px', // Slightly taller to comfortably fit the signup form
          border: '1px solid var(--prime-border)',
        }}
      >
        
        {/* =========================================
            FORM AREA (Cross-fades between components)
        ========================================= */}
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex">
          <AnimatePresence mode="wait">
            {isLogin ? (
               <LoginForm key="login" setIsLogin={setIsLogin} />
            ) : (
               <SignupForm key="signup" setIsLogin={setIsLogin} />
            )}
          </AnimatePresence>
        </div>

        {/* =========================================
            THE ORANGE SLIDER
        ========================================= */}
        <motion.div
          className="position-absolute top-0 h-100 d-none d-lg-flex flex-column justify-content-center align-items-center text-white overflow-hidden"
          animate={{ x: isLogin ? "0%" : "100%" }} 
          transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}
          style={{
            width: '50%',
            zIndex: 10,
            background: 'var(--prime-gradient)',
            left: 0,
            padding: '4rem', // Standardized generous padding for the slider content
          }}
        >
          {/* Decorative Circle Background */}
          <div className="position-absolute" style={{ width: '400px', height: '400px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', top: '-150px', left: isLogin ? '-150px' : 'auto', right: !isLogin ? '-150px' : 'auto', transition: 'all 0.6s ease' }} />

          <AnimatePresence mode="wait">
            {isLogin ? (
              // LOGIN TEXT (Left Aligned)
              <motion.div
                key="login-view-text"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="w-100 text-start" 
              >
                <h1 className="fw-semibold mb-4" style={{ fontSize: '3.2rem', lineHeight: '1.1', letterSpacing: '-1px' }}>
                  Elevate your <br />
                  <span style={{ fontWeight: 400, opacity: 0.85 }}>shopping.</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '350px' }}>
                  Access your personalized collection and exclusive member-only deals.
                </p>
              </motion.div>
            ) : (
              // SIGNUP TEXT (Right Aligned)
              <motion.div
                key="signup-view-text"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="w-100 text-end" 
              >
                <h1 className="fw-semibold mb-4" style={{ fontSize: '3.2rem', lineHeight: '1.1', letterSpacing: '-1px' }}>
                  Create your account. <br />
                  <span style={{ fontWeight: 400, opacity: 0.85 }}>It’s that simple.</span>
                </h1>
                <p className="ms-auto" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '350px' }}>
                  Shop effortlessly. Track orders instantly. Enjoy a seamless experience from start to finish.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;