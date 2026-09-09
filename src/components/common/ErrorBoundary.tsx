import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Cost Calculator UI ErrorBoundary Caught]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 shadow-soft-xs">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-lg font-extrabold text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              An unexpected error occurred in the workspace. Our engineering team has been notified.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-slate-100 rounded-lg text-[10px] text-slate-600 font-mono text-left overflow-x-auto mt-3">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <Button size="sm" onClick={this.handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Reload Workspace
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
