import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center p-5"
          style={{ minHeight: '60vh' }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mb-4"
            style={{ width: 72, height: 72, background: '#fef2f2' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h5 className="fw-bold text-dark mb-2">Something went wrong</h5>
          <p className="text-muted mb-4" style={{ maxWidth: 360 }}>
            {this.state.error?.message || 'An unexpected error occurred in this section.'}
          </p>
          <button
            className="btn btn-sm px-4 py-2 text-white fw-bold border-0"
            style={{ background: 'var(--prime-gradient, linear-gradient(135deg,#ff8c42,#ff5722))', borderRadius: 8 }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
