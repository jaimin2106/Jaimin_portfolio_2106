import { useEffect, lazy, Suspense } from "react";
import Hero from "../components/Hero";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { motion } from "motion/react";
import SEO from "../components/SEO";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

// Render immediately since it is often near the fold
import FeaturedProject from "../components/FeaturedProject";

// Lazy load below-the-fold components to reduce TBT
const Profile = lazy(() => import("../components/home/Profile"));
const Engineering = lazy(() => import("../components/home/Engineering"));
const TechStack = lazy(() => import("../components/home/TechStack"));
const Approach = lazy(() => import("../components/home/Approach"));
const Stats = lazy(() => import("../components/Stats"));
const CaseStudies = lazy(() => import("../components/CaseStudies"));
const Journal = lazy(() => import("../components/Journal"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const FAQ = lazy(() => import("../components/FAQ"));
const Contact = lazy(() => import("../components/Contact"));

export default function Home() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch projects
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.projects,
      queryFn: () => api.getProjects(),
      staleTime: STALE_TIMES.projects,
    });

    // Prefetch blogs
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.blogs,
      queryFn: () => api.getBlogs(),
      staleTime: STALE_TIMES.projects,
    });
  }, [queryClient]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEO 
        title="Jaimin Umaraniya | Full-Stack Developer & AI Engineer" 
        description="Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences."
        keywords={["Jaimin Umaraniya", "Jaimin Portfolio", "Portfolio Jaimin", "Jaimin Full Stack Developer", "Jaimin Software Engineer", "React Developer Portfolio", "Next.js Developer", "TypeScript Developer", "Frontend Developer India", "Full Stack Developer Ahmedabad", "Software Engineer Ahmedabad", "Firebase Developer", "AI Developer", "Modern Developer Portfolio", "React Portfolio", "Next.js Portfolio", "Web Developer Portfolio", "JavaScript Developer", "Software Engineer Portfolio", "Portfolio Website"]}
        schema={[
          {
            "@type": "WebPage",
            "@id": "https://jaiminumaraniya.me/#webpage",
            "url": "https://jaiminumaraniya.me",
            "name": "Jaimin Umaraniya | Full-Stack Developer & AI Engineer",
            "description": "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences.",
            "isPartOf": { "@id": "https://jaiminumaraniya.me/#website" },
            "about": { "@id": "https://jaiminumaraniya.me/#person" },
            "primaryImageOfPage": {
              "@type": "ImageObject",
              "url": "https://jaiminumaraniya.me/OG.jpg"
            }
          }
        ]}
      />

      
      
      {/* Above the fold - Render immediately */}
      <Hero />
      <ScrollReveal>
        <FeaturedProject />
      </ScrollReveal>
      
      {/* Below the fold - Lazy load to fix massive TBT */}
      <Suspense fallback={<div className="h-[200px] w-full flex items-center justify-center text-gray-400">Loading...</div>}>
        <ScrollReveal>
          <Profile />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Stats />
        </ScrollReveal>
        <ScrollReveal>
          <CaseStudies />
        </ScrollReveal>
        <ScrollReveal>
          <Engineering />
        </ScrollReveal>
        <ScrollReveal>
          <TechStack />
        </ScrollReveal>
        <ScrollReveal>
          <Approach />
        </ScrollReveal>
        <ScrollReveal>
          <Journal />
        </ScrollReveal>
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Contact />
        </ScrollReveal>
      </Suspense>
    </motion.main>

  );
}
