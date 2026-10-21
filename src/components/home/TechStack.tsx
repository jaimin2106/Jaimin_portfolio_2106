import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const stack = [
  {
    category: "Frontend",
    color: "#E85D04",
    bg: "rgba(232,93,4,0.06)",
    border: "rgba(232,93,4,0.15)",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML & CSS"],
  },
  {
    category: "Backend & Data",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.06)",
    border: "rgba(99,102,241,0.15)",
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Firebase", "Supabase", "REST APIs"],
  },
  {
    category: "AI",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.15)",
    items: ["Generative AI", "LLM APIs", "AI Application Development", "AI Workflows"],
  },
  {
    category: "SEO & Performance",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.06)",
    border: "rgba(14,165,233,0.15)",
    items: ["Technical SEO", "JavaScript SEO", "Structured Data", "Core Web Vitals", "AI Search Optimization"],
  },
];

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineWidth = useTransform(scrollYProgress, [0, 0.45], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden">
      {/* Subtle warm background */}
      <div className="absolute inset-0 bg-white pointer-events-none" />
      <div
        className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-60"
        style={{ background: "radial-gradient(circle, rgba(232,93,4,0.05) 0%, transparent 70%)", transform: "translate(25%, -25%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Animated rule */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-14 md:mb-20"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E85D04] font-semibold whitespace-nowrap">
            Technology Stack
          </span>
          <div className="flex-1 h-px bg-black/[0.07] overflow-hidden rounded-full">
            <motion.div className="h-full bg-[#E85D04] rounded-full" style={{ width: lineWidth }} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-hero uppercase tracking-tight leading-[0.9] text-black mb-14 md:mb-20"
          style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
        >
          Tools &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85D04] to-[#FF9148]">Technologies.</span>
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
          {stack.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl sm:rounded-3xl p-6 sm:p-7 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: group.bg,
                borderColor: group.border,
              }}
            >
              {/* Category label */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} aria-hidden="true" />
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: group.color }}>
                  {group.category}
                </h3>
              </div>

              {/* Items */}
              <ul className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="flex-shrink-0 opacity-50">
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[#0A0A0A] text-[13px] sm:text-[14px] font-medium leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
