import { formatTechName, parseTags } from "../lib/format";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

export default function CaseStudies() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: () => api.getProjects(),
    staleTime: STALE_TIMES.projects,
  });

  // rAF-debounced mousemove — prevents 60 state updates per second
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const x = e.clientX;
    const y = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      setMousePos({ x, y });
    });
  }, []);



  if (loading || projects.length === 0) return null;

  return (
    <section id="case-study-list" className="bg-[#111] text-white py-24 md:py-32 px-4 sm:px-6 relative" onMouseMove={handleMouseMove}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 md:mb-24 border-b border-white/10 pb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#E85D04] p-3 md:p-3.5 rounded-xl text-white transform -rotate-3 shadow-lg shadow-[#E85D04]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white">SELECTED PROJECTS</h2>
          </div>
          <p className="font-mono text-xs md:text-sm text-white/50 max-w-sm leading-relaxed uppercase tracking-wider">
             In-depth looks at how architectural decisions solved real business challenges.
          </p>
        </div>

        {/* Floating Thumbnail Preview (Desktop Only) */}
        <div className="pointer-events-none fixed inset-0 z-50 hidden lg:block overflow-hidden h-screen w-screen" style={{ pointerEvents: 'none' }}>
          <AnimatePresence>
            {hoveredProject && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: mousePos.x,
                  y: mousePos.y,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
                className="absolute w-[320px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-[#111]"
                style={{ 
                  left: -160, 
                  top: -120,
                  transformOrigin: "center center"
                }}
              >
                {projects.map((p) => p.id === hoveredProject && (
                  <img 
                    key={p.id}
                    src={p.thumbnail || p.featuredImage || p.image || "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=600&auto=format&fit=crop"} 
                    alt={p.title}
                    loading="lazy"
                    width={320}
                    height={240}
                    className="w-full h-full object-cover"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col border-t border-white/10">
          {projects.map((study, idx) => (
            <motion.div 
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredProject(study.id)}
              onMouseLeave={() => setHoveredProject(null)}
              className="group border-b border-white/10 py-10 md:py-14 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 relative transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex-1 flex flex-col gap-4 lg:gap-6 z-10 w-full relative">
                
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-widest">
                  <span className="text-[#E85D04] font-medium border border-[#E85D04]/30 px-2 py-0.5 rounded-sm">{study.category || "Case Study"}</span>
                  <span className="hidden sm:inline-block">•</span>
                  <span>{study.year || "2024"}</span>
                  <span className="hidden sm:inline-block">•</span>
                  <span>{study.role || "Lead Developer"}</span>
                </div>
                
                {/* Title & Description */}
                <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-8">
                  <h3 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl lg:text-[80px] leading-none tracking-tight group-hover:text-[#E85D04] transition-colors duration-500">
                    {study.title}
                  </h3>
                  <p className="text-white/60 text-sm sm:text-base max-w-md xl:max-w-sm leading-relaxed pb-2 xl:pb-3">
                    {study.shortDescription || "A scalable multi-tenant e-commerce platform using Next.js and AWS."}
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {(parseTags(study.techStack).length > 0 ? parseTags(study.techStack) : parseTags(study.skills)).slice(0, 4).map((tag: string) => (
                    <span key={formatTechName(tag)} className="px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 text-[10px] font-mono uppercase tracking-wider">
                      {formatTechName(tag)}
                    </span>
                  ))}
                </div>

              </div>
              
              {/* Actions / Links */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 z-20 shrink-0">
                 <Link 
                   to={`/projects/${study.slug || study.id}`} 
                   className="inline-flex items-center justify-between sm:justify-center gap-4 bg-white text-black px-6 py-3 md:py-4 rounded-full font-medium text-xs md:text-sm tracking-wide uppercase hover:bg-[#E85D04] hover:text-white transition-colors duration-300"
                 >
                   Read Case Study <ArrowRight className="w-4 h-4" />
                 </Link>
                 
                 <div className="flex items-center gap-2 w-full">
                   {study.liveUrl && (
                     <a href={study.liveUrl} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 border border-white/20 text-white hover:bg-white hover:text-black px-4 py-3 rounded-full text-xs font-mono uppercase transition-colors duration-300">
                       Live Site <ArrowUpRight className="w-3 h-3" />
                     </a>
                   )}
                   {study.githubUrl && (
                     <a href={study.githubUrl} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 border border-white/20 text-white hover:bg-white hover:text-black px-4 py-3 rounded-full text-xs font-mono uppercase transition-colors duration-300">
                       Repo <Github className="w-3 h-3" />
                     </a>
                   )}
                 </div>
              </div>
              
              {/* Mobile Thumbnail Fallback */}
              <div className="w-full lg:hidden rounded-2xl overflow-hidden aspect-video border border-white/10 mt-4 relative z-0">
                 <img 
                   src={study.thumbnail || study.featuredImage || study.image || "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1200&auto=format&fit=crop"} 
                   alt={study.title} 
                   loading="lazy"
                   width={600}
                   height={400}
                   className="w-full h-full object-cover" 
                 />
                 <div className="absolute inset-0 bg-black/20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
