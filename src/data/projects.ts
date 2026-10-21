export const PROJECTS = [
  {
    id: "forma-ai",
    title: "Forma AI",
    subtitle: "AI Form Builder",
    category: "AI",
    description: "An intelligent form builder that transforms natural language into complex, validated forms in seconds using the Gemini API.",
    fullDescription: "Forma AI redefines the data collection process by integrating Large Language Models. Built for enterprise and small businesses, the platform eliminates the manual drag-and-drop workflow of traditional form builders. Users simply type what they need, and the AI generates a multi-step form with conditional logic, validations, and custom styling.",
    role: "Full Stack AI Engineer",
    timeline: "2024 (3 Months)",
    client: "Internal Product",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Gemini API", "Framer Motion"],
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    ],
    features: [
      "Natural Language to Form conversion using Gemini API.",
      "Real-time form preview with Framer Motion animations.",
      "Customizable design themes and branding.",
      "Advanced response analytics and exporting capabilities.",
      "Role-based access control with Supabase Auth."
    ],
    challenges: "The primary challenge was ensuring the LLM consistently output valid JSON schemas for forms, even when user prompts were vague. I implemented a multi-stage validation pipeline where the initial output is validated against Zod schemas, and fallback prompts correct errors automatically.",
    results: "Forma AI reduced form creation time by 85% compared to manual drag-and-drop builders. The MVP attracted 500+ active users in the first month.",
    links: {
      live: "https://forma.ai",
      github: "https://github.com/jaimin/forma-ai"
    }
  },
  {
    id: "resumecoach",
    title: "ResumeCoach",
    subtitle: "Platform",
    category: "AI",
    description: "An AI-driven resume review and career coaching platform tailored for software engineers and designers.",
    fullDescription: "ResumeCoach helps job seekers land their dream roles by providing instant, actionable feedback on their resumes. Utilizing the OpenAI API, it analyzes resumes against job descriptions, suggesting optimizations that pass ATS (Applicant Tracking Systems) and impress human recruiters.",
    role: "Lead Full Stack Developer",
    timeline: "2023 (4 Months)",
    client: "StartUp Client",
    techStack: ["React", "Express.js", "Node.js", "MongoDB", "Redux", "OpenAI API", "Stripe"],
    featuredImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop",
    gallery: [],
    features: [
      "PDF text extraction and NLP-based parsing.",
      "Match rate scoring against specific job descriptions.",
      "Action-verb suggestions and phrasing improvements.",
      "Integrated career coaching chat interface.",
      "Stripe subscriptions for premium insights."
    ],
    challenges: "Parsing unpredictable PDF structures accurately was a significant hurdle. I engineered a robust hybrid approach using pdf.js combined with heuristic text blocks recognition to ensure high fidelity text extraction before sending data to the AI.",
    results: "Users reported a 40% increase in interview requests. The platform scaled to support over 10,000 monthly resume analyses.",
    links: {
      live: "https://resumecoach.live",
      github: "https://github.com/jaimin/resumecoach"
    }
  },
  {
    id: "flashmind",
    title: "FlashMind",
    subtitle: "Study Tool",
    category: "EdTech",
    description: "A collaborative, spaced-repetition study tool designed for students preparing for medical and law exams.",
    fullDescription: "FlashMind brings collaboration to rote learning. Students can create, share, and review flashcards using an optimized spaced repetition algorithm (SM-2 variant). The platform includes real-time multiplayer 'study rooms' where peers can quiz each other.",
    role: "Frontend Engineer",
    timeline: "2023",
    client: "EdTech Venture",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "WebRTC"],
    featuredImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
    gallery: [],
    features: [
      "Custom Spaced Repetition System (SRS).",
      "Real-time shared study sessions via WebSockets.",
      "Offline-first mobile support with PWA capabilities.",
      "Markdown and MathJax support for complex formulas."
    ],
    challenges: "Managing real-time synchronization between users in a study room, especially with variable network speeds, required implementing an optimistic UI framework with robust conflict resolution algorithms on the Firebase backend.",
    results: "Grew to 5,000 daily active users with an average session time of 45 minutes.",
    links: {
      live: "https://flashmind.app"
    }
  },
  {
    id: "seo-hub",
    title: "SEO Hub Analyzer",
    subtitle: "Dashboard & Analysis Tool",
    category: "SaaS",
    description: "Comprehensive SEO audit tool that crawls websites and provides actionable technical SEO recommendations.",
    fullDescription: "SEO Hub Analyzer is a B2B SaaS tool designed for marketing agencies. It crawls client websites to uncover technical SEO issues (like broken links, missing meta tags, slow TTFB) and generates white-labeled PDF reports.",
    role: "Backend Architecture",
    timeline: "2022",
    client: "Marketing Agency",
    techStack: ["Node.js", "Python", "Redis", "PostgreSQL", "React", "Docker"],
    featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    gallery: [],
    features: [
      "Distributed web crawling with puppeteer for JS rendering.",
      "Queue management using Redis and BullMQ.",
      "Automated Lighthouse score generation.",
      "White-labeled PDF report generation.",
      "Historical tracking of SEO metrics."
    ],
    challenges: "Crawling large websites (10k+ pages) without getting blocked or crashing the server was the primary challenge. I implemented a distributed queue system with exponential backoff, user-agent pooling, and rate-limiting per domain.",
    results: "Reduced the agency's manual SEO audit time from 8 hours to 15 minutes per client.",
    links: {
      github: "https://github.com/jaimin/seo-hub"
    }
  }
];
