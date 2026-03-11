import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrimeLoaderProps {
  isLoading: boolean;
  /** If true, renders as an inline centered spinner instead of full-screen overlay */
  inline?: boolean;
  /** Custom message shown below the spinner */
  message?: string;
}

const PrimeLoader: React.FC<PrimeLoaderProps> = ({ isLoading, inline = false, message }) => {
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    setVisible(isLoading);
  }, [isLoading]);

  // Inline mode — renders inside the page flow (for admin pages)
  if (inline) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            key="prime-inline-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '60vh' }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid rgba(255, 140, 66, 0.2)',
                  borderTop: '4px solid var(--prime-deep)',
                  borderRadius: '50%',
                  margin: '0 auto',
                }}
              />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-3 mb-0 fw-semibold text-uppercase small"
                style={{ color: 'var(--prime-deep)', letterSpacing: '2px' }}
              >
                {message || "Loading"}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full-screen overlay mode — for auth pages, form submissions, etc.
  return (
    <AnimatePresence onExitComplete={() => setVisible(false)}>
      {visible && (
        <motion.div
          key="prime-simple-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.4, ease: "easeInOut" }
          }}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(253, 252, 251, 0.6)',
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(255, 140, 66, 0.2)',
              borderTop: '4px solid var(--prime-deep)',
              borderRadius: '50%',
            }}
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-3 mb-0 fw-semibold text-uppercase small"
            style={{
              color: 'var(--prime-deep)',
              letterSpacing: '2px'
            }}
          >
            Loading
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrimeLoader;