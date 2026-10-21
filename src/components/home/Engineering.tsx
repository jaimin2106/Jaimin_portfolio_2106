import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";

/* --- SVG Icons --- */
const Icons = {
  frontend: () => (
    <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
      <rect x="4" y="10" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M16 22l-5 5 5 5M32 22l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 34l6-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  backend: () => (
    <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
      <rect x="6" y="7" width="36" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="23" width="36" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="13" cy="12.5" r="2" fill="currentColor" />
      <circle cx="13" cy="28.5" r="2" fill="currentColor" />
      <path d="M19 12.5h14M19 28.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 38h24M18 38v-4M30 38v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ai: () => (
    <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M24 6v6M24 36v6M6 24h6M36 24h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11.51 11.51l4.24 4.24M32.25 32.25l4.24 4.24M36.49 11.51l-4.24 4.24M15.75 32.25l-4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
    </svg>
  ),
  saas: () => (
    <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
      <path d="M24 7L7 16v16l17 9 17-9V16L24 7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 16l17 9m0 0l17-9m-17 9v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  seo: () => (
    <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
      <circle cx="21" cy="21" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M29 29l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 15v6l4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 28s2-3 6-3 6 3 6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

/* --- Cap data --- */
const caps = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    headline: "Interfaces built to perform & impress.",
    desc: "Pixel-perfect UIs with React & Next.js. Component architecture, accessibility, responsive design, and web performance optimization.",
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    Icon: Icons.frontend,
    accent: "#E85D04",
    accentAlpha: "rgba(232,93,4,0.10)",
    bg: "#FFFFFF",
    dark: false,
    layout: "wide",
  },
  {
    id: "ai",
    title: "AI Engineering",
    headline: "Intelligent features. Real products.",
    desc: "LLM integrations, generative AI workflows, and AI-assisted product experiences built into production applications.",
    tags: ["LLMs", "AI APIs", "Generative AI"],
    Icon: Icons.ai,
    accent: "#A855F7",
    accentAlpha: "rgba(168,85,247,0.15)",
    bg: "#0A0A0A",
    dark: true,
    layout: "tall",
  },
  {
    id: "backend",
    title: "Backend Engineering",
    headline: "Scalable APIs & data layers.",
    desc: "Node.js APIs, authentication, database architecture, and cloud integrations that power complex SaaS products.",
    tags: ["Node.js", "PostgreSQL", "Supabase", "Firebase"],
    Icon: Icons.backend,
    accent: "#6366F1",
    accentAlpha: "rgba(99,102,241,0.10)",
    bg: "#F9F8F6",
    dark: false,
    layout: "normal",
  },
  {
    id: "saas",
    title: "SaaS Architecture",
    headline: "Built to scale from day one.",
    desc: "Multi-tenant apps, role-based auth, scalable data models, and maintainable product systems for long-term growth.",
    tags: ["Multi-tenant", "Auth", "Scalable APIs"],
    Icon: Icons.saas,
    accent: "#0EA5E9",
    accentAlpha: "rgba(14,165,233,0.10)",
    bg: "#FFFFFF",
    dark: false,
    layout: "normal",
  },
  {
    id: "seo",
    title: "Technical SEO & AI Search",
    headline: "Discoverable by humans, engines & AI.",
    desc: "Semantic HTML, structured data (JSON-LD), JavaScript SEO, Core Web Vitals, crawlability, and AI search optimization engineered from the foundation, not added as an afterthought.",
    tags: ["Technical SEO", "Structured Data", "Core Web Vitals", "AI SEO", "JS SEO"],
    Icon: Icons.seo,
    accent: "#E85D04",
    accentAlpha: "rgba(232,93,4,0.08)",
    bg: "#F9F8F6",
    dark: false,
    layout: "wide",
  },
] as const;

type Cap = typeof caps[number];

/* -------------------------------------------------
   BentoCard
   - Desktop: fullHeight=true ? fills the grid cell
   - Mobile:  fullHeight=false ? fixed 300px height
------------------------------------------------- */
function BentoCard({
  cap,
  index,
  fullHeight = false,
}: {
  cap: Cap;
  index: number;
  fullHeight?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = cap.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "relative rounded-2xl p-5 sm:p-6 overflow-hidden",
        "flex flex-col",
        "transition-transform duration-300 ease-out cursor-default select-none",
        "hover:-translate-y-0.5",
        /* KEY FIX: fixed height on mobile via inline style,
           full height on desktop via CSS */
        fullHeight ? "h-full" : "",
      ].join(" ")}
      style={{
        background: cap.bg,
        border: `1px solid ${cap.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? `0 12px 40px ${cap.accent}22, 0 2px 8px rgba(0,0,0,0.06)`
          : "0 1px 8px rgba(0,0,0,0.05)",
        /* fixed height only in carousel context via parent */
      }}
    >
      {/* Ghost watermark */}
      <div
        className="absolute -right-3 -bottom-3 w-20 h-20 pointer-events-none"
        style={{
          color: cap.accent,
          opacity: hovered ? 0.07 : 0.03,
          transition: "opacity 0.35s ease",
        }}
        aria-hidden="true"
      >
        <Icon />
      </div>

      {/* Hover glow */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${cap.accent}14 0%, transparent 70%)`,
              transform: "translate(25%,-25%)",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* -- CONTENT � always flex-col so tags stay at bottom -- */}
      <div className="relative z-10 flex flex-col h-full gap-3">
        {/* Icon */}
        <motion.div
          animate={{ scale: hovered ? 1.07 : 1, rotate: hovered ? 2 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cap.accentAlpha, color: cap.accent }}
        >
          <div className="w-5 h-5"><Icon /></div>
        </motion.div>

        {/* Title + headline */}
        <div className="flex-shrink-0">
          <h3
            className={`font-display font-bold text-[15px] sm:text-[16px] leading-snug ${cap.dark ? "text-white" : "text-[#0A0A0A]"
              }`}
          >
            {cap.title}
          </h3>
          <p
            className="font-mono text-[9px] uppercase tracking-[0.15em] font-semibold mt-0.5"
            style={{ color: cap.accent }}
          >
            {cap.headline}
          </p>
        </div>

        {/* Description � grows to fill remaining space */}
        <p
          className={`text-[12px] sm:text-[13px] leading-[1.7] flex-1 ${cap.dark ? "text-white/40" : "text-gray-500"
            }`}
        >
          {cap.desc}
        </p>

        {/* Tags � always anchored at bottom */}
        <div className="flex flex-wrap gap-1.5 flex-shrink-0">
          {cap.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-[0.1em] font-bold"
              style={
                cap.dark
                  ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }
                  : {
                    background: `${cap.accent}10`,
                    color: cap.accent,
                    border: `1px solid ${cap.accent}25`,
                  }
              }
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------
   Mobile Carousel � industry-standard implementation
   ? Fixed card width (80vw, max 300px)
   ? Fixed card height (320px) ? uniform rows
   ? scroll-snap-type: x mandatory
   ? scroll-snap-align: start
   ? scroll-padding-left matches px offset
   ? Dot indicator tracks via IntersectionObserver
   ? Sentinel div is NOT counted in dots
------------------------------------------------- */
const CARD_W = 288;   // px � fixed card width
const CARD_H = 320;   // px � fixed card height  
const CARD_GAP = 12;  // px � gap between cards
const PEEK = 20;      // px � left padding so first card doesn't flush edge

function MobileCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* IntersectionObserver-based active card tracking */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const cardEls = Array.from(scroller.querySelectorAll("[data-card]")) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number((entry.target as HTMLElement).dataset.card);
            setActive(idx);
          }
        });
      },
      { root: scroller, threshold: 0.5 }
    );

    cardEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((i: number) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: i * (CARD_W + CARD_GAP),
      behavior: "smooth",
    });
  }, []);

  return (
    <div>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto snap-x snap-mandatory flex"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          gap: `${CARD_GAP}px`,
          paddingLeft: `${PEEK}px`,
          paddingRight: `${PEEK}px`,
          paddingBottom: "8px",
          scrollPaddingLeft: `${PEEK}px`,
          height: `${CARD_H + 8}px`,
          alignItems: "stretch",
        } as React.CSSProperties}
      >
        {caps.map((cap, i) => (
          <div
            key={cap.id}
            data-card={i}
            className="snap-start flex-shrink-0"
            style={{
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
            }}
          >
            {/* BentoCard fills the fixed wrapper ? uniform height */}
            <div className="w-full h-full">
              <BentoCard cap={cap} index={i} fullHeight />
            </div>
          </div>
        ))}
      </div>

      {/* Pill dots */}
      <div className="flex items-center justify-center gap-2 mt-4" role="tablist" aria-label="Capabilities">
        {caps.map((cap, i) => (
          <button
            key={cap.id}
            role="tab"
            aria-selected={active === i}
            aria-label={cap.title}
            onClick={() => scrollTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: active === i ? "24px" : "6px",
              height: "6px",
              background: active === i ? "#E85D04" : "rgba(0,0,0,0.15)",
              outline: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* --- Desktop Bento Grid --- */
function DesktopGrid() {
  return (
    <div className="grid grid-cols-3 gap-4" style={{ gridAutoRows: "auto" }}>
      {/* Row 1 */}
      <div className="col-span-2 min-h-[220px]">
        <BentoCard cap={caps[0]} index={0} fullHeight />
      </div>
      <div className="col-span-1 row-span-2">
        <BentoCard cap={caps[1]} index={1} fullHeight />
      </div>
      {/* Row 2 */}
      <div className="col-span-1 min-h-[200px]">
        <BentoCard cap={caps[2]} index={2} fullHeight />
      </div>
      <div className="col-span-1 min-h-[200px]">
        <BentoCard cap={caps[3]} index={3} fullHeight />
      </div>
      {/* Row 3 */}
      <div className="col-span-3 min-h-[160px]">
        <BentoCard cap={caps[4]} index={4} fullHeight />
      </div>
    </div>
  );
}

/* --- Section --- */
export default function Engineering() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineWidth = useTransform(scrollYProgress, [0, 0.4], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden bg-[#F9F8F6]">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,93,4,0.06) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-5"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E85D04] font-semibold">
                  Engineering Capabilities
                </span>
                <div className="w-24 h-px bg-black/[0.08] overflow-hidden rounded-full">
                  <motion.div className="h-full bg-[#E85D04] rounded-full" style={{ width: lineWidth }} />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="font-hero uppercase tracking-tight leading-[0.88] text-black"
                style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
              >
                Five disciplines.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85D04] to-[#FF9148]">
                  One cohesive craft.
                </span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 max-w-[200px] leading-relaxed sm:text-right hidden sm:block"
            >
              From code to<br />deployment to<br />discoverability.
            </motion.p>
          </div>
        </div>

        {/* -- Mobile carousel (edge-to-edge scroll, left-padded) -- */}
        <div className="block md:hidden">
          <MobileCarousel />
        </div>

        {/* -- Desktop bento grid -- */}
        <div className="hidden md:block px-5 sm:px-8 lg:px-12">
          <DesktopGrid />
        </div>
      </div>
    </section>
  );
}
