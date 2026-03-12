import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import fastCart from "../assets/loader.png";

interface PrimeLoaderProps {
  isLoading: boolean;
  inline?: boolean;
  message?: string;
}

const PrimeLoader: React.FC<PrimeLoaderProps> = ({
  isLoading,
  inline = false,
  message,
}) => {
  const [visible, setVisible] = useState(isLoading);

useEffect(() => {
  let timer: ReturnType<typeof setTimeout>;

  if (isLoading) {
    setVisible(true);
  } else {
    timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // 5 seconds
  }

  return () => clearTimeout(timer);
}, [isLoading]);

  // The fast-moving image component
  const FastMovingImage = () => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Fast Speed Lines Behind the Image */}
      <div style={{ position: 'absolute', right: '80%', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 0 }}>
        <motion.div
          animate={{ x: [20, -40], opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "linear", delay: 0.1 }}
          style={{ width: '30px', height: '3px', backgroundColor: 'var(--prime-orange, #ff8c42)', borderRadius: '4px' }}
        />
        <motion.div
          animate={{ x: [30, -50], opacity: [0, 1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "linear", delay: 0.2 }}
          style={{ width: '45px', height: '3px', backgroundColor: 'var(--prime-orange, #ff8c42)', borderRadius: '4px' }}
        />
        <motion.div
          animate={{ x: [10, -30], opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: 0 }}
          style={{ width: '20px', height: '3px', backgroundColor: 'var(--prime-orange, #ff8c42)', borderRadius: '4px' }}
        />
      </div>

      {/* The Actual Image */}
      <motion.div
        animate={{ x: [-2, 4, -2] }}
        transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
        style={{ zIndex: 1 }}
      >
        <img
          src={fastCart}
          alt="Loading..."
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            transform: 'skewX(-8deg)'
          }}
        />
      </motion.div>
    </div>
  );

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
              <FastMovingImage />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 mb-0 fw-bold text-uppercase small"
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

  // Overlay mode — changed to position-absolute so it stays inside its container
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
          // 👇 Changed from position-fixed to position-absolute
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            zIndex: 999, // Lowered from 9999 so it respects the sidebar's z-index
            backgroundColor: 'rgba(253, 252, 251, 0.7)',
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 'inherit' // Inherits rounded corners if the parent has them
          }}
        >
          <FastMovingImage />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-4 mb-0 fw-bold text-uppercase small"
            style={{
              color: 'var(--prime-deep)',
              letterSpacing: '2px'
            }}
          >
            {message || "Loading"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrimeLoader;