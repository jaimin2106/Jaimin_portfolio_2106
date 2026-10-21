import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { ArrowRight, MapPin, Mail, Github, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="relative pt-20 md:pt-32 pb-8 overflow-hidden bg-[#0A0A0A] text-white mt-20 md:mt-32 rounded-t-[2.5rem] md:rounded-t-[4rem]">
      {/* Noise Texture & Background Accents */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-[#E85D04]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="px-6 max-w-7xl mx-auto relative z-10">

        {/* Top Section: CTA & Big Name */}
        <div className="flex flex-col items-center text-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-mono text-xs uppercase tracking-widest mb-8 shadow-2xl backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#E85D04] animate-pulse shadow-[0_0_8px_#E85D04]"></span>
            Available for new opportunities
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
          >
            Let's build something <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9D00]">extraordinary</span> together.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/contact"
              className="group flex items-center gap-4 bg-white text-black px-8 py-4 md:px-10 md:py-5 rounded-full font-medium text-lg hover:bg-[#E85D04] hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(232,93,4,0.3)]"
            >
              Start a Project
              <div className="bg-black text-white group-hover:bg-white group-hover:text-[#E85D04] rounded-full p-2 transition-all duration-300">
                <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>
        </div>



        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16 md:mb-24" />

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
          <div className="md:col-span-5 flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold tracking-tight">JAIMIN<span className="text-[#E85D04]">.</span></h3>
            <p className="text-gray-400 font-sans text-sm md:text-base max-w-sm leading-relaxed">
              Full-Stack Developer & AI Engineer specializing in React, Next.js, Node.js, AI integrations, SaaS architecture, technical SEO, and high-performance web experiences.
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <a href="mailto:umaraniyajaimin5@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors font-mono text-sm group w-fit">
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform text-[#E85D04]" />
                umaraniyajaimin5@gmail.com
              </a>
              <div className="flex items-center gap-3 text-gray-500 font-mono text-sm">
                <MapPin className="w-4 h-4 text-gray-600" />
                Ahmedabad, Working Globally
              </div>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-7 flex flex-col gap-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">Explore</h4>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit">Home</Link>
              <Link to="/projects" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit">Work</Link>
              <Link to="/contact" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit">Contact</Link>
              {settings.features.blog && <Link to="/blog" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit">Journal</Link>}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">Connect</h4>
            <div className="flex flex-col gap-4">
              {settings.socialLinks?.length > 0 ? settings.socialLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium capitalize w-fit flex items-center gap-2">
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                  {link.platform}
                </a>
              )) : (
                <>
                  <a href="#" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit flex items-center gap-2"><ArrowUpRight className="w-3 h-3 opacity-50" /> Twitter / X</a>
                  <a href="#" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit flex items-center gap-2"><ArrowUpRight className="w-3 h-3 opacity-50" /> LinkedIn</a>
                  <a href="#" className="text-gray-300 hover:text-[#E85D04] transition-colors text-sm font-medium w-fit flex items-center gap-2"><ArrowUpRight className="w-3 h-3 opacity-50" /> GitHub</a>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">Legal</h4>
            <div className="flex flex-col gap-4">
              <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm font-medium w-fit">Privacy Policy</Link>
              <Link to="/refund-policy" className="text-gray-300 hover:text-white transition-colors text-sm font-medium w-fit">Refund Policy</Link>
            </div>
          </div>
        </div>

      </div>

      {/* Huge Name at the bottom */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center px-0 overflow-hidden relative z-0 pt-8"
      >
        <h1 className="font-hero text-[20vw] md:text-[19vw] leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white/15 to-transparent uppercase tracking-tighter select-none hover:from-white/25 hover:to-[#E85D04]/15 transition-all duration-700 pb-4">
          JAIMIN
        </h1>

        <div className="w-full flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto text-[10px] md:text-xs font-mono text-gray-600 gap-3 pb-8 pt-2 border-t border-white/5">
          <p>© {new Date().getFullYear()} Jaimin Umaraniya. Engineered with precision.</p>
          <p className="flex items-center gap-1 text-gray-500">Status: <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All systems normal</span></p>
        </div>
      </motion.div>
    </footer>
  );
}
