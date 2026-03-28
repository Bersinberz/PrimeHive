import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock PrimeLoader and AccessDenied
vi.mock('../components/PrimeLoader', () => ({ default: () => <div>Loading...</div> }));
vi.mock('../components/AccessDenied', () => ({ default: () => <div>Access Denied</div> }));

import { useAuth } from '../context/AuthContext';

const renderRoute = (children = <div>Protected Content</div>, props = {}) =>
  render(
    <MemoryRouter>
      <ProtectedRoute {...props}>{children}</ProtectedRoute>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  it('shows loader while auth is loading', () => {
    (useAuth as any).mockReturnValue({ user: null, isAuthenticated: false, loading: true });
    renderRoute();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to /auth when not authenticated', () => {
    (useAuth as any).mockReturnValue({ user: null, isAuthenticated: false, loading: false });
    renderRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children for superadmin', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'superadmin', permissions: null },
      isAuthenticated: true,
      loading: false,
    });
    renderRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children for staff with correct permission', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: '2', role: 'staff',
        permissions: { products: { view: true, create: false, edit: false, delete: false } },
      },
      isAuthenticated: true,
      loading: false,
    });
    renderRoute(<div>Protected Content</div>, { permission: 'products' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows AccessDenied for staff without permission', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: '2', role: 'staff',
        permissions: { products: { view: false, create: false, edit: false, delete: false } },
      },
      isAuthenticated: true,
      loading: false,
    });
    renderRoute(<div>Protected Content</div>, { permission: 'products' });
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects non-admin user away from admin route', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '3', role: 'user', permissions: null },
      isAuthenticated: true,
      loading: false,
    });
    renderRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
