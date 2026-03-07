import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrimeLoaderProps {
  isLoading: boolean;
}

const PrimeLoader: React.FC<PrimeLoaderProps> = ({ isLoading }) => {
  const [, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) setShow(true);
  }, [isLoading]);

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {isLoading && (
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
            // A semi-transparent soft background to let the website peek through
            backgroundColor: 'rgba(253, 252, 251, 0.6)',
            // Blurs everything behind this overlay
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)", // Safari support
          }}
        >
          {/* Simple, Elegant Spinning Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{
              width: '60px',
              height: '60px',
              // Light transparent orange for the track
              border: '4px solid rgba(255, 140, 66, 0.2)',
              // Solid deep orange for the spinning segment
              borderTop: '4px solid var(--prime-deep)',
              borderRadius: '50%',
            }}
          />

          {/* Simple fading text */}
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