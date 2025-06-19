import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console or external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Optionally: send to Supabase or other logging service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong.</h2>
          <p className="mb-4 text-gray-600">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={this.handleRetry} className="px-6 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Retry">
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
} 