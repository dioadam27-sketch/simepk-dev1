import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
              Sistem mengalami kendala teknis saat memuat aplikasi. Mohon coba muat ulang halaman.
            </p>
            
            {/* Area Error Teknis (Opsional, membantu debugging user) */}
            {this.state.error && (
                <div className="bg-slate-100 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32 border border-slate-200">
                    <p className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap break-words">
                        {this.state.error.toString()}
                    </p>
                </div>
            )}

            <button
              onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#003B73] text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
            >
              <RefreshCcw className="w-4 h-4" /> Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}