import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('BeatStore UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4">
          <div className="beat-card p-4 border border-danger">
            <h5 className="fw-bold text-danger mb-2">
              <i className="bi bi-bug me-2" />
              Ocurrió un error al mostrar esta pantalla
            </h5>
            <p className="text-muted mb-2">
              Copia este mensaje y compártelo para poder corregirlo:
            </p>
            <pre
              className="bg-light p-3 rounded small text-danger mb-3"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => this.setState({ error: null })}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
