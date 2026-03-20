import React from 'react';
import { motion } from 'framer-motion';

interface DashboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  message = "Failed to load dashboard data. Please check your connection and try again.",
  onRetry
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="d-flex flex-column align-items-center justify-content-center text-center w-100"
      style={{
        minHeight: '400px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px dashed #cbd5e1',
        padding: '40px'
      }}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-8, 4, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginBottom: '24px' }}
      >
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </motion.div>

      {/* Text Content */}
      <h4 className="fw-bolder text-dark mb-2" style={{ letterSpacing: '-0.5px' }}>
        Oops! Something went wrong
      </h4>
      <p className="text-muted mb-4" style={{ maxWidth: '400px', fontSize: '0.95rem', lineHeight: '1.6' }}>
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="btn px-4 py-2 fw-bold shadow-sm"
          style={{
            backgroundColor: 'var(--prime-orange, #ff8c42)',
            color: '#fff',
            borderRadius: '10px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default DashboardErrorState;