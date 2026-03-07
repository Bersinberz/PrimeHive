import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastNotificationProps {
  toast: { type: 'success' | 'error'; title: string; message: string } | null;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const isSuccess = toast?.type === 'success';

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="position-fixed d-flex align-items-start gap-3"
          style={{
            zIndex: 1060,
            top: '24px',
            right: '24px',
            minWidth: '340px',
            maxWidth: '420px',
            padding: '16px 20px',
            borderRadius: '14px',
            background: isSuccess
              ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
              : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: `1px solid ${isSuccess ? '#a7f3d0' : '#fecaca'}`,
            boxShadow: isSuccess
              ? '0 10px 30px -5px rgba(16, 185, 129, 0.2), 0 4px 10px -3px rgba(16, 185, 129, 0.1)'
              : '0 10px 30px -5px rgba(239, 68, 68, 0.2), 0 4px 10px -3px rgba(239, 68, 68, 0.1)',
          }}
        >
          {/* Icon */}
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isSuccess ? '#10b981' : '#ef4444',
              boxShadow: isSuccess
                ? '0 4px 12px rgba(16, 185, 129, 0.35)'
                : '0 4px 12px rgba(239, 68, 68, 0.35)',
            }}
          >
            {isSuccess ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            )}
          </div>

          {/* Text */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <h6
              className="mb-0 fw-bolder"
              style={{ fontSize: '0.9rem', color: isSuccess ? '#065f46' : '#991b1b' }}
            >
              {toast.title}
            </h6>
            <p
              className="mb-0 mt-1"
              style={{
                fontSize: '0.8rem',
                lineHeight: '1.4',
                color: isSuccess ? '#047857' : '#b91c1c',
                opacity: 0.85,
                wordBreak: 'break-word',
              }}
            >
              {toast.message}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="btn p-0 border-0 flex-shrink-0 d-flex align-items-center justify-content-center"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: isSuccess ? 'rgba(6, 95, 70, 0.08)' : 'rgba(153, 27, 27, 0.08)',
              color: isSuccess ? '#065f46' : '#991b1b',
              marginTop: '2px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isSuccess ? 'rgba(6, 95, 70, 0.15)' : 'rgba(153, 27, 27, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = isSuccess ? 'rgba(6, 95, 70, 0.08)' : 'rgba(153, 27, 27, 0.08)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* Progress bar that shrinks over 4 seconds */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: 'linear' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '16px',
              right: '16px',
              height: '3px',
              borderRadius: '0 0 14px 14px',
              background: isSuccess
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
              transformOrigin: 'left',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;