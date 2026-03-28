import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Minimal wrapper for components that need routing
export const renderWithRouter = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>, ...options });

// Mock auth user factory
export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

export const mockAdminUser = (overrides = {}) => ({
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'superadmin',
  ...overrides,
});
