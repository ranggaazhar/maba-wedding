import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-xl p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Oops, terjadi kesalahan!
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Terjadi kesalahan sistem saat memproses halaman ini. Mohon coba segarkan halaman atau kembali ke Beranda.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left font-mono text-xs text-slate-600 max-h-40 overflow-y-auto break-all shadow-inner">
                <strong>Detail Error:</strong> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full h-11 flex items-center justify-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                onClick={this.handleGoHome}
                type="button"
              >
                <Home size={16} />
                Beranda
              </Button>
              <Button
                className="w-full h-11 flex items-center justify-center gap-2 gradient-ocean text-white font-medium"
                onClick={this.handleReload}
                type="button"
              >
                <RefreshCw size={16} />
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
