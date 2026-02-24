/**
 * ErrorBoundary — App-level crash fallback
 *
 * Catches unhandled React errors and shows a user-friendly
 * recovery screen instead of a blank white page.
 */

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <h2 className="font-pencil-hand text-3xl text-parchment">
              Something went wrong
            </h2>
            <p className="font-serif text-parchment/70 text-sm">
              An unexpected error occurred. Your data is safe.
            </p>
            <div className="space-y-3 pt-4">
              <button
                onClick={this.handleReload}
                className="w-full min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-2 px-6 rounded-md transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full min-h-[44px] text-parchment/60 font-serif text-sm underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
