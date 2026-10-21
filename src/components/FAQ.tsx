import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

const defaultFaqs = [
  {
    q: "What is your primary technology stack?",
    a: "My core stack includes React, Next.js, and TypeScript on the frontend, with Node.js, Express, Firebase, and PostgreSQL (via Supabase) on the backend. I also frequently integrate AI models using the Gemini API and OpenAI API.",
  },
  {
    q: "What's your typical development process like?",
    a: "I follow an agile workflow starting with architecture planning, database schema design, and wireframing, followed by iterative development sprints with constant communication.",
  },
  {
    q: "How do you ensure performance and Core Web Vitals optimization?",
    a: "I prioritize Server-Side Rendering (SSR) and Static Site Generation (SSG) with Next.js, implement advanced caching strategies, optimize images (WebP/AVIF), split code bundles dynamically, and minimize main-thread blocking JavaScript to consistently hit 90+ Lighthouse scores.",
  },
  {
    q: "Do you build custom AI integrations?",
    a: "Yes! I specialize in building AI-powered features such as intelligent chatbots, automated content generation, Retrieval-Augmented Generation (RAG) pipelines, and semantic search utilizing modern LLMs.",
  },
  {
    q: "How long does a typical full-stack project take?",
    a: "Depending on scope, a minimum viable product (MVP) takes 4–6 weeks, while a comprehensive SaaS platform may take 3–4 months.",
  },
  {
    q: "Do you also offer UI/UX design or only development?",
    a: "While my primary expertise is engineering, I have a strong background in UI/UX design and often build projects end-to-end, ensuring a premium user experience with modern CSS frameworks and design systems.",
  },
  {
    q: "Can you rescue an existing codebase instead of starting from scratch?",
    a: "Yes, I frequently conduct code audits, refactor legacy React applications, migrate systems to modern architectures like Next.js, and resolve deep technical debt or performance bottlenecks.",
  },
  {
    q: "How do you handle application security and authentication?",
    a: "I implement secure, production-ready authentication flows using Firebase Auth, Supabase Auth, or NextAuth.js. I also ensure API routes are protected, data inputs are sanitized, and database rules are strictly configured.",
  },
  {
    q: "Are you available for freelance work or full-time roles?",
    a: "I am currently open to new opportunities, including long-term freelance contracts, consultancy, and senior full-stack engineering roles. Feel free to reach out via the contact form!",
  },
  {
    q: "How do you approach SEO in modern single-page applications?",
    a: "I leverage Next.js App Router for server-rendered metadata, implement dynamic Open Graph tags, generate structured JSON-LD schemas (like FAQPage, Article, SoftwareApplication), and ensure clean semantic HTML to maximize crawlability and indexing.",
  },
];

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  faqs?: FAQItem[];
  title?: string;
}

export default function FAQ({ faqs: propFaqs, title = "FAQ" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Use prop FAQs if provided (e.g., from a project), otherwise use defaults
  const faqs = propFaqs && propFaqs.length > 0 ? propFaqs : defaultFaqs;

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number, total: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % total;
      document.getElementById(`faq-btn-${next}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + total) % total;
      document.getElementById(`faq-btn-${prev}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById(`faq-btn-0`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`faq-btn-${total - 1}`)?.focus();
    }
  };

  // JSON-LD FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <section
      className="py-20 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto"
      aria-labelledby="faq-heading"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-20 gap-6 border-b border-black/10 pb-8 md:pb-10">
        <div className="flex items-center gap-4">
          <div
            className="bg-[#E85D04] p-3 md:p-3.5 rounded-xl text-white transform -rotate-3 shadow-lg shadow-[#E85D04]/20 shrink-0"
            aria-hidden="true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h2 id="faq-heading" className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black">
            {title}
          </h2>
        </div>
        <p className="font-mono text-xs md:text-sm text-gray-500 max-w-sm leading-relaxed uppercase tracking-wider">
          Answers to the most common questions about the engineering process.
        </p>
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-3 sm:gap-4" role="list">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const triggerId = `faq-btn-${idx}`;
          const panelId = `faq-panel-${idx}`;

          return (
            <div
              key={idx}
              role="listitem"
              className={`bg-white border rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm transition-all duration-300 ${
                isOpen
                  ? "border-[#E85D04]/30 shadow-md shadow-[#E85D04]/5"
                  : "border-black/5 hover:border-black/10 hover:shadow-md"
              }`}
            >
              {/* Trigger */}
              <button
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx, faqs.length)}
                className={`w-full flex items-start justify-between gap-4 p-6 sm:p-7 md:p-8 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D04] focus-visible:ring-inset rounded-[1.5rem] sm:rounded-[2rem] group min-h-[72px] ${
                  isOpen ? "bg-[#FFF8F5]" : "hover:bg-black/[0.015]"
                }`}
              >
                <span
                  className={`font-display font-medium text-base sm:text-lg md:text-xl leading-snug tracking-tight transition-colors duration-200 ${
                    isOpen ? "text-[#E85D04]" : "text-black group-hover:text-gray-700"
                  }`}
                >
                  {faq.q}
                </span>
                <span
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border shrink-0 mt-0.5 transition-all duration-300 ${
                    isOpen
                      ? "bg-[#E85D04] border-[#E85D04] text-white"
                      : "bg-transparent border-black/15 text-black group-hover:border-black/30"
                  }`}
                  aria-hidden="true"
                >
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {/* Panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 sm:px-7 md:px-8 pb-6 sm:pb-7 md:pb-8 pt-0 bg-[#FFF8F5]">
                      <div className="w-full h-px bg-[#E85D04]/15 mb-5 md:mb-6" />
                      <p className="text-gray-600 font-sans text-sm sm:text-base md:text-lg leading-[1.8] max-w-4xl">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
