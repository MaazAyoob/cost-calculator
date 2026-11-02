import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { HuttyLogo } from '../brand/HuttyLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Hutty Architectural UI ErrorBoundary Caught]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, showDetails: false });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8F8F6]">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E5E7EB] shadow-soft-lg p-8 sm:p-10 space-y-6">
            <div className="flex justify-center">
              <HuttyLogo variant="compact" width={110} />
            </div>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E8EFE9] border border-[#CBD5CB] flex items-center justify-center text-[#183B32] shadow-soft-xs">
              <Compass className="w-8 h-8 text-[#245747]" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-[#C66B4E] bg-[#C66B4E]/10 px-3 py-1 rounded-full">
                Workspace Recovery
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#183B32] tracking-tight">
                Something didn't load properly
              </h2>
              <p className="text-sm text-[#4B5563] leading-relaxed max-w-md mx-auto">
                Don't worry — your draft project and saved choices remain safe in your browser. A quick refresh usually restores everything immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#183B32] hover:bg-[#245747] text-white font-semibold text-sm shadow-soft-md hover:shadow-soft-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Workspace</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#CBD5CB] text-[#183B32] hover:bg-[#E8EFE9] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 text-[#245747]" />
                <span>Return to Homepage</span>
              </button>
            </div>

            {this.state.error && (
              <div className="pt-4 border-t border-[#E5E7EB]/80 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="w-full flex items-center justify-between text-xs text-[#6B7280] hover:text-[#183B32] py-1 transition-colors"
                >
                  <span className="font-medium">Technical Details (for support)</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-[#F8F8F6] border border-[#E5E7EB] rounded-xl text-[11px] text-[#4B5563] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {this.state.error.message || 'Unknown application error'}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
