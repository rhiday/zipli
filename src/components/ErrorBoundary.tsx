import React from 'react';
import { Layout } from './Layout';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="p-6 flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#085f33] text-white rounded-lg hover:bg-[#064726] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}