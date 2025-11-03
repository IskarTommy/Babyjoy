import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
            <p className="text-muted-foreground mt-2">
              An error occurred while loading this page.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-500 mt-2 font-mono">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.resetError} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}