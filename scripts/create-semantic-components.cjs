const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/home';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const profileCode = `import { motion } from "motion/react";

export default function Profile() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="font-hero text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-black mb-8 md:mb-12 text-center md:text-left">
          Building Products Across Code, AI & Search
        </h2>
        
        <div className="prose prose-lg md:prose-xl text-gray-600 space-y-6">
          <p>
            I'm Jaimin Umaraniya, a Full-Stack Developer focused on building modern web applications and AI-powered products.
          </p>
          <p>
            I work across the frontend, backend, data, and application architecture layers of web products, with hands-on experience in React, Next.js, Node.js, TypeScript, PostgreSQL, Supabase, Firebase, and AI integrations.
          </p>
          <p>
            Alongside application development, I focus on technical SEO, JavaScript SEO, performance, and AI search optimization so that the products I build are not only functional, but also discoverable, accessible, and efficient.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
`;

const engineeringCode = `import { motion } from "motion/react";
import { Code2, Server, Sparkles, LayoutTemplate, Search } from "lucide-react";

const capabilities = [
  {
    title: "Frontend Engineering",
    icon: Code2,
    desc: "React, Next.js, TypeScript, responsive interfaces, component architecture, accessibility, and performance optimization."
  },
  {
    title: "Backend Engineering",
    icon: Server,
    desc: "Node.js, APIs, authentication, database architecture, server-side logic, and application integrations."
  },
  {
    title: "AI Engineering",
    icon: Sparkles,
    desc: "AI-powered features, LLM integrations, intelligent workflows, and AI-assisted product experiences."
  },
  {
    title: "SaaS Architecture",
    icon: LayoutTemplate,
    desc: "Multi-user applications, data management, authentication, scalable application architecture, and maintainable product systems."
  },
  {
    title: "Technical SEO",
    icon: Search,
    desc: "Technical SEO, JavaScript SEO, structured data, crawlability, internal linking, Core Web Vitals, and AI search optimization."
  }
];

export default function Engineering() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-16 md:mb-20 border-b border-black/10 pb-8">
        <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black">
          Engineering Capabilities
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <motion.div 
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#E85D04] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-black mb-3">
                {cap.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {cap.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
`;

const techStackCode = `import { motion } from "motion/react";

const stack = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML", "CSS"]
  },
  {
    category: "Backend & Data",
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Firebase", "Supabase", "REST APIs"]
  },
  {
    category: "AI",
    items: ["Generative AI", "LLM APIs", "AI Application Development", "AI Workflows", "AI Integrations"]
  },
  {
    category: "SEO & Performance",
    items: ["Technical SEO", "JavaScript SEO", "AI SEO", "Structured Data", "Core Web Vitals", "Web Performance", "AI Search Optimization"]
  }
];

export default function TechStack() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto bg-white/50 rounded-[3rem] border border-black/5 my-10">
      <div className="mb-16 md:mb-20 text-center">
        <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black">
          Technology Stack
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-12">
        {stack.map((group, idx) => (
          <motion.div 
            key={group.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
            className="flex flex-col"
          >
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-black mb-6 border-b border-black/10 pb-4">
              {group.category}
            </h3>
            <ul className="flex flex-col gap-3">
              {group.items.map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E85D04]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
`;

const approachCode = `import { motion } from "motion/react";

export default function Approach() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="font-hero text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-black mb-8 md:mb-12 text-center md:text-left">
          How I Approach Engineering
        </h2>
        
        <div className="prose prose-lg md:prose-xl text-gray-600 space-y-6">
          <p>
            I don't treat development as simply writing code.
          </p>
          <p>
            I start by understanding the product, its users, its data, and the technical constraints. From there, I focus on clear architecture, maintainable components, efficient data access, performance, security, and long-term scalability.
          </p>
          <p>
            For public-facing applications, I also consider discoverability from the beginning: semantic HTML, crawlable navigation, technical SEO, structured data, performance, and how modern search and AI systems can understand the product.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
`;

fs.writeFileSync(path.join(dir, 'Profile.tsx'), profileCode);
fs.writeFileSync(path.join(dir, 'Engineering.tsx'), engineeringCode);
fs.writeFileSync(path.join(dir, 'TechStack.tsx'), techStackCode);
fs.writeFileSync(path.join(dir, 'Approach.tsx'), approachCode);

console.log("New semantic components created.");
