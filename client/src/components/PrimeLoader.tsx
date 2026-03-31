import React from 'react';
import { createPortal } from 'react-dom';

interface PrimeLoaderProps {
  isLoading: boolean;
  inline?: boolean;
  message?: string;
}

const PrimeLoader: React.FC<PrimeLoaderProps> = ({
  isLoading,
  inline = false,
  message = "Loading...",
}) => {
  if (!isLoading) return null;

  const LoaderContent = () => (
    <div className="d-flex flex-column align-items-center justify-content-center text-center">
      <div
        className="spinner-border"
        role="status"
        style={{
          width: '3rem',
          height: '3rem',
          color: 'var(--prime-orange, #ff8c42)'
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>

      {message && (
        <p
          className="mt-3 mb-0 fw-bold text-uppercase small"
          style={{ color: 'var(--prime-deep, #333)', letterSpacing: '2px' }}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (inline) {
    return (
      <div
        className="d-flex justify-content-center align-items-center w-100"
        style={{ minHeight: '60vh' }}
      >
        <LoaderContent />
      </div>
    );
  }

  return createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(253, 252, 251, 0.7)',
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <LoaderContent />
    </div>,
    document.body
  );
};

export default PrimeLoader;
