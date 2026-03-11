import React from 'react';
import type { Variants } from 'framer-motion';

// Shared input styling
export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1.5px solid #f0f0f2',
    background: '#fafafa',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#1a1a1a',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

// Shared label styling
export const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
};

// Shared focus/blur handlers for inputs
export const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = 'var(--prime-orange)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,140,66,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = '#f0f0f2';
        e.currentTarget.style.boxShadow = 'none';
    },
};

// Shared page transition variants
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};
