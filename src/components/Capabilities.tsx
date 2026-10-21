import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

function CapabilityCard({ card, idx }: { card: any, idx: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
      className="group bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-full bg-orange-50 text-[#E85D04] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {/* @ts-ignore */}
        {(() => {
           const Icon = LucideIcons[card.iconName || 'Code2'] || LucideIcons.Code2;
           return <Icon className="w-6 h-6" />;
        })()}
      </div>
      
      <h3 className="font-display text-xl sm:text-2xl font-semibold text-black mb-3">
        {card.title}
      </h3>
      
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        {card.desc}
      </p>

      <div className="flex flex-wrap gap-2">
        {card.tech?.split(',').slice(0, 3).map((t: string) => (
          <span key={t} className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-mono uppercase tracking-wider rounded-md font-medium">
            {t.trim()}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Capabilities() {
  const { data: cards = [], isLoading: loadingCards } = useQuery({
    queryKey: QUERY_KEYS.capabilities,
    queryFn: async () => {
      const q = query(collection(db, "capabilities"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return [
        {
          id: "1",
          title: "Full-Stack Web Development",
          iconName: "Code2",
          tech: "React, Next.js, Node.js, TypeScript",
          desc: "Modern web applications built with React, Next.js, TypeScript, Node.js, and scalable backend architectures."
        },
        {
          id: "2",
          title: "AI-Powered Applications",
          iconName: "Sparkles",
          tech: "LLMs, AI APIs, Workflows",
          desc: "AI features and intelligent workflows integrated into real products using modern APIs, LLMs, and application architecture."
        },
        {
          id: "3",
          title: "SaaS & Web Architecture",
          iconName: "Database",
          tech: "PostgreSQL, Supabase, Firebase",
          desc: "Scalable application architectures designed around maintainability, performance, data management, authentication, and reliable product workflows."
        },
        {
          id: "4",
          title: "Technical SEO & AI Search",
          iconName: "Search",
          tech: "Next.js, Schema, Performance",
          desc: "Technical SEO, JavaScript SEO, structured data, performance optimization, and AI search optimization for modern web applications."
        }
      ];
    },
    staleTime: STALE_TIMES.projects, // 30 mins
  });

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['public_capabilities_config'],
    queryFn: async () => {
      const docSnap = await getDoc(doc(db, "capabilities_config", "main"));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {
        title: "What I Build", subtitle: "Here's how I help businesses bring their ideas to life through robust engineering."
      };
    },
    staleTime: STALE_TIMES.projects, // 30 mins
  });

  const loading = loadingCards || loadingConfig;

  if (loading || !config) {
    return <section className="py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto h-[500px]"></section>;
  }

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 md:mb-20 border-b border-black/10 pb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#E85D04] p-3 md:p-3.5 rounded-xl text-white transform rotate-3 shadow-lg shadow-[#E85D04]/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black">{config.title || "What I Build"}</h2>
        </div>
        <p className="font-mono text-xs md:text-sm text-gray-500 max-w-sm leading-relaxed uppercase tracking-wider">
          {config.subtitle || "Here's how I help businesses bring their ideas to life through robust engineering."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {cards.map((card: any, idx: number) => (
           <CapabilityCard key={card.id || idx} card={card} idx={idx} />
        ))}
      </div>
    </section>
  );
}
