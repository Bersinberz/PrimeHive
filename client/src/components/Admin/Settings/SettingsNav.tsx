import React from 'react';

export type SettingsSection = 'general' | 'shipping' | 'security';

interface SettingsNavProps {
    activeSection: SettingsSection;
    onSectionChange: (section: SettingsSection) => void;
}

const navItems: { key: SettingsSection; label: string; icon: React.ReactNode }[] = [
    {
        key: 'general',
        label: 'General Defaults',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
    },
    {
        key: 'shipping',
        label: 'Shipping & Taxes',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
    },
    {
        key: 'security',
        label: 'Admin & Security',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    },
];

const SettingsNav: React.FC<SettingsNavProps> = ({ activeSection, onSectionChange }) => {
    return (
        <div style={{
            width: '260px',
            flexShrink: 0,
            background: '#fff',
            borderRadius: '20px',
            border: '1px solid #f0f0f2',
            padding: '16px',
            height: 'fit-content',
            position: 'sticky',
            top: '24px',
        }}>
            {navItems.map(item => {
                const isActive = activeSection === item.key;
                return (
                    <button
                        key={item.key}
                        onClick={() => onSectionChange(item.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: 'none',
                            background: isActive ? 'var(--prime-orange, #ff8c42)' : 'transparent',
                            color: isActive ? '#fff' : '#888',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '4px',
                        }}
                        onMouseEnter={e => {
                            if (!isActive) {
                                e.currentTarget.style.background = '#f9f9fb';
                                e.currentTarget.style.color = '#555';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#888';
                            }
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SettingsNav;
