import { formatTechName, parseTags } from "../lib/format";
import { useState, useEffect, useRef } from "react";
import { useEngagement } from "../hooks/useEngagement";
import { motion, useScroll, useSpring } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { Share2, ArrowUpRight, Heart, Check, Copy, ExternalLink, Type, Minus, Plus } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";
import { ProgressiveImage } from "../components/ui/progressive-image";
import { BlogDetailSkeleton } from "../components/ui/skeletons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const CANONICAL_DOMAIN = "https://jaiminumaraniya.me";

gsap.registerPlugin(ScrollTrigger);

// Custom code block with copy button and horizontal scroll
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-xl overflow-hidden my-8 border border-white/10 bg-[#111] not-prose">
        <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
          <span className="text-xs font-mono text-gray-400">{match[1]}</span>
          <button
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <pre className="!m-0 !rounded-none !bg-transparent p-4 overflow-x-auto text-sm leading-relaxed max-w-full" {...props}>
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  }
  return <code className={`${className || ""} bg-gray-100 text-[#E85D04] px-1.5 py-0.5 rounded text-[0.875em] font-mono`} {...props}>{children}</code>;
};

// Table component that prevents horizontal overflow on mobile
const ResponsiveTable = ({ children }: any) => (
  <div className="overflow-x-auto my-8 rounded-xl border border-black/10 not-prose">
    <table className="min-w-full divide-y divide-black/10">{children}</table>
  </div>
);

