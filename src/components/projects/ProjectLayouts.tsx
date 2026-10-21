import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Globe, Layout, Database, Server, Zap, Shield, Cpu, ExternalLink } from "lucide-react";
import { ProgressiveImage } from "../../components/ui/progressive-image";

// --- Helpers ---

export const getProjectUrl = (project: any) => `/projects/${project.slug || project.id}`;

// Safely parse techStack regardless of whether it is stored as a comma-separated
// string or as an Array in Firestore.
export const parseTechStack = (techStack: any): string[] => {
  if (!techStack) return [];
  if (Array.isArray(techStack)) return techStack.map(String).filter(Boolean);
  if (typeof techStack === "string") return techStack.split(",").map(s => s.trim()).filter(Boolean);
  return [];
};

export const getTechIcon = (tech: string) => {
  const t = tech.toLowerCase();
  if (t.includes("react") || t.includes("vue") || t.includes("svelte") || t.includes("ui")) return <Layout className="w-4 h-4" />;
  if (t.includes("node") || t.includes("express") || t.includes("server") || t.includes("next")) return <Server className="w-4 h-4" />;
  if (t.includes("sql") || t.includes("mongo") || t.includes("firebase") || t.includes("supabase") || t.includes("db")) return <Database className="w-4 h-4" />;
  if (t.includes("auth") || t.includes("security") || t.includes("jwt")) return <Shield className="w-4 h-4" />;
  if (t.includes("ai") || t.includes("ml") || t.includes("openai") || t.includes("gpt")) return <Cpu className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
};

export const generateMetrics = (project: any) => {
  const isWeb = project.category?.toLowerCase().includes("web") || project.category?.toLowerCase().includes("full");
  return [
    { label: "Performance", value: isWeb ? "98" : "Top 5%" },
    { label: "Accessibility", value: "100" },
    { label: "SEO", value: isWeb ? "100" : "N/A" }
  ];
};

// --- Spotlight Wrapper ---
export const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative overflow-hidden bg-white border border-black/5 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-500 group-hover:opacity-100 z-10 hidden md:block"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(232, 93, 4, 0.04),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};

// --- Card Types ---

