import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', gap: '16px', textAlign: 'center', padding: '40px'
        }}>
            <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: '#fff4ee',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--prime-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', margin: 0 }}>Access Restricted</h2>
            <p style={{ color: '#888', fontSize: '0.95rem', fontWeight: 500, maxWidth: '360px', margin: 0 }}>
                You don't have permission to view this page. Contact your super admin if you think this is a mistake.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => navigate(-1)}
                    style={{ padding: '10px 22px', borderRadius: 50, border: '1.5px solid #e5e7eb', background: '#fff', color: '#555', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Go Back
                </button>
                <button onClick={handleLogout}
                    style={{ padding: '10px 22px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Sign Out & Re-login
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;
