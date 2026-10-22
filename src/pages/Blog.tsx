import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Clock, CalendarDays } from "lucide-react";
import SEO from "../components/SEO";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";
import { ProgressiveImage } from "../components/ui/progressive-image";
import { BlogGridSkeleton } from "../components/ui/skeletons";

export default function Blog() {
  const [filter, setFilter] = useState("All");

  const { data: blogs = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.blogs,
    queryFn: () => api.getBlogs(),
    staleTime: STALE_TIMES.projects,
  });

  const categories = ["All", ...Array.from(new Set(blogs.map(p => p.category).filter(Boolean)))];
  const filteredPosts = filter === "All" ? blogs : blogs.filter(p => p.category === filter);

  const getCategoryCount = (cat: string) =>
    cat === "All" ? blogs.length : blogs.filter(p => p.category === cat).length;

  if (loading) return <BlogGridSkeleton />;

  const featuredPost = filter === "All" && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filter === "All" ? filteredPosts.slice(1) : filteredPosts;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <SEO
        title="Blog | Technical Articles & Thoughts | Jaimin Umaraniya"
        description="Read my latest technical articles, engineering deep-dives, and thoughts on AI, web development, and software architecture."
        keywords={["Technical Blog", "Web Development Articles", "Software Engineering Insights", "AI Development Blog", "Frontend Architecture", "Full Stack Developer Blog"]}
        schema={[
          {
            "@type": "CollectionPage",
            "@id": "https://jaiminumaraniya.me/blog#collection",
            "url": "https://jaiminumaraniya.me/blog",
            "name": "Journal — Jaimin Umaraniya",
            "description": "Technical insights, tutorials, and engineering articles.",
            "isPartOf": { "@id": "https://jaiminumaraniya.me/#website" },
          },
          {
            "@type": "ItemList",
            "@id": "https://jaiminumaraniya.me/blog#list",
            "itemListElement": filteredPosts.slice(0, 10).map((post: any, i: number) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": post.title,
              "url": `https://jaiminumaraniya.me/blog/${post.slug || post.id}`,
            })),
          }
        ]}
      />

      {/* ── Hero Header ───────────────────────────────────────────── */}
      <div className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/8 pb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E85D04]/10 text-[#E85D04]">
                <BookOpen size={18} />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Journal & Articles</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black text-white font-mono text-[10px]">{blogs.length}</span>
            </div>
            <h1 className="font-hero text-5xl md:text-7xl lg:text-[7rem] uppercase tracking-wider mb-4 leading-none">Blog</h1>
            <p className="font-mono text-xs md:text-sm text-gray-500 max-w-lg leading-relaxed">
              Engineering insights, tutorials, and deep-dives on AI, React architecture, and building production software.
            </p>
          </div>

          {/* ── Category filter ── */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setFilter(cat as string)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-mono font-medium border transition-all duration-200 ${
                  filter === cat
                    ? 'bg-black text-white border-black shadow-md'
                    : 'bg-transparent text-gray-600 border-gray-200 hover:border-black hover:text-black hover:bg-black/4'
                }`}
              >
                {cat as string}
                <span className={`text-[9px] ${filter === cat ? 'text-white/70' : 'text-gray-400'}`}>
                  {getCategoryCount(cat as string)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 pb-24 max-w-7xl mx-auto">

        {/* ── Featured / Hero Post ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {featuredPost && (
            <motion.div
              key={featuredPost.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="group mb-16 md:mb-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-center">
                {/* Image - takes 3 columns */}
                <Link
                  to={`/blog/${featuredPost.slug || featuredPost.id}`}
                  className="block relative lg:col-span-3 aspect-video lg:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-black/6 bg-gray-50 shadow-sm group-hover:shadow-xl transition-shadow duration-500"
                  aria-label={`Read ${featuredPost.title}`}
                >
                  <ProgressiveImage
                    src={featuredPost.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full bg-[#E85D04] text-white font-mono text-[10px] uppercase tracking-widest shadow-sm font-semibold">
                      Featured
                    </span>
                  </div>
                </Link>

                {/* Content - takes 2 columns */}
                <div className="lg:col-span-2 flex flex-col justify-center py-4">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-5">
                    {featuredPost.category && (
                      <span className="px-2.5 py-1 rounded-full bg-black/6 text-[10px] font-mono uppercase tracking-wider text-black font-medium">
                        {featuredPost.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400 uppercase">
                      <CalendarDays className="w-2.5 h-2.5" />
                      {featuredPost.date || new Date().toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400 uppercase">
                      <Clock className="w-2.5 h-2.5" />
                      {featuredPost.readTime || '5 min read'}
                    </span>
                  </div>

                  <Link to={`/blog/${featuredPost.slug || featuredPost.id}`}>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4 hover:text-[#E85D04] transition-colors duration-200">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-7 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <Link
                    to={`/blog/${featuredPost.slug || featuredPost.id}`}
                    className="group/cta inline-flex items-center gap-2 text-sm font-semibold hover:text-[#E85D04] transition-colors duration-200 border-b border-black hover:border-[#E85D04] pb-0.5 w-fit"
                  >
                    Read Article
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Article Grid ──────────────────────────────────────────── */}
        {remainingPosts.length > 0 && (
          <>
            {filter === "All" && featuredPost && (
              <div className="flex items-center gap-4 mb-10">
                <span className="font-mono text-xs uppercase tracking-widest text-gray-400">More Articles</span>
                <div className="flex-1 h-px bg-black/8" />
              </div>
            )}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
              <AnimatePresence>
                {remainingPosts.map((post, idx) => (
                  <motion.article
                    layout
                    key={post.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.45, delay: idx * 0.05 }}
                    className="group flex flex-col"
                  >
                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="block relative aspect-[16/10] rounded-xl md:rounded-2xl overflow-hidden mb-5 border border-black/6 bg-gray-50 shadow-sm group-hover:shadow-md transition-shadow duration-400"
                      aria-label={`Read ${post.title}`}
                    >
                      <ProgressiveImage
                        src={post.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/6 transition-colors duration-300" />
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-white/92 backdrop-blur-sm rounded-lg text-[9px] font-mono uppercase tracking-wider text-black font-semibold border border-black/6">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><CalendarDays className="w-2.5 h-2.5" />{post.date || new Date().toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{post.readTime || '5 min read'}</span>
                    </div>

                    <Link to={`/blog/${post.slug || post.id}`} className="group/title mb-2">
                      <h3 className="font-display text-lg md:text-xl font-bold tracking-tight leading-snug group-hover/title:text-[#E85D04] transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="group/cta inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#E85D04] transition-colors duration-200 mt-auto w-fit"
                    >
                      Read Article
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {filteredPosts.length === 0 && (
          <div className="flex items-center justify-center min-h-[30vh]">
            <p className="font-mono text-gray-400 text-center text-sm">No posts found in "{filter}".</p>
          </div>
        )}
      </div>
    </motion.main>
  );
}
