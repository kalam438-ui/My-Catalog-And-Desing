import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const firestoreError = JSON.parse(this.state.error?.message || '{}');
        if (firestoreError.error) {
          errorMessage = `Database Error: ${firestoreError.error}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0a1a17] flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-[#1a3a34] p-8 rounded-sm border border-[#3d5a54] shadow-2xl">
            <h1 className="text-menu-accent text-xl font-bold uppercase tracking-[0.2em] mb-4">Application Error</h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-menu-accent text-menu-bg px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors rounded-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