// 0. The Featured Showcase
export const FeaturedCard = ({ project }: { project: any }) => {
  const tags = parseTechStack(project.techStack);
  const metrics = generateMetrics(project);

  return (
    <SpotlightCard className="rounded-[2rem] md:rounded-[3rem] shadow-sm hover:shadow-2xl transition-shadow duration-700 w-full flex flex-col md:flex-row p-4 md:p-6 gap-6 md:gap-10">
      <div className="w-full md:w-[60%] relative aspect-[4/3] md:aspect-[16/10] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-gray-50 border border-black/5">
        <ProgressiveImage
          src={project.thumbnail || project.image || ""}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        {project.liveUrl && (
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white/40 z-20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-black font-semibold">Production</span>
          </div>
        )}
      </div>

      <div className="w-full md:w-[40%] flex flex-col justify-center py-6 pr-4 md:pr-10 relative z-20">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {tags.slice(0, 4).map((tech: string) => (
            <div key={tech} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-black/5 rounded-full text-gray-600 hover:text-black hover:border-black/20 transition-colors" title={tech}>
              {getTechIcon(tech)}
              <span className="font-mono text-[10px] uppercase font-medium">{tech}</span>
            </div>
          ))}
        </div>
        
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-4 group-hover:text-[#E85D04] transition-colors duration-300">
          {project.title}
        </h2>
        
        <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 line-clamp-3">
          {project.shortDescription || project.description}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-10 pt-6 border-t border-black/5">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-display text-2xl md:text-3xl font-bold text-black">{m.value}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-auto">
          <Link
            to={getProjectUrl(project)}
            className="flex items-center justify-center gap-2 flex-1 bg-black text-white px-6 py-4 rounded-full font-medium text-sm hover:bg-[#E85D04] transition-colors duration-300 shadow-xl shadow-black/10"
           aria-label={`Read case study for ${project.title}`}>
            Read Case Study
          </Link>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 rounded-full border border-black/10 text-gray-600 hover:text-black hover:border-black transition-colors" aria-label={`Visit live site for ${project.title}`}>
              <Globe className="w-5 h-5" />
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 rounded-full border border-black/10 text-gray-600 hover:text-black hover:border-black transition-colors" aria-label={`View source code for ${project.title}`}>
              <Github className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
};

// 1. The Split Focus
export const SplitCard = ({ project, reverse = false }: { project: any, reverse?: boolean }) => {
  return (
    <SpotlightCard className={`rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-50 border-b md:border-b-0 md:border-r border-black/5">
        <ProgressiveImage
          src={project.thumbnail || project.image || ""}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-14 relative z-20">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#E85D04] mb-4 font-semibold">
          {project.category || "Engineering"}
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 group-hover:text-[#E85D04] transition-colors">
          {project.title}
        </h2>
        <p className="text-gray-500 leading-relaxed mb-8 line-clamp-3">
          {project.shortDescription || project.description}
        </p>
        
        <div className="flex flex-col gap-3 mb-10">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Production Ready</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-[#E85D04]" />
            <span>High Performance</span>
          </div>
        </div>

        <Link
          to={getProjectUrl(project)}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold hover:text-[#E85D04] transition-colors w-fit"
         aria-label={`Explore architecture for ${project.title}`}>
          Explore Architecture <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </SpotlightCard>
  );
};

// 2 & 3. The Grid Card
export const GridCard = ({ project }: { project: any }) => {
  const tags = parseTechStack(project.techStack);
  
  return (
    <SpotlightCard className="rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col h-full group/card p-3 border border-black/5">
      <div className="relative aspect-[4/3] rounded-[1rem] overflow-hidden mb-6 bg-gray-50 border border-black/5">
        <ProgressiveImage
          src={project.thumbnail || project.image || ""}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors duration-500" />
        <Link
          to={getProjectUrl(project)}
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" aria-label={`View details for ${project.title}`}
        >
          <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-xl translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Link>
      </div>
      
      <div className="px-3 pb-3 flex flex-col flex-1 relative z-20">
        <h3 className="font-display text-2xl font-bold tracking-tight text-black mb-2 group-hover/card:text-[#E85D04] transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
          {project.shortDescription || project.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <div className="flex items-center gap-2">
            {tags.slice(0, 4).map((tech: string) => (
              <span key={tech} title={tech} className="text-gray-400 hover:text-[#E85D04] transition-colors">
                {getTechIcon(tech)}
              </span>
            ))}
          </div>
          {project.liveUrl && (
             <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1" aria-label={`Live demo for ${project.title}`}>
               Live <ExternalLink className="w-3 h-3" />
             </a>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
};

// 4. The Story Card (Text focused)
export const StoryCard = ({ project }: { project: any }) => {
  return (
    <SpotlightCard className="col-span-1 md:col-span-2 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-500 p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-16 items-center bg-gray-50/50">
      <div className="w-full md:w-1/2 flex flex-col relative z-20">
        <div className="flex items-center gap-3 mb-6 text-xs font-mono uppercase tracking-widest text-[#E85D04] font-semibold">
          <Database className="w-4 h-4" /> Data-Driven Architecture
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-black mb-6">
          {project.title}
        </h2>
        <div className="space-y-6 text-gray-600 mb-8">
          <p>
            <strong>Problem:</strong> Required a robust, scalable solution capable of handling complex state and intensive operations.
          </p>
          <p>
            <strong>Solution:</strong> Architected a high-performance system leveraging modern web technologies, SSR, and optimized database querying to ensure 99.9% uptime.
          </p>
        </div>
        <Link
          to={getProjectUrl(project)}
          className="w-fit bg-white border border-black/10 text-black px-6 py-3 rounded-full font-medium text-sm hover:bg-black hover:text-white transition-colors shadow-sm"
         aria-label={`Read the full story for ${project.title}`}>
          Read the full story
        </Link>
      </div>
      <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-black/5 relative group/story z-20">
        <ProgressiveImage
          src={project.thumbnail || project.image || ""}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover/story:scale-105"
        />
      </div>
    </SpotlightCard>
  );
};

// 5+. Compact List Item
export const CompactCard = ({ project }: { project: any }) => {
  return (
    <Link to={getProjectUrl(project)} className="group block border-b border-black/5 hover:border-black/20 transition-colors" aria-label={`View project ${project.title}`}>

      <div className="flex flex-col md:flex-row md:items-center justify-between py-6 md:py-8 gap-4 px-2">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm border border-black/5">
            <ProgressiveImage
              src={project.thumbnail || project.image || ""}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-black group-hover:text-[#E85D04] transition-colors mb-1">
              {project.title}
            </h3>
            <span className="font-mono text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{project.category || 'App'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-gray-400 group-hover:text-black transition-colors ml-22 md:ml-0">
          <span className="font-mono text-xs hidden md:block">View Project</span>
          <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};
