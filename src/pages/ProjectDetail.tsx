import { formatTechName, parseTags } from "../lib/format";
import { useState, useEffect, useRef } from "react";
import { useEngagement } from "../hooks/useEngagement";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight, Github, Globe, Share2, Heart, Type, Minus, Plus } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";
import SEO from "../components/SEO";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";
import { ProgressiveImage } from "../components/ui/progressive-image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { CANONICAL_ORIGIN } from "../data/site-seo.js";
import { projectSeoDescription } from "../data/project-seo.js";

const CANONICAL_DOMAIN = CANONICAL_ORIGIN;


// Responsive table wrapper (used in legacy Markdown fallback)
const ResponsiveTable = ({ children }: any) => (
  <div className="overflow-x-auto my-8 rounded-xl border border-black/10 not-prose">
    <table className="min-w-full divide-y divide-black/10">{children}</table>
  </div>
);

// Content Image for legacy Markdown fallback
const ContentImage = ({ src, alt, ...props }: any) => {
  const [lightbox, setLightbox] = useState(false);
  if (!src) return null;
  return (
    <>
      <figure className="not-prose my-10 md:my-14">
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          onClick={() => setLightbox(true)}
          className="w-full h-auto rounded-2xl md:rounded-[2rem] shadow-lg border border-black/5 object-cover cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"
          {...props}
        />
        {alt && (
          <figcaption className="mt-3 text-center text-xs font-mono text-gray-400">{alt}</figcaption>
        )}
      </figure>
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Full size: ${alt}`}
        >
          <img src={src} alt={alt || ""} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </>
  );
};



// Detects whether content is HTML (TipTap) or plain Markdown
const isHtmlContent = (content: string) => /^\s*<[a-zA-Z]/.test(content.trimStart());

// Code block with scroll containment (for legacy Markdown content)
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  if (!inline && match) {
    return (
      <div className="relative rounded-xl overflow-hidden my-6 border border-white/10 bg-[#111] not-prose">
        <div className="px-4 py-2 bg-black/40 border-b border-white/10">
          <span className="text-xs font-mono text-gray-400">{match[1]}</span>
        </div>
        <pre className="!m-0 !rounded-none !bg-transparent p-4 overflow-x-auto text-sm leading-relaxed max-w-full" {...props}>
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  }
  return <code className={`${className || ""} bg-gray-100 text-[#E85D04] px-1.5 py-0.5 rounded text-[0.875em] font-mono`} {...props}>{children}</code>;
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Ensure scroll to top on navigation/mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Attach click-to-zoom to all <img> tags rendered via dangerouslySetInnerHTML
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const imgs = container.querySelectorAll<HTMLImageElement>("img");
    const handlers: (() => void)[] = [];
    imgs.forEach((img) => {
      img.style.cursor = "zoom-in";
      const handler = () => setLightboxSrc(img.src);
      img.addEventListener("click", handler);
      handlers.push(() => img.removeEventListener("click", handler));
    });
    return () => handlers.forEach((cleanup) => cleanup());
  });

  const { data: project, isLoading: loadingProject, isError } = useQuery({
    queryKey: ["public_project", id],
    queryFn: async () => {
      if (!id) return null;
      let data = await api.getProjectBySlug(id);
      if (!data) data = await api.getProjectById(id);
      return data;
    },
    enabled: !!id,
    staleTime: STALE_TIMES.projects,
  });

  const { data: otherProjects = [] } = useQuery({
    queryKey: ["public_projects_other", id],
    queryFn: () => (id ? api.getProjects().then(projects => projects.filter(p => p.id !== id).slice(0, 3)) : []),
    enabled: !!id,
    staleTime: STALE_TIMES.projects,
  });

  const { likes, views, isLiked, toggleLike } = useEngagement("projects", project?.id);

  const handleShare = async () => {
    if (!project) return;
    const url = `${CANONICAL_DOMAIN}/projects/${project.slug || project.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, text: project.shortDescription || "", url });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const ctaOpacity = useTransform(scrollY, [400, 500], [0, 1]);
  const ctaY = useTransform(scrollY, [400, 500], [100, 0]);

  const [textSize, setTextSize] = useState<"base" | "lg" | "xl">("lg");
  const increaseTextSize = () => setTextSize(prev => prev === "base" ? "lg" : "xl");
  const decreaseTextSize = () => setTextSize(prev => prev === "xl" ? "lg" : "base");

  if (loadingProject)
    return (
      <div className="pt-32 text-center h-screen flex justify-center items-center" aria-label="Loading project">
        <div className="w-8 h-8 rounded-full border-2 border-[#E85D04] border-t-transparent animate-spin" role="status" />
      </div>
    );

  if (isError) {
    return (
      <main className="pt-32 text-center min-h-screen flex flex-col justify-center items-center">
        <SEO title="Project temporarily unavailable" description="Project details could not be loaded. Please try again shortly." noindex />
        <h1 className="text-2xl font-bold">Project temporarily unavailable</h1>
        <p className="mt-3 text-gray-500">There was a problem loading this project. Please try again.</p>
      </main>
    );
  }

  if (!project) return <NotFound />;

  // SSR-safe canonical URL — the CONTENT SLUG, never the Firestore doc id
  const projectSlug = project.slug || project.id;
  const canonicalUrl = `${CANONICAL_DOMAIN}/projects/${projectSlug}`;
  const pageTitle = project.seoTitle || project.title;
  const pageDescription = projectSeoDescription(project);
  const createdAtDate = project.createdAt?.toDate?.()
    ?? (project.createdAt?.seconds
      ? new Date(project.createdAt.seconds * 1000)
      : project.createdAt ? new Date(project.createdAt) : undefined);
  // Use pregenerated og-image (HTTPS) — base64 data URIs cannot be crawled by WhatsApp/Twitter
  const rawImage = project.thumbnail || project.featuredImage || project.heroImage || project.image;
  const seoImage = (rawImage && !rawImage.startsWith('data:'))
    ? rawImage
    : `${CANONICAL_DOMAIN}/og-images/project-${projectSlug}.jpg`;

  const techTags = parseTags(project.techStack);
  const keywords = project.seoKeywords?.split(",").map((k: string) => k.trim()) || techTags;

  const projectSchema = {
    "@type": "SoftwareApplication",
    "@id": `${canonicalUrl}#software`,
    "name": pageTitle,
    "description": pageDescription,
    "applicationCategory": project.category || "WebApplication",
    "programmingLanguage": techTags.join(", "),
    ...(project.githubUrl && { "codeRepository": project.githubUrl }),
    ...(project.liveUrl && { "url": project.liveUrl }),
    "author": {
      "@type": "Person",
      "@id": `${CANONICAL_DOMAIN}/#person`,
      "name": "Jaimin Umaraniya",
    },
    ...(seoImage && { "image": seoImage }),
    ...(createdAtDate && !Number.isNaN(createdAtDate.getTime()) && { "dateCreated": createdAtDate.toISOString() }),
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": CANONICAL_DOMAIN },
      { "@type": "ListItem", "position": 2, "name": "Projects", "item": `${CANONICAL_DOMAIN}/projects` },
      { "@type": "ListItem", "position": 3, "name": pageTitle, "item": canonicalUrl },
    ],
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white min-h-screen"
      >
        <SEO
          title={`${pageTitle} | Case Study`}
          description={pageDescription}
          keywords={keywords.length > 0 ? keywords : undefined}
          ogImage={seoImage}
          ogImageAlt={pageTitle}
          type="article"
          schema={[projectSchema, breadcrumbSchema]}
        />

        {/* Reading Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-[#E85D04] origin-left z-50 pointer-events-none will-change-transform"
          style={{ scaleX }}
        />

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-xl border border-black/10 rounded-full shadow-2xl shadow-black/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLike}
            aria-label={isLiked ? "Unlike this project" : "Like this project"}
            aria-pressed={isLiked}
            className={`relative flex items-center gap-2 px-4 h-10 md:h-11 rounded-full font-medium text-sm transition-all ${
              isLiked ? "bg-red-50 text-red-500 border border-red-100" : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.4, 0.9, 1.1, 1] : 1, rotate: isLiked ? [0, -15, 15, -10, 0] : 0 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? "fill-current" : ""}`} />
            </motion.div>
            <span className="text-xs font-medium">{likes}</span>
          </motion.button>

          <div className="hidden sm:block w-px h-5 bg-black/10 mx-0.5" />

          {/* Text Size Adjuster */}
          <div className="hidden sm:flex items-center gap-0.5 px-1 bg-gray-50/50 rounded-full border border-black/5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              onClick={decreaseTextSize}
              disabled={textSize === "base"}
              aria-label="Decrease font size"
            >
              <Minus className="w-3.5 h-3.5" />
            </motion.button>
            <Type className="w-3.5 h-3.5 text-gray-400" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              onClick={increaseTextSize}
              disabled={textSize === "xl"}
              aria-label="Increase font size"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="hidden sm:block w-px h-5 bg-black/10 mx-0.5" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
            onClick={handleShare}
            aria-label="Share this project"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>

        <div className="pt-24 md:pt-32 pb-16 px-4 md:px-6 max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mb-8 md:mb-10">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-gray-400">
              <li><Link to="/" className="hover:text-[#E85D04] transition-colors">Home</Link></li>
              <li><span className="text-gray-300" aria-hidden="true">/</span></li>
              <li><Link to="/projects" className="hover:text-[#E85D04] transition-colors">Projects</Link></li>
              <li><span className="text-gray-300" aria-hidden="true">/</span></li>
              <li className="text-gray-600 truncate max-w-[180px] md:max-w-[400px]" aria-current="page">
                {project.title}
              </li>
            </ol>
          </nav>

          {/* Project Header */}
          <div className="mb-8 md:mb-10">
            {/* Category & Meta chips */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-5 md:mb-6">
              {project.category && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-wider text-black font-medium border border-black/5">
                  {project.category}
                </span>
              )}
              {(project.timeline || project.year) && (
                <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase">{project.timeline || project.year}</span>
              )}
              {project.role && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" aria-hidden="true" />
                  <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase">{project.role}</span>
                </>
              )}
            </div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4"
            >
              {project.title}
            </motion.h1>

            {(project.subtitle || project.shortDescription) && (
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-lg md:text-xl font-display text-gray-500 leading-relaxed mb-6 md:mb-8 max-w-2xl"
              >
                {project.shortDescription || project.subtitle}
              </motion.p>
            )}

            {/* Author + Actions row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 md:py-5 border-y border-black/8">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                  style={{ background: "linear-gradient(135deg, #E85D04 0%, #FF6B00 100%)" }}
                  aria-hidden="true"
                >
                  JU
                </div>
                <div>
                  <p className="font-display font-semibold text-sm md:text-base leading-none text-[#121212] mb-0.5">Jaimin Umaraniya</p>
                  <p className="font-mono text-[10px] md:text-xs text-gray-400">Software Engineer</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {views > 0 && (
                  <span className="text-xs font-mono text-gray-400">{views} views</span>
                )}
                <button
                  onClick={toggleLike}
                  aria-label={isLiked ? "Unlike this project" : "Like this project"}
                  aria-pressed={isLiked}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 transition-colors ${isLiked ? "bg-red-50 text-red-500" : "hover:bg-gray-200 text-gray-600"}`}
                >
                  <motion.div animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  </motion.div>
                  {likes > 0 && <span className="text-xs font-medium">{likes}</span>}
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share this project"
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CTA Links */}
          {(project.liveUrl || project.githubUrl) && (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3 mb-8 md:mb-12"
            >
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#E85D04] hover:bg-[#d04d00] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-medium text-sm transition-colors shadow-sm"
                >
                  <Globe className="w-4 h-4" /> Live Site <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-medium text-sm transition-colors shadow-sm"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
            </motion.div>
          )}

          {/* Hero Image */}
          {rawImage && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-12 md:mb-16 border border-black/5 shadow-xl bg-gray-50 flex justify-center items-center"
            >
              <ProgressiveImage
                src={rawImage}
                alt={`${project.title} project screenshot`}
                priority={true}
                className="w-full h-auto object-contain"
              />
            </motion.div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className={`
              prose prose-gray max-w-none transition-all duration-300
              ${textSize === "base" ? "prose-base" : textSize === "lg" ? "prose-lg" : "prose-xl"}
              prose-p:leading-[1.8] prose-p:text-[#1a1a1a] prose-p:font-normal prose-p:tracking-[-0.015em]
              prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0A0A0A]
              prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-black/5
              prose-h3:mt-12 prose-h3:mb-5
              prose-h4:mt-8 prose-h4:mb-4
              prose-a:text-[#E85D04] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#0A0A0A] prose-strong:font-bold
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10 prose-img:w-full prose-img:h-auto prose-img:block prose-img:border prose-img:border-black/5
              prose-blockquote:border-l-[4px] prose-blockquote:border-[#E85D04] prose-blockquote:bg-[#FFF8F5] prose-blockquote:py-5 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-700
              prose-ul:my-8 prose-ol:my-8 prose-li:my-2
              prose-pre:p-0 prose-pre:bg-transparent prose-pre:shadow-none
              prose-code:text-[0.875em] prose-code:font-mono
              prose-table:w-full prose-table:overflow-x-auto
            `}
          >
            {project.content ? (
              isHtmlContent(project.content) ? (
                // TipTap HTML content â€” render directly so media library images show
                <div dangerouslySetInnerHTML={{ __html: project.content }} />
              ) : (
                // Legacy Markdown content â€” keep react-markdown fallback
                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{ code: CodeBlock, table: ResponsiveTable, img: ContentImage }}>
                  {project.content}
                </Markdown>
              )
            ) : (
              <>
                {project.fullDescription && (
                  <>
                    <h2>Overview</h2>
                    <p>{project.fullDescription}</p>
                  </>
                )}
                {project.challenges && (
                  <>
                    <h2>Challenges & Architecture</h2>
                    <p>{project.challenges}</p>
                  </>
                )}
              </>
            )}
          </div>

          {/* Click-to-zoom lightbox for HTML content images */}
          {lightboxSrc && (
            <div
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setLightboxSrc(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Full size image"
            >
              <img
                src={lightboxSrc}
                alt=""
                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              />
            </div>
          )}

          {/* Project FAQs */}
          {project.faqs && project.faqs.length > 0 && (
            <div className="mt-16 md:mt-20 pt-12 border-t border-black/8">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-[#0A0A0A] mb-8 tracking-tight">
                Frequently Asked Questions
              </h2>
              <Accordion className="w-full">
                {project.faqs.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-black/5">
                    <AccordionTrigger className="text-left font-display font-medium text-base md:text-lg text-[#0A0A0A] hover:no-underline py-5 data-[state=open]:text-[#E85D04] transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#3A3A3A] leading-relaxed text-sm md:text-base pb-5 font-sans">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Tech Stack */}
          {techTags.length > 0 && (
            <div className="mt-12 md:mt-16 pt-8 border-t border-black/8">
              <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {techTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full border border-black/10 text-xs md:text-sm font-medium text-gray-600 bg-white shadow-sm hover:border-black/20 transition-colors"
                  >
                    {formatTechName(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other Projects */}
          {otherProjects.length > 0 && (
            <section aria-labelledby="more-projects-heading" className="mt-20 pt-12 border-t border-black/5">
              <h2 id="more-projects-heading" className="font-display text-2xl md:text-3xl font-bold mb-8 text-[#0A0A0A] tracking-tight">
                More Projects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {otherProjects.map((op: any) => (
                  <Link
                    key={op.id}
                    to={`/projects/${op.id}`}
                    className="group block"
                    aria-label={`View project: ${op.title}`}
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100 relative">
                      <ProgressiveImage
                        src={op.thumbnail || op.featuredImage || op.heroImage || op.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"}
                        alt={op.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h3 className="font-display font-bold text-lg md:text-xl mb-1.5 group-hover:text-[#E85D04] transition-colors">
                      {op.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {op.shortDescription || op.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-16 md:mt-20 bg-[#111] text-white p-8 sm:p-10 md:p-14 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern-dark opacity-[0.08] pointer-events-none" />
            <div className="relative z-10 max-w-lg">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 md:mb-4 tracking-tight">
                Ready to start your project?
              </h3>
              <p className="text-sm md:text-base text-white/60 mb-7 leading-relaxed">
                Let's build something beautiful, performant, and scalable together.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#E85D04] hover:bg-[#d04d00] text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-colors"
              >
                Get in Touch <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          

        </div>
      </motion.main>
    </>
  );
}






