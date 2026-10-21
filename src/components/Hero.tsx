import { motion } from "motion/react";
import { VARIANTS } from "../lib/motion";
import CountUp from "./CountUp";
import { ArrowUpRight, Download, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";
import { ProgressiveImage } from "./ui/progressive-image";
import { HeroSkeleton } from "./ui/skeletons";
import { MagneticButton } from "./ui/magnetic-button";

export default function Hero({ previewData }: { previewData?: any }) {
  const { data: dbData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.hero,
    queryFn: async () => {
      const data = await api.getHeroData();
      if (data) return data;
      return {
        name: "JAIMIN UMARANIYA",
        headline: "Full-Stack Developer & AI Engineer",
        subtitle:
          "I build AI-powered web applications, scalable SaaS products, and high-performance digital experiences using React, Next.js, Node.js, and modern web architecture.",
        heroImage:
          "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=256&auto=format&fit=crop",
        experience: "2+ Years",
        location: "Hybrid",
        status: "Available",
        githubUrl: "https://github.com/jaimin2106",
        linkedinUrl: "https://linkedin.com/in/jaimin2106",
        resumeUrl: "",
      };
    },
    staleTime: STALE_TIMES.projects,
  });

  const heroData = previewData || dbData;

  if ((isLoading || !heroData) && !previewData) {
    return <HeroSkeleton />;
  }

  if (!heroData) return null;

  // Parse experience number for CountUp
  const experienceMatch = heroData?.experience?.match(/^(.*?)(\d+)(.*)$/);
  const expYears = experienceMatch ? Number(experienceMatch[2]) : 2;
  const expSuffix = experienceMatch ? experienceMatch[3] : "+ Years";

  // Two-tone headline
  const headlineWords = (heroData.headline || "").trim().split(/\s+/);
  const lastWord = headlineWords.length > 1 ? headlineWords[headlineWords.length - 1] : "";
  const firstPart = headlineWords.length > 1
    ? headlineWords.slice(0, -1).join(" ")
    : headlineWords[0];

  return (
    <section
      id="home"
      className="relative min-h-[100svh] w-full bg-[#F9F8F6] overflow-hidden flex items-center"
    >
      {/* Background glow */}
      <div
        className="absolute right-[-15%] top-[60%] -translate-y-1/2 w-[360px] h-[360px] md:right-[-8%] md:top-1/2 md:w-[680px] md:h-[680px] rounded-full pointer-events-none select-none"
        style={{ background: "radial-gradient(circle, rgba(232,93,4,0.09) 0%, rgba(255,140,66,0.05) 45%, transparent 72%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[540px] md:h-[540px] rounded-full border border-[#E85D04]/10 pointer-events-none select-none hidden md:block"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

          {/* ??????????????? LEFT COLUMN ??????????????? */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col items-center lg:items-start"
          >
            {/* 1. Avatar + status */}
            <motion.div
              variants={VARIANTS.fadeInUp}
              className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7"
            >
              <div className="w-[60px] h-[60px] sm:w-[74px] sm:h-[74px] rounded-full overflow-hidden border-[2.5px] border-white shadow-lg bg-gray-200 flex-shrink-0">
                {heroData.heroImage && (
                  <ProgressiveImage
                    src={heroData.heroImage}
                    alt={heroData.name || "Jaimin Umaraniya"}
                    priority={true}
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] text-green-600">
                    {heroData.status || "Available"}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gray-400 pl-[14px]">
                  Open to work
                </span>
              </div>
            </motion.div>

            {/* 2. Two-tone Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.08 }}
              className="font-display font-bold leading-[1.02] tracking-[-0.02em] mb-3 text-center lg:text-left"
              style={{ fontSize: "clamp(34px, 7.5vw, 68px)" }}
            >
              <span className="text-[#E85D04]">{firstPart}</span>
              {lastWord && (
                <>
                  <br />
                  <span className="text-[#0A0A0A]">{lastWord}</span>
                </>
              )}
            </motion.h1>

            {/* 3. Orange underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.22 }}
              className="w-12 h-[3px] bg-[#E85D04] rounded-full mb-4 sm:mb-5 origin-center lg:origin-left"
              aria-hidden="true"
            />

            {/* 4. Subtitle */}
            <motion.p
              variants={VARIANTS.fadeInUp}
              className="text-gray-500 leading-[1.75] mb-7 sm:mb-8 max-w-[420px] text-[13.5px] sm:text-[15px] text-center lg:text-left"
            >
              {heroData.subtitle}
            </motion.p>

            {/* 5. Stack label */}
            <motion.p
              variants={VARIANTS.fadeInUp}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-5 text-center lg:text-left"
            >
            </motion.p>

            {/* 6. CTA Buttons  Primary + Resume Download */}
            <motion.div
              variants={VARIANTS.fadeInUp}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-7 sm:mb-9 w-full sm:w-auto"
            >
              {/* Primary CTA */}
              <MagneticButton strength={0.25}>
                <Link
                  to="/#projects"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("case-study-list")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-white px-6 sm:px-7 py-[14px] rounded-full font-mono font-semibold text-[11px] sm:text-[12px] uppercase tracking-[0.14em] hover:bg-[#E85D04] transition-colors duration-300 whitespace-nowrap shadow-sm"
                >
                  Explore My Projects
                  <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                </Link>
              </MagneticButton>

              {/* Resume Download */}
              <MagneticButton strength={0.2}>
                <a
                  href={heroData.resumeUrl || "#"}
                  download={heroData.resumeUrl ? "Jaimin_Umaraniya_Resume.pdf" : undefined}
                  target={heroData.resumeUrl ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!heroData.resumeUrl) {
                      e.preventDefault();
                      toast.info("Resume will be available soon.");
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#0A0A0A] border border-black/10 px-6 sm:px-7 py-[14px] rounded-full font-mono font-semibold text-[11px] sm:text-[12px] uppercase tracking-[0.14em] hover:border-[#E85D04] hover:text-[#E85D04] transition-colors duration-300 whitespace-nowrap shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 flex-shrink-0" />
                  Download Resume
                </a>
              </MagneticButton>
            </motion.div>

            {/* 7. Social row */}
            <motion.div
              variants={VARIANTS.fadeInUp}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-gray-300 whitespace-nowrap select-none">
                Connect
              </span>
              <div className="w-5 h-px bg-gray-200" />
              <div className="w-px h-3.5 bg-gray-300 mx-0.5" aria-hidden="true" />
              {heroData.githubUrl && (
                <a href={heroData.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub profile"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-black hover:bg-black/5 transition-all duration-200">
                  <Github className="w-[18px] h-[18px]" />
                </a>
              )}
              {heroData.linkedinUrl && (
                <a href={heroData.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn profile"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/8 transition-all duration-200">
                  <Linkedin className="w-[18px] h-[18px]" />
                </a>
              )}
              <Link to="/contact" aria-label="Contact via email"
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-[#E85D04] hover:bg-[#E85D04]/8 transition-all duration-200">
                <Mail className="w-[18px] h-[18px]" />
              </Link>
            </motion.div>
          </motion.div>

          {/* ??????????????? RIGHT COLUMN ??????????????? */}
          <div className="relative flex flex-col items-center justify-center lg:justify-end lg:items-end w-full">
            {/* Large Display Name */}
            {heroData.name && (
              <motion.div
                variants={VARIANTS.fadeInUp}
                className="w-full max-w-full sm:max-w-[380px] lg:max-w-[360px] text-center mb-6 lg:mb-8 relative z-10"
              >
                <h2 className="font-hero text-[clamp(56px,11vw,96px)] leading-[0.85] tracking-tighter uppercase text-black drop-shadow-sm break-words">
                  {heroData.name}
                </h2>
              </motion.div>
            )}

            {/* Orange dot accent */}
            <motion.div
              variants={VARIANTS.scaleUp}
              className="absolute left-[12%] top-[18%] w-2.5 h-2.5 rounded-full bg-[#E85D04] shadow-[0_0_14px_rgba(232,93,4,0.45)] z-10 hidden lg:block"
              aria-hidden="true"
            />

            {/* Metric cards */}
            <motion.div
              variants={VARIANTS.fadeInUp}
              className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-full sm:max-w-[380px] lg:max-w-[360px]"
            >
              {/* Experience */}
              <div className="bg-white rounded-2xl sm:rounded-[20px] px-4 py-5 sm:px-5 sm:py-6 shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.04] text-center flex flex-col items-center justify-center hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
                <span className="font-display font-bold leading-none mb-2.5 flex items-baseline gap-0.5">
                  <CountUp from={0} to={expYears} duration={2} className="text-[30px] sm:text-[34px] text-[#0A0A0A]" />
                  <span className="text-[#E85D04] text-[22px] sm:text-[26px] font-bold">
                    {expSuffix.replace(/\d+/g, "").trim() || "+ Yrs"}
                  </span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 font-medium">Experience</span>
              </div>

              {/* Availability */}
              <div className="bg-white rounded-2xl sm:rounded-[20px] px-4 py-5 sm:px-5 sm:py-6 shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.04] text-center flex flex-col items-center justify-center hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
                <span className="font-display font-bold text-[30px] sm:text-[34px] text-[#0A0A0A] leading-none mb-2.5">
                  {heroData.status === "Available" ? "100%" : "0%"}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 font-medium">Availability</span>
              </div>

              {/* Location */}
              <div className="col-span-2 bg-white rounded-2xl sm:rounded-[20px] px-4 py-5 sm:px-5 sm:py-6 shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.04] text-center flex flex-col items-center justify-center hover:-translate-y-1.5 transition-transform duration-300 cursor-default">
                <span className="font-display font-bold text-[22px] sm:text-[26px] text-[#0A0A0A] leading-none mb-2.5 truncate max-w-full px-4">
                  {heroData.location || "Remote"}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 font-medium">Location</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial="hidden" animate="visible" variants={VARIANTS.fadeIn}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20 hidden md:flex"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray-400">Scroll</span>
        <motion.div
          animate={{ height: ["0%", "100%", "0%"], y: [0, 0, 14] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px bg-black/15"
          style={{ minHeight: "38px" }}
        />
      </motion.div>
    </section>
  );
}

