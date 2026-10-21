import { motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, Clock, CalendarDays, Copy } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <section className="px-4 sm:px-6 py-16 md:py-24 max-w-[1400px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[2rem] md:rounded-[4rem] overflow-hidden relative shadow-2xl shadow-black/5"
      >
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
            alt="Abstract Background" 
            className="w-full h-full object-cover filter grayscale opacity-20 scale-105 transform-gpu"
          />
          <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E85D04]/20 via-transparent to-transparent opacity-50" />
        </div>

        <div className="relative z-10 py-16 sm:py-24 md:py-40 px-6 sm:px-10 flex flex-col items-center justify-center text-center border border-white/10 rounded-[2rem] md:rounded-[4rem]">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-8 sm:mb-12 backdrop-blur-md shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-white font-mono text-[10px] sm:text-xs uppercase tracking-widest font-medium">Available for new opportunities</span>
          </motion.div>

          <h2 className="font-display font-medium text-[40px] leading-[1.05] sm:text-6xl md:text-8xl lg:text-[100px] tracking-tighter max-w-5xl md:leading-[0.95] mb-6 md:mb-10 text-white">
            Have a Product or Technical <span className="text-[#E85D04]">Challenge?</span>
          </h2>
          
          <p className="text-white/60 text-base sm:text-xl font-display max-w-2xl leading-relaxed mb-10 md:mb-14">
            Whether you're building a new application, improving an existing product, adding AI capabilities, or solving technical SEO and performance problems, I'm interested in building practical solutions that scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-12 w-full sm:w-auto">
            <Link to="/contact" className="group relative flex items-center justify-center bg-white text-black px-8 py-4.5 sm:py-5 rounded-full overflow-hidden transition-transform duration-300 active:scale-[0.98] w-full sm:w-auto shadow-xl shadow-white/5 min-h-[56px]">
              <div className="absolute inset-0 bg-[#E85D04] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative flex items-center gap-2 font-medium text-sm sm:text-base tracking-wide uppercase group-hover:text-white transition-colors duration-300">
                Start a Conversation <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </span>
            </Link>
            
                          <button 
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText("hi@jaiminumaraniya.me");
                  const btn = e.currentTarget;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 sm:w-5 sm:h-5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                  setTimeout(() => btn.innerHTML = originalText, 2000);
                }}
                className="flex justify-center items-center gap-2 px-8 py-4.5 sm:py-5 rounded-full border border-white/20 text-white font-medium text-sm sm:text-base tracking-wide uppercase active:bg-white/10 hover:bg-white/10 transition-colors w-full sm:w-auto min-h-[56px]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Email
              </button>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-white/50 font-mono text-[11px] sm:text-xs uppercase tracking-widest max-w-2xl w-full sm:w-auto bg-white/5 sm:bg-transparent p-6 sm:p-0 rounded-2xl sm:rounded-none border border-white/5 sm:border-transparent">
            <div className="flex items-center justify-center sm:justify-start gap-2">
               <Clock className="w-4 h-4 text-[#E85D04]" />
               <span>Avg. Response: 24h</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center justify-center sm:justify-start gap-2">
               <CalendarDays className="w-4 h-4 text-[#E85D04]" />
               <span>Booking for Q3</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center justify-center sm:justify-start gap-2">
               <CheckCircle2 className="w-4 h-4 text-[#E85D04]" />
               <span>End-to-End Delivery</span>
            </div>
          </div>

        </div>
        
      </motion.div>
    </section>
  );
}

