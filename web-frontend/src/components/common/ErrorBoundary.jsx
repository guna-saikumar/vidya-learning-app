import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#ffffff',
            color: '#3a2d29',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fbece3',
              color: '#b95d3f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '20px',
            }}
          >
            !
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '10px',
              color: '#3a2d29',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#79675f',
              maxWidth: '420px',
              marginBottom: '28px',
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred while loading this page. Please try
            refreshing or return to home.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #ede1d8',
                backgroundColor: '#ffffff',
                color: '#3a2d29',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#b95d3f',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
