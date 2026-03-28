import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock auth service
vi.mock('../services/authService', () => ({
  loginUser:      vi.fn(),
  signupUser:     vi.fn(),
  refreshSession: vi.fn(async () => ({ token: 'tok', user: { id: '1', name: 'Test', email: 'a@b.com', role: 'user' } })),
  logoutUser:     vi.fn(async () => {}),
}));

vi.mock('../utils/tokenService', () => ({
  setAccessToken:   vi.fn(),
  clearAccessToken: vi.fn(),
  getAccessToken:   vi.fn(() => null),
}));

import { loginUser, logoutUser } from '../services/authService';

const AuthConsumer = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="name">{user?.name ?? 'none'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const renderAuth = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </MemoryRouter>
  );

describe('AuthContext', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts unauthenticated after failed refresh', async () => {
    (loginUser as any).mockRejectedValue(new Error('fail'));
    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('no');
    });
  });

  it('sets user on successful login', async () => {
    const mockUser = { id: '1', name: 'Alice', email: 'a@b.com', role: 'user' };
    (loginUser as any).mockResolvedValue({ token: 'tok', user: mockUser });
    renderAuth();
    await waitFor(() => {}); // wait for initial refresh
    await act(async () => { screen.getByText('Login').click(); });
    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Alice');
      expect(screen.getByTestId('auth').textContent).toBe('yes');
    });
  });

  it('clears user on logout', async () => {
    const mockUser = { id: '1', name: 'Alice', email: 'a@b.com', role: 'user' };
    (loginUser as any).mockResolvedValue({ token: 'tok', user: mockUser });
    (logoutUser as any).mockResolvedValue(undefined);
    renderAuth();
    await act(async () => { screen.getByText('Login').click(); });
    await act(async () => { screen.getByText('Logout').click(); });
    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('no');
    });
  });
});
