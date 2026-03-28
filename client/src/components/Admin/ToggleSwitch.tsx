import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label }) => (
  <label
    htmlFor={id}
    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      style={{ display: 'none' }}
    />
    {/* Track */}
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 44,
        height: 24,
        borderRadius: 999,
        background: checked
          ? 'linear-gradient(135deg, #ff8c42, #ff6b2b)'
          : '#d1d5db',
        transition: 'background 0.25s ease',
        flexShrink: 0,
        boxShadow: checked ? '0 0 0 3px rgba(255,140,66,0.18)' : 'none',
      }}
    >
      {/* Thumb */}
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </span>
    {label && (
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: checked ? '#ff8c42' : '#6b7280' }}>
        {label}
      </span>
    )}
  </label>
);

export default ToggleSwitch;
