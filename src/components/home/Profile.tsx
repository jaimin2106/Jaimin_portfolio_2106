import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const technologies = [
  "React", "Next.js", "Node.js", "TypeScript",
  "PostgreSQL", "Supabase", "Firebase", "AI Integrations",
];

export default function Profile() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineWidth = useTransform(scrollYProgress, [0, 0.45], ["0%", "100%"]);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden bg-[#F9F8F6]">
      {/* Subtle bloom */}
      <div
        className="absolute left-0 bottom-0 w-[480px] h-[480px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(232,93,4,0.07) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Animated rule */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-16 md:mb-24"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E85D04] font-semibold whitespace-nowrap">Profile & Vision</span>
          <div className="flex-1 h-px bg-black/[0.08] overflow-hidden rounded-full">
            <motion.div className="h-full bg-[#E85D04] rounded-full" style={{ width: lineWidth }} />
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT: Large typographic heading */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="lg:sticky lg:top-28"
            >
              <h2 className="font-hero uppercase tracking-tight leading-[0.88]"
                style={{ fontSize: "clamp(48px, 7.5vw, 88px)" }}
              >
                                <span className="block text-black">Building</span>
                <span className="block text-black/20">Code,</span>
                <span className="block" style={{ WebkitTextStroke: "1.5px #E85D04", color: "transparent" }}>AI</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E85D04] to-[#FF9148]">&amp; Search.</span>
              </h2>
            </motion.div>
          </div>

          {/* RIGHT: Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-7 flex flex-col gap-0 lg:pt-6"
          >
            {/* P1 — Identity */}
            <motion.p variants={fadeUp}
              className="font-display font-semibold text-[22px] sm:text-[26px] md:text-[28px] leading-[1.35] text-[#0A0A0A] pb-10 md:pb-12"
            >
              I'm Jaimin Umaraniya, a Full-Stack Developer focused on building modern web applications and AI-powered products.
            </motion.p>

            <motion.div variants={fadeUp} className="w-full h-px bg-black/[0.06]" />

            {/* P2 — Stack */}
            <motion.div variants={fadeUp} className="py-10 md:py-12 space-y-7">
              <p className="text-gray-500 text-[15px] sm:text-[16px] leading-[1.8]">
                I work across the frontend, backend, data, and application architecture layers of web products, focusing on robust foundations and seamless user experiences.
              </p>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, i) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.3, ease: "easeOut" }}
                    className="px-3.5 py-1.5 bg-white border border-black/[0.08] text-[#0A0A0A] text-[11px] font-mono uppercase tracking-[0.12em] rounded-full shadow-sm hover:border-[#E85D04] hover:text-[#E85D04] transition-colors duration-200 cursor-default select-none"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="w-full h-px bg-black/[0.06]" />

            {/* P3 — SEO */}
            <motion.p variants={fadeUp}
              className="text-gray-500 text-[15px] sm:text-[16px] leading-[1.8] pt-10 md:pt-12"
            >
              Alongside application development, I focus heavily on{" "}
              <strong className="text-[#0A0A0A] font-semibold">technical SEO, JavaScript SEO, performance, and AI search optimization</strong>.
              {" "}This ensures the products I build are not only highly functional, but also universally discoverable, accessible, and deeply integrated with modern search engines.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


