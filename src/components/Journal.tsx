import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

export default function Journal() {
  const { data: articles = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.blogs,
    queryFn: () => api.getBlogs(),
    staleTime: STALE_TIMES.blogs,
  });


  if (loading || articles.length === 0) return null;

  return (
    <section id="journal" className="bg-[#111] text-white py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-20 border-b border-white/10 pb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#E85D04] p-3 md:p-3.5 rounded-xl text-white transform -rotate-3 shadow-lg shadow-[#E85D04]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white">Latest Engineering Articles</h2>
          </div>
          <p className="font-mono text-xs md:text-sm text-white/50 max-w-sm leading-relaxed uppercase tracking-wider">
            Thoughts, lessons, and behind-the-scenes insights from my engineering journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {articles.slice(0, 2).map((article, idx) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col"
            >
               <Link to={`/blog/${article.slug || article.id}`} className="block flex-1 flex flex-col">
                <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 relative bg-white/5 border border-white/10 shadow-xl">
                  {article.image && (
                    <img 
                      src={article.image || undefined} 
                      alt={article.title}
                      loading="lazy"
                      width={800}
                      height={600}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 font-mono text-xs font-medium text-white uppercase tracking-widest shadow-sm">
                      {article.category || 'Engineering'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mb-4">
                   <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-[#E85D04]" />
                      <span>{article.date || new Date().toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#E85D04]" />
                      <span>{article.readTime || '5 min read'}</span>
                   </div>
                </div>
                
                <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight group-hover:text-[#E85D04] transition-colors duration-300 mb-6">
                  {article.title}
                </h3>
                
                <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                  {article.excerpt}
                </p>
                
                <div className="mt-auto">
                  <div className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 sm:py-4 rounded-full font-medium text-xs sm:text-sm tracking-wide uppercase transition-transform duration-300 group-hover:bg-[#E85D04] group-hover:text-white group-active:scale-95 shadow-lg shadow-white/5">
                    Read Article <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
