import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VARIANTS } from "../lib/motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Works", path: "/projects" },
    ...(settings.features.blog ? [{ name: "Blogs", path: "/blog" }] : []),
    { name: "Contact", path: "/contact" }
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled ? "bg-white/90 backdrop-blur-md border-black/5 py-4" : "bg-transparent border-transparent py-5 md:py-8"
        }`}
      >
        <div className="w-full px-4 md:px-8 xl:px-12 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl md:text-2xl tracking-tighter text-black flex items-center gap-2 group">
            <span className="relative overflow-hidden flex items-center pb-1 border-b-2 border-transparent hover:border-black transition-colors duration-300">
              {settings.siteName}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors relative group py-1 ${
                    isActive ? "text-[#E85D04]" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {item.name}
                  <span 
                    className={`absolute bottom-0 left-0 h-[1.5px] bg-current transition-transform duration-300 origin-left ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {settings.availabilityStatus && (
              <div className="hidden sm:flex items-center gap-2 border border-black/10 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-mono font-medium text-gray-500">Available</span>
              </div>
            )}
            {/* Hire Me CTA - desktop only */}
            <Link
              to="/contact"
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#0A0A0A] text-white px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-[#E85D04] transition-colors duration-300 shadow-sm"
            >
              Hire Me
            </Link>

            
            
            <button 
              className="lg:hidden p-2 -mr-2 text-black hover:bg-black/5 rounded-full transition-colors flex items-center"
              onClick={() => setIsOpen(true)}
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed top-0 right-0 w-[85%] max-w-sm h-[100dvh] bg-[#Fbfbf9] shadow-2xl z-[60] lg:hidden flex flex-col p-6 md:p-8 border-l border-black/5"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-display font-medium text-xs tracking-widest uppercase text-gray-400">Navigation</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-black hover:bg-black/5 rounded-full transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-6">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`text-3xl font-display font-light tracking-tight transition-colors flex items-center justify-between group ${isActive ? 'text-[#E85D04]' : 'text-black hover:text-gray-500'}`}
                    >
                      {item.name}
                      <span className={`h-[1px] bg-[#E85D04] transition-all duration-500 ${isActive ? 'w-8' : 'w-0 group-hover:w-8'}`}></span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8 border-t border-black/10">
                <Link to="/contact" className="w-full bg-black text-white px-5 py-4 rounded-xl text-sm font-medium hover:bg-[#E85D04] transition-colors flex items-center justify-center gap-2">
                  Let's Talk
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

