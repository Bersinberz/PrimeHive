import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM SVG ILLUSTRATIONS ---
const RobotIllustration = () => (
  <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antennas */}
    <path d="M70 50V30C70 24.4772 74.4772 20 80 20H85" stroke="var(--prime-deep)" strokeWidth="6" strokeLinecap="round" />
    <circle cx="90" cy="20" r="6" fill="#FFB020" />
    {/* Head */}
    <rect x="50" y="50" width="100" height="70" rx="12" fill="#475569" />
    <rect x="40" y="70" width="10" height="30" rx="5" fill="#94A3B8" />
    <rect x="150" y="70" width="10" height="30" rx="5" fill="#94A3B8" />
    {/* Eyes */}
    <circle cx="80" cy="85" r="12" fill="var(--prime-orange)" />
    <circle cx="80" cy="85" r="6" fill="white" />
    <path d="M115 75L135 95M135 75L115 95" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
    {/* Mouth */}
    <rect x="85" y="105" width="30" height="4" rx="2" fill="#CBD5E1" />
    {/* Body Spark */}
    <path d="M100 130L90 150H105L100 170" stroke="#FFB020" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ServerIllustration = () => (
  <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="30" width="120" height="40" rx="6" fill="#475569" />
    <circle cx="60" cy="50" r="4" fill="#10B981" />
    <line x1="80" y1="50" x2="140" y2="50" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

    <rect x="40" y="80" width="120" height="40" rx="6" fill="#475569" />
    <circle cx="60" cy="100" r="4" fill="var(--prime-orange)" />
    <line x1="80" y1="100" x2="140" y2="100" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

    <rect x="40" y="130" width="120" height="40" rx="6" fill="#475569" />
    <circle cx="60" cy="150" r="4" fill="#EF4444" />
    <line x1="80" y1="150" x2="140" y2="150" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

    <path d="M110 70L90 100H115L100 130" stroke="#FFB020" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const LockIllustration = () => (
  <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 90V65C60 42.9086 77.9086 25 100 25C122.091 25 140 42.9086 140 65V90" stroke="#94A3B8" strokeWidth="16" strokeLinecap="round" />
    <rect x="40" y="90" width="120" height="85" rx="12" fill="#475569" />
    <circle cx="100" cy="125" r="10" fill="var(--prime-orange)" />
    <path d="M96 130L94 150H106L104 130" fill="var(--prime-orange)" />
  </svg>
);

const PlugIllustration = () => (
  <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="80" width="40" height="40" rx="4" fill="#475569" />
    <rect x="120" y="80" width="30" height="40" rx="4" fill="#475569" />
    <line x1="90" y1="90" x2="110" y2="90" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
    <line x1="90" y1="110" x2="110" y2="110" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 100H50" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
    <path d="M150 100H180" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
    <path d="M100 50L100 150" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" transform="rotate(45 100 100)" />
  </svg>
);

// --- CONFIGURATION ---
const getErrorConfig = (status: number) => {
  switch (status) {
    case 400: return { d1: '4', d2: '0', Icon: RobotIllustration, title: "BAD REQUEST", subtitle: "We couldn't understand that request." };
    case 401: return { d1: '4', d2: '1', Icon: LockIllustration, title: "SESSION EXPIRED", subtitle: "Please log in again to continue." };
    case 403: return { d1: '4', d2: '3', Icon: LockIllustration, title: "ACCESS DENIED", subtitle: "You don't have permission to view this page." };
    case 404: return { d1: '4', d2: '4', Icon: RobotIllustration, title: "PAGE NOT FOUND", subtitle: "uh-oh! Nothing here..." };
    case 500: return { d1: '5', d2: '0', Icon: ServerIllustration, title: "SERVER ERROR", subtitle: "Our systems are experiencing a glitch." };
    case 0: return { d1: '5', d2: '3', Icon: PlugIllustration, title: "CONNECTION LOST", subtitle: "Please check your internet connection." };
    default: return { d1: '?', d2: '?', Icon: RobotIllustration, title: "UNEXPECTED ERROR", subtitle: "Something went wrong on our end." };
  }
};

const GlobalErrorOverlay: React.FC = () => {
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      setError(customEvent.detail);
    };

    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, []);

  const config = error ? getErrorConfig(error.status) : null;

  return (
    <AnimatePresence>
      {error && config && (
        <motion.div
          key="global-error-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white"
          style={{ zIndex: 10000, overflow: 'hidden' }}
        >
          {/* Top Label */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-5"
          >
            <h5 className="fw-bold text-muted mb-1 text-uppercase" style={{ letterSpacing: '4px' }}>
              {config.title}
            </h5>
            <p className="text-secondary opacity-75 small text-uppercase" style={{ letterSpacing: '2px' }}>
              Illustration
            </p>
          </motion.div>

          {/* Huge Number & Illustration Container */}
          <div className="d-flex align-items-center justify-content-center position-relative w-100 mb-5" style={{ height: '300px' }}>

            {/* Left Digit */}
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="fw-bold"
              style={{ fontSize: 'clamp(10rem, 25vw, 22rem)', color: '#F1F5F9', lineHeight: 1, zIndex: 1 }}
            >
              {config.d1}
            </motion.span>

            {/* Middle SVG Illustration */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="mx-3 mx-md-5 position-relative"
              style={{ zIndex: 2 }}
            >
              {/* Soft shadow under the illustration */}
              <div
                className="position-absolute start-50 translate-middle-x"
                style={{ bottom: '-10px', width: '80%', height: '20px', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, transparent 70%)' }}
              />
              <config.Icon />
            </motion.div>

            {/* Right Digit */}
            <motion.span
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="fw-bold"
              style={{ fontSize: 'clamp(10rem, 25vw, 22rem)', color: '#F1F5F9', lineHeight: 1, zIndex: 1 }}
            >
              {config.d2}
            </motion.span>
          </div>

          {/* Bottom Text & Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-4"
          >
            <h4 className="fw-bold text-dark mb-4">
              {error?.message || config.subtitle}
            </h4>

            <button
              onClick={() => {
                setError(null);
                // Optionally redirect to home: window.location.href = '/';
              }}
              className="btn btn-lg px-5 py-3 text-white fw-bold text-uppercase shadow-sm"
              style={{
                borderRadius: '50px', // Pill shape matching your image
                background: 'var(--prime-gradient)',
                letterSpacing: '1px',
                border: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Go Back Home
            </button>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalErrorOverlay;