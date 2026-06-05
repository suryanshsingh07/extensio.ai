import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      isDark: localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in React component tree:", error, errorInfo);
  }

  componentDidMount() {
    this.handleThemeEvent = (e) => this.setState({ isDark: e.detail });
    window.addEventListener('theme-changed', this.handleThemeEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('theme-changed', this.handleThemeEvent);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { isDark } = this.state;

    if (this.state.hasError) {
      return (
        <div 
          style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
          className="min-h-screen font-sans flex flex-col items-center justify-center p-4 transition-colors duration-500"
        >
          <div 
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.3)'
            }}
            className="max-w-md w-full glass-panel p-8 rounded-3xl text-center shadow-2xl border transition-colors duration-500"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 style={{ color: isDark ? '#ffffff' : '#111827' }} className="text-2xl font-bold mb-3 transition-colors duration-500">
              Something went wrong
            </h1>
            <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }} className="mb-8 text-sm leading-relaxed transition-colors duration-500">
              We've encountered an unexpected error. Please try refreshing the page. If the issue persists, contact support.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-black/50 rounded-xl text-left overflow-auto text-xs text-red-400 font-mono">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