// Content Image â€” renders images inside markdown with proper styling
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
          className="max-w-full h-auto mx-auto rounded-2xl md:rounded-[2rem] shadow-lg border border-black/5 object-contain cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"
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
          <img
            src={src}
            alt={alt || ""}
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </>
  );
};

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: post, isLoading: loadingPost } = useQuery({
    queryKey: ["public_blog", id],
    queryFn: async () => {
      if (!id) return null;
      return api.getBlogBySlug(id);
    },
    enabled: !!id,
    staleTime: STALE_TIMES.projects,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["public_blogs_related", id],
    queryFn: () => (id ? api.getBlogs().then(blogs => blogs.filter(b => b.id !== id).slice(0, 3)) : []),
    enabled: !!id,
    staleTime: STALE_TIMES.projects,
  });

  const { likes, views, isLiked, toggleLike } = useEngagement("blogs", post?.id);
  const loading = loadingPost;
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [textSize, setTextSize] = useState<"base" | "lg" | "xl">("lg");
  const increaseTextSize = () => setTextSize(prev => prev === "base" ? "lg" : "xl");
  const decreaseTextSize = () => setTextSize(prev => prev === "xl" ? "lg" : "base");

  useEffect(() => {
    if (!loading && post && contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".prose > *",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".prose",
              start: "top 85%",
            },
          }
        );
      }, contentRef);
      return () => ctx.revert();
    }
  }, [loading, post]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (loading) return <BlogDetailSkeleton />;
  if (!post)
    return (
      <div className="pt-32 text-center h-screen font-display text-2xl font-bold flex items-center justify-center">
        Post not found.
      </div>
    );

  const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug || id}`;
  const pageTitle = post.seoTitle || post.title;
  const pageDescription = post.seoDescription || post.excerpt || "";
  const slug = (post.slug || id || '').toLowerCase();
  // Use pregenerated og-image (set at build time by prerender.js) â€” must be a crawlable HTTPS URL
  // Data URIs (base64) stored in Firebase cannot be read by WhatsApp/Twitter/LinkedIn crawlers
  const rawImage = post.ogImage || post.seoImage || post.image;
  const pageImage = (rawImage && !rawImage.startsWith('data:'))
    ? rawImage
    : `${CANONICAL_DOMAIN}/og-images/blog-${slug}.jpg`;
  const tags = parseTags(post.tags);
  const keywords = post.seoKeywords?.split(",").map((k: string) => k.trim()) || tags;

  const articleSchema = {
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    "headline": pageTitle,
    "description": pageDescription,
    "image": pageImage ? [pageImage] : [],
    "datePublished": post.createdAt ? new Date(post.createdAt.seconds * 1000).toISOString() : undefined,
    "dateModified": post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toISOString() : undefined,
    "author": {
      "@type": "Person",
      "@id": `${CANONICAL_DOMAIN}/#person`,
      "name": post.authorName || "Jaimin Umaraniya",
      "url": CANONICAL_DOMAIN,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jaimin Umaraniya",
      "logo": {
        "@type": "ImageObject",
        "url": `${CANONICAL_DOMAIN}/favicon.ico`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "url": canonicalUrl,
    ...(post.category && { "articleSection": post.category }),
    ...(tags.length > 0 && { "keywords": tags.join(", ") }),
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": CANONICAL_DOMAIN },
      { "@type": "ListItem", "position": 2, "name": "Journal", "item": `${CANONICAL_DOMAIN}/blog` },
      { "@type": "ListItem", "position": 3, "name": pageTitle, "item": canonicalUrl },
    ],
  };

  const shareUrl = canonicalUrl;
  const encodedTitle = encodeURIComponent(pageTitle);
  const encodedUrl = encodeURIComponent(shareUrl);
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=jaimin_dev`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white min-h-screen relative"
      >
        <SEO
          title={pageTitle}
          description={pageDescription}
          keywords={keywords.length > 0 ? keywords : undefined}
          ogImage={pageImage}
          ogImageAlt={pageTitle}
          type="article"
          author={post.authorName || "Jaimin Umaraniya"}
          publishedTime={post.createdAt ? new Date(post.createdAt.seconds * 1000).toISOString() : undefined}
          modifiedTime={post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toISOString() : undefined}
          readingTime={post.readTime}
          category={post.category}
          tags={tags}
          schema={[articleSchema, breadcrumbSchema]}
        />

        {/* Reading Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-[#FF6B00] origin-left z-[100] pointer-events-none will-change-transform"
          style={{ scaleX }}
        />

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-xl border border-black/10 rounded-full shadow-2xl shadow-black/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLike}
            aria-label={isLiked ? "Unlike this post" : "Like this post"}
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
            {isLiked && (
              <motion.div
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-red-300 pointer-events-none"
              />
            )}
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
            aria-label="Share this article"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
          >
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>

        <div className="pt-24 md:pt-32 pb-16 w-full mx-auto">
          {/* Article Header */}
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-8">
            {/* Breadcrumbs */}
            <nav aria-label="breadcrumb" className="mb-8 md:mb-10">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-gray-400">
                <li><Link to="/" className="hover:text-[#FF6B00] transition-colors">Home</Link></li>
                <li><span className="text-gray-300" aria-hidden="true">/</span></li>
                <li><Link to="/blog" className="hover:text-[#FF6B00] transition-colors">Journal</Link></li>
                <li><span className="text-gray-300" aria-hidden="true">/</span></li>
                <li className="text-gray-600 truncate max-w-[180px] md:max-w-[400px]" aria-current="page">
                  {post.title}
                </li>
              </ol>
            </nav>

            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF6B00]/10 text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#FF6B00] font-bold border border-[#FF6B00]/20">
                  {post.category}
                </span>
              )}
              {post.readTime && (
                <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase tracking-wider">
                  {post.readTime}
                </span>
              )}
              <span className="text-[10px] md:text-xs font-mono text-gray-400 uppercase tracking-wider">
                {views > 0 && `${views} views`}
              </span>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8 md:mb-10 text-[#0A0A0A]"
            >
              {post.title}
            </motion.h1>

            {/* Author Meta */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center justify-between gap-4 py-5 mb-10 md:mb-14 border-t border-b border-black/5"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm border border-black/5 overflow-hidden shrink-0"
                  style={{ background: "linear-gradient(135deg, #E85D04 0%, #FF6B00 100%)" }}
                  aria-hidden="true"
                >
                  {post.authorName ? post.authorName.substring(0, 2).toUpperCase() : "JU"}
                </div>
                <div>
                  <p className="font-display font-semibold text-sm md:text-base text-[#121212] leading-none mb-1">
                    {post.authorName || "Jaimin Umaraniya"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-mono text-gray-400">
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                    {post.date && post.readTime && <span aria-hidden="true">Â·</span>}
                    {post.readTime && <span>{post.readTime}</span>}
                  </div>
                </div>
              </div>

              {/* Share links */}
              <div className="flex items-center gap-1">
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X (Twitter)"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#000000] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.766l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={linkedinShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#0A66C2] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <button
                  onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}
                  aria-label="Copy article link"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          {post.image && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-20"
            >
              <div className="w-full rounded-2xl md:rounded-[2rem] overflow-hidden border border-black/5 shadow-xl relative bg-gray-50 flex justify-center">
                <ProgressiveImage
                  src={post.image}
                  alt={post.title}
                  priority={true}
                  className="max-w-full h-auto object-contain mx-auto"
                />
              </div>
            </motion.div>
          )}

          {/* Article Body */}
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-8" ref={contentRef}>
            <div
              className={`
                prose prose-gray max-w-none transition-all duration-300
                ${textSize === "base" ? "prose-base" : textSize === "lg" ? "prose-lg" : "prose-xl"}
                prose-p:leading-[1.8] prose-p:text-[#1a1a1a] prose-p:font-normal prose-p:tracking-[-0.015em]
                prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0A0A0A] prose-headings:scroll-mt-24
                prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-black/5
                prose-h3:mt-12 prose-h3:mb-5
                prose-h4:mt-8 prose-h4:mb-4
                prose-a:text-[#FF6B00] prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                prose-strong:text-[#0A0A0A] prose-strong:font-bold
                prose-img:rounded-2xl md:prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:my-12 prose-img:max-w-full prose-img:h-auto prose-img:mx-auto
                prose-blockquote:border-l-[4px] prose-blockquote:border-[#FF6B00] prose-blockquote:bg-[#FFF8F5] prose-blockquote:py-5 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-[#3A3A3A] prose-blockquote:my-10 prose-blockquote:font-normal
                prose-ul:my-8 prose-ol:my-8 prose-li:my-2
                prose-table:text-sm prose-thead:bg-gray-50 prose-th:text-left prose-th:font-semibold
                prose-pre:p-0 prose-pre:bg-transparent prose-pre:shadow-none
                prose-code:text-[0.875em] prose-code:font-mono
              `}
            >
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code: CodeBlock,
                  table: ResponsiveTable,
                  img: ContentImage,
                }}
              >
                {post.content || ""}
              </Markdown>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-12 md:mt-16 pt-8 border-t border-black/5 flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-50 rounded-full text-xs font-mono text-gray-500 hover:bg-gray-100 hover:text-black transition-colors cursor-default border border-black/5"
                  >
                    #{formatTechName(tag)}
                  </span>
                ))}
              </div>
            )}

            {/* Blog FAQs â€” stored per-post in Firebase as [{ question, answer }] */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-16 md:mt-20 pt-12 border-t border-black/8">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-[#0A0A0A] mb-8 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <Accordion className="w-full">
                  {post.faqs.map((faq: any, i: number) => (
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

            {/* CTA Box */}
            <div className="mt-14 md:mt-20 bg-[#0A0A0A] text-white p-8 sm:p-12 md:p-14 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern-dark opacity-[0.05] pointer-events-none" />
              <div className="relative z-10 text-center max-w-md mx-auto">
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 tracking-tight">Have a project in mind?</h3>
                <p className="text-sm md:text-base text-white/60 mb-8 leading-relaxed">
                  Let's build something fast, scalable, and beautiful together.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#d04d00] text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            {/* Bottom Share Row */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 py-8 border-t border-black/5">
              <p className="text-sm font-mono text-gray-400">Found this helpful? Share it.</p>
              <div className="flex items-center gap-2">
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X (Twitter)"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-xs font-mono text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all"
                >
                  Share on X
                </a>
                <a
                  href={linkedinShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-xs font-mono text-gray-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section aria-labelledby="related-heading" className="bg-gray-50 border-t border-black/5 py-20 md:py-28">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center gap-3 mb-10 md:mb-14">
                <span className="w-8 h-px bg-black/20" aria-hidden="true" />
                <h2 id="related-heading" className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#0A0A0A]">
                  More from the Journal
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {relatedPosts.map((relatedPost: any, i: number) => (
                  <motion.article
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex flex-col"
                  >
                    <Link
                      to={`/blog/${relatedPost.slug || relatedPost.id}`}
                      className="block aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-gray-200 mb-5 relative"
                      aria-label={`Read: ${relatedPost.title}`}
                    >
                      {relatedPost.image ? (
                        <ProgressiveImage
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#111] flex items-center justify-center p-8 text-center">
                          <h3 className="text-white font-display font-bold text-xl">{relatedPost.title}</h3>
                        </div>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      {relatedPost.category && (
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF6B00] font-bold">
                          {relatedPost.category}
                        </span>
                      )}
                      {relatedPost.readTime && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" aria-hidden="true" />
                          <span className="text-[10px] font-mono text-gray-400">{relatedPost.readTime}</span>
                        </>
                      )}
                    </div>
                    <Link
                      to={`/blog/${relatedPost.slug || relatedPost.id}`}
                      className="block flex-1"
                    >
                      <h3 className="font-display font-bold text-lg md:text-xl leading-snug mb-2 text-[#0A0A0A] group-hover:text-[#FF6B00] transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {relatedPost.excerpt || relatedPost.seoDescription}
                      </p>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}
      </motion.main>
    </>
  );
}

