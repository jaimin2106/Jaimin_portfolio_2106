import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="404 - Page Not Found" description="The page you are looking for does not exist." noindex={true} />
      <section className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E85D04]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <h1 className="font-hero text-[120px] sm:text-[180px] md:text-[220px] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10 select-none">
              404
            </h1>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center mix-blend-overlay">
              <span className="font-hero text-[120px] sm:text-[180px] md:text-[220px] leading-none tracking-tighter text-[#E85D04] animate-pulse opacity-50">
                404
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 md:mt-8"
          >
            <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tight mb-4">
              Lost in the void
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-md mx-auto leading-relaxed font-mono mb-10">
              The page you're looking for has drifted into the unknown, or perhaps it never existed at all.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              
              <Link 
                to="/" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E85D04] text-white px-8 py-4 rounded-full text-xs font-mono uppercase tracking-widest transition-transform duration-300 hover:scale-105 shadow-lg shadow-[#E85D04]/20"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

