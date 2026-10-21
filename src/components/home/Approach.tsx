import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const steps = [
  {
    index: "01",
    heading: "Understand First",
    body: "I start by understanding the product, its users, its data, and the technical constraints  before writing a single line of code.",
    accent: "#E85D04",
    accentLight: "rgba(232,93,4,0.12)",
  },
  {
    index: "02",
    heading: "Architect with Intent",
    body: "Clear architecture, maintainable components, efficient data access, performance, security, and long-term scalability  not afterthoughts, but foundations.",
    accent: "#6366F1",
    accentLight: "rgba(99,102,241,0.12)",
  },
  {
    index: "03",
    heading: "Build for Discoverability",
    body: "Semantic HTML, crawlable navigation, technical SEO, structured data, and performance wired in from day one so search engines and AI systems can fully understand the product.",
    accent: "#0EA5E9",
    accentLight: "rgba(14,165,233,0.12)",
  },
];

export default function Approach() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineWidth = useTransform(scrollYProgress, [0, 0.45], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 overflow-hidden bg-[#0A0A0A]">
      {/* Background glows */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,93,4,0.06) 0%, transparent 65%)", transform: "translate(-35%, -35%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)", transform: "translate(35%, 35%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Rule */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-16 md:mb-24"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E85D04] font-semibold whitespace-nowrap">Engineering Philosophy</span>
          <div className="flex-1 h-px bg-white/[0.06] overflow-hidden rounded-full">
            <motion.div className="h-full bg-[#E85D04]/50 rounded-full" style={{ width: lineWidth }} />
          </div>
        </motion.div>

        {/* Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-20 md:mb-28">
          <div className="lg:col-span-6">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-hero uppercase tracking-tight leading-[0.88] text-white"
              style={{ fontSize: "clamp(44px, 7vw, 80px)" }}
            >
              How I{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E85D04] to-[#FF9148]">
                Approach
              </span>{" "}
              <span className="text-white/20">Engineering.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-5 flex items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="text-white/35 text-[14px] sm:text-[15px] leading-[1.8] font-display italic border-l-2 border-[#E85D04]/30 pl-5"
            >
              I don't treat development as simply writing code. Engineering is a practice of understanding problems deeply before solving them.
            </motion.p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col divide-y divide-white/[0.06]">
          {steps.map((step, i) => (
            <motion.div
              key={step.index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="group grid grid-cols-[auto_1fr] sm:grid-cols-[80px_1fr_2fr] gap-x-6 sm:gap-x-10 gap-y-3 py-10 md:py-12 cursor-default"
            >
              {/* Number badge */}
              <div className="flex items-start pt-1">
                <span
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: step.accentLight, color: step.accent }}
                >
                  {step.index}
                </span>
              </div>

              {/* Mobile: heading + body in one column. Desktop: split into 2 columns */}
              <div className="sm:contents flex flex-col gap-2">
                {/* Heading */}
                <div className="sm:col-start-2">
                  <h3 className="font-display font-bold text-[18px] sm:text-[20px] md:text-[22px] text-white leading-snug group-hover:text-[#E85D04] transition-colors duration-300">
                    {step.heading}
                  </h3>
                  {/* Mobile underline */}
                  <div
                    className="mt-2 h-[2px] w-0 group-hover:w-8 transition-all duration-500 rounded-full sm:hidden"
                    style={{ backgroundColor: step.accent }}
                    aria-hidden="true"
                  />
                </div>

                {/* Body */}
                <div className="sm:col-start-3">
                  {/* Desktop: slide-in bar */}
                  <div
                    className="mb-3 h-[2px] w-0 group-hover:w-8 transition-all duration-500 rounded-full hidden sm:block"
                    style={{ backgroundColor: step.accent }}
                    aria-hidden="true"
                  />
                  <p className="text-white/40 text-[14px] sm:text-[15px] leading-[1.8] group-hover:text-white/60 transition-colors duration-300">
                    {step.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
