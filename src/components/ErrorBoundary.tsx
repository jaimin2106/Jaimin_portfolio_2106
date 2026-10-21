import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "motion/react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-xl w-full text-center relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertOctagon className="w-12 h-12 text-red-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display font-medium text-4xl sm:text-5xl tracking-tight mb-4 text-white">
                System Malfunction
              </h1>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed font-mono mb-6 max-w-md mx-auto">
                A critical error occurred while rendering the interface. The system has logged the anomaly.
              </p>

              {this.state.error && (
                <div className="mb-10 text-left bg-black/40 border border-white/10 p-4 rounded-xl overflow-auto max-h-[150px] w-full max-w-[500px] shadow-inner font-mono text-xs text-red-400/80">
                  <code>{this.state.error.toString()}</code>
                </div>
              )}

              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-xs font-mono uppercase tracking-widest transition-transform duration-300 hover:scale-105 shadow-lg shadow-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                Reboot System
              </button>
            </motion.div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
