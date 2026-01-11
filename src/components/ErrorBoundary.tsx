import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-950 to-black p-6">
          <div className="text-center max-w-2xl">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-red-500 to-red-700 rounded-full animate-pulse" />
              <div className="relative">
                <h1 className="text-5xl font-bold text-white mb-4">Oops!</h1>
                <p className="text-xl text-stone-300 mb-6">Something went wrong</p>
              </div>
            </div>
            
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-8 border border-stone-700/50 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Error Details</h2>
              <code className="block bg-stone-900/80 text-red-300 p-4 rounded-lg text-sm mb-6 overflow-x-auto">
                {this.state.error?.message || 'Unknown error occurred'}
              </code>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gold-500 text-stone-900 font-bold rounded-xl hover:bg-gold-600 transition-all transform hover:scale-105 active:scale-95"
                >
                  🔄 Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="px-6 py-3 bg-stone-700 text-white font-bold rounded-xl hover:bg-stone-600 transition-all transform hover:scale-105 active:scale-95"
                >
                  ↩️ Try Again
                </button>
                <a
                  href="/"
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 text-center"
                >
                  🏠 Go Home
                </a>
              </div>
            </div>
            
            <div className="text-stone-500 text-sm">
              <p>If the problem persists, please contact support.</p>
              <p className="mt-2">Error ID: {Date.now().toString(36).toUpperCase()}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;