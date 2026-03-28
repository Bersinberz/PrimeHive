import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { MemoryRouter } from 'react-router-dom';

// Mock auth context — guest by default
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
}));

// Mock cart service
vi.mock('../services/storefront/cartService', () => ({
  getCart:        vi.fn(async () => ({ items: [] })),
  syncCart:       vi.fn(async () => ({ items: [] })),
  addToCart:      vi.fn(async () => ({ items: [] })),
  removeCartItem: vi.fn(async () => ({ items: [] })),
  updateCartItem: vi.fn(async () => ({ items: [] })),
  clearServerCart:vi.fn(async () => {}),
}));

// Helper component to expose cart state
const CartConsumer = () => {
  const { items, totalItems, totalPrice, addItem, removeItem, clearCart } = useCart();
  return (
    <div>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="price">{totalPrice}</span>
      <span data-testid="items">{JSON.stringify(items)}</span>
      <button onClick={() => addItem('p1', 'Widget', 100, '', 10)}>Add</button>
      <button onClick={() => removeItem('p1')}>Remove</button>
      <button onClick={() => clearCart()}>Clear</button>
    </div>
  );
};

const renderCart = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    </MemoryRouter>
  );

describe('CartContext (guest mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with empty cart', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('price').textContent).toBe('0');
  });

  it('adds an item', async () => {
    renderCart();
    await act(async () => {
      screen.getByText('Add').click();
    });
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('price').textContent).toBe('100');
  });

  it('removes an item', async () => {
    renderCart();
    await act(async () => { screen.getByText('Add').click(); });
    await act(async () => { screen.getByText('Remove').click(); });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('clears the cart', async () => {
    renderCart();
    await act(async () => { screen.getByText('Add').click(); });
    await act(async () => { screen.getByText('Clear').click(); });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('accumulates quantity for same product', async () => {
    renderCart();
    await act(async () => { screen.getByText('Add').click(); });
    await act(async () => { screen.getByText('Add').click(); });
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('price').textContent).toBe('200');
  });
});
