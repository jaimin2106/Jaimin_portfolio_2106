import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Clock, User, Target, Calendar, Github, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { parseTags, formatTechName } from "../lib/format";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";
import { FeaturedProjectSkeleton } from "./ui/skeletons";
import { MagneticButton } from "./ui/magnetic-button";

export default function FeaturedProject() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imgParallax = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const { data: project, isLoading: loading } = useQuery({
    queryKey: ['public_featured_project'],
    queryFn: async () => {
      const featDoc = await getDoc(doc(db, "featuredProject", "main"));
      if (featDoc.exists() && featDoc.data().projectId) {
        const projDoc = await getDoc(doc(db, "projects", featDoc.data().projectId));
        if (projDoc.exists()) {
          return { id: projDoc.id, ...projDoc.data() } as any;
        }
      }
      return null;
    },
    staleTime: STALE_TIMES.projects, // 30 mins
  });

  if (loading) {
    return <FeaturedProjectSkeleton />;
  }

  if (!project) {
    return null;
  }

  return (
    <section id="featured-project" className="px-4 sm:px-6 pb-20 md:pb-32 max-w-[1400px] mx-auto scroll-mt-24">
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-grid-pattern border border-black/5 rounded-[2rem] md:rounded-[3.5rem] p-5 sm:p-10 md:p-16 text-black relative overflow-hidden bg-[#FAFAFA] shadow-2xl shadow-black/5"
      >
        {/* Floating Accents */}
        <div className="absolute top-0 right-0 p-8 md:p-12 z-20 pointer-events-none">
          <span className="font-mono text-[10px] md:text-xs text-gray-400 font-medium tracking-widest uppercase">// Featured Work</span>
        </div>
        
        <div className="relative z-10 w-full flex flex-col gap-10 lg:gap-16">
          
          {/* Header & Meta */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-start lg:items-end justify-between">
            <div className="flex-1 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-2 rounded-full border border-black/10 text-[10px] sm:text-xs font-mono uppercase tracking-wider bg-white shadow-sm font-medium">
                  {project.category || "Case Study"}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-[10px] sm:text-xs font-mono uppercase tracking-wider border border-green-200 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {project.status || "Live in Production"}
                </span>
              </div>
              <h2 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl lg:text-[80px] uppercase tracking-tighter mb-6 leading-[0.95] text-gray-900">
                {project.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
                {project.shortDescription}
              </p>
            </div>
            
            {/* CTAs */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <MagneticButton strength={0.3} className="w-full sm:w-auto">
                <Link to={`/projects/${project.slug || project.id}`} className="group relative inline-flex items-center justify-center bg-black text-white px-8 py-4 sm:py-5 rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 w-full sm:w-auto flex-shrink-0">
                  <div className="absolute inset-0 bg-[#E85D04] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative flex items-center gap-2 font-medium text-[15px] sm:text-[16px] tracking-wide uppercase">
                    Read Case Study <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </span>
                </Link>
              </MagneticButton>
              {project.liveUrl && (
                <MagneticButton strength={0.2} className="w-full sm:w-auto">
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="group inline-flex justify-center items-center gap-2 px-8 py-4 sm:py-5 rounded-full border border-black/10 bg-white text-black font-medium text-[15px] sm:text-[16px] tracking-wide uppercase hover:border-black/30 hover:shadow-md transition-all duration-300 w-full sm:w-auto">
                    Live Site <Globe className="w-4 h-4 group-hover:text-[#E85D04] transition-colors" />
                  </a>
                </MagneticButton>
              )}
            </div>
          </div>

          {/* Hero Image / Video Container */}
          <Link to={`/projects/${project.slug || project.id}`} className="block w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#111] border border-black/10 aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] relative group cursor-pointer">
            <motion.div 
              style={{ y: imgParallax }}
              className="w-full h-[120%] -top-[10%] relative"
            >
              <img 
                src={project.thumbnail || project.featuredImage || project.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"} 
                alt={project.title} 
                loading="lazy"
                width={1600}
                height={900}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-1000 ease-[0.16,1,0.3,1]"
              />
            </motion.div>
            
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Floating Glass Metadata (Bottom) */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 overflow-hidden">
              <div className="flex flex-wrap gap-3 md:gap-4 max-w-3xl transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100 ease-[0.16,1,0.3,1]">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-xl">
                   <Calendar className="w-4 h-4 text-white" />
                   <span className="text-white text-xs font-mono tracking-widest uppercase">{project.year || "2024"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-xl">
                   <User className="w-4 h-4 text-white" />
                   <span className="text-white text-xs font-mono tracking-widest uppercase">{project.role || "Lead Developer"}</span>
                </div>
              </div>
              
              {/* Tech Chips */}
              {project.skills && (
                <div className="hidden md:flex flex-wrap items-center gap-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-200 ease-[0.16,1,0.3,1] justify-end max-w-[50%]">
                  {parseTags(project.skills).slice(0, 5).map((skill: string) => (
                    <span key={skill} className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white font-mono text-[10px] uppercase tracking-wider shadow-lg">
                      {formatTechName(skill)}
                    </span>
                  ))}
                  {(parseTags(project.skills).length > 5) && (
                    <span className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/70 font-mono text-[10px] uppercase tracking-wider shadow-lg">
                      +{parseTags(project.skills).length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Tech Chips (Mobile) */}
            {project.skills && (
              <div className="absolute top-6 left-6 right-6 flex md:hidden flex-wrap items-center gap-2">
                {parseTags(project.skills).slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white font-mono text-[9px] uppercase tracking-wider shadow-lg">
                    {formatTechName(skill)}
                  </span>
                ))}
              </div>
            )}
          </Link>
          
        </div>
      </motion.div>
    </section>
  );
}
