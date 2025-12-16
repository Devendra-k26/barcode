'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's the removeChild error we want to suppress
    if (
      error.name === 'NotFoundError' &&
      error.message?.includes('removeChild') &&
      error.message?.includes('not a child')
    ) {
      // Suppress this specific error
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress removeChild errors from html5-qrcode
    if (
      error.name === 'NotFoundError' &&
      error.message?.includes('removeChild') &&
      error.message?.includes('not a child')
    ) {
      console.debug('Suppressed removeChild error from html5-qrcode:', error);
      return;
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

