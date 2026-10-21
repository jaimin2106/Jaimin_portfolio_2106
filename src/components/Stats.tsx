import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import CountUp from "./CountUp";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";
import { StatsSkeleton } from "./ui/skeletons";


export default function Stats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const docSnap = await getDoc(doc(db, "stats", "main"));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {
        stat1Value: "40+",
        stat1Label: "Successful Projects",
        stat2Value: "99%",
        stat2Label: "System Uptime",
        stat3Value: "05+",
        stat3Label: "Years of Experience"
      };
    },
    staleTime: STALE_TIMES.projects, // 30 minutes caching for public data
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  } as any;

  // Helper to extract number and suffix for CountUp
  const renderStatValue = (value: string) => {
    const match = value.match(/^(\D*)(\d+)(\D*)$/);
    if (match) {
      return (
        <>
          {match[1]}
          <CountUp from={0} to={Number(match[2])} duration={2} />
          {match[3]}
        </>
      );
    }
    return value;
  };

  if (isLoading || !statsData) {
    return <StatsSkeleton />;
  }


  return (
    <section className="px-4 sm:px-6 pb-16 md:pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-16 border-b border-black/10 pb-6 md:pb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#E85D04] p-3 md:p-3.5 rounded-xl text-white transform -rotate-3 shadow-lg shadow-[#E85D04]/20">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black">STATS</h2>
        </div>
        <p className="font-mono text-xs md:text-sm text-gray-500 max-w-sm leading-relaxed uppercase tracking-wider">
          A quick look at the measurable impact behind the engineering journey.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        <motion.div variants={item} className="bg-white border border-black/5 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 w-full">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]" />
          <div className="relative z-10 flex flex-col h-full gap-6">
            <div className="flex justify-between items-start">
              <div />
              <div className="w-10 h-10 rounded-full bg-orange-50 text-[#E85D04] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
              </div>
            </div>
            <div>
              <h3 className="font-hero text-5xl sm:text-6xl mb-1 text-black leading-none">{renderStatValue(statsData.stat1Value)}</h3>
              <p className="font-display text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-[#E85D04] transition-colors duration-300">{statsData.stat1Label}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-[#111] text-white rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group shadow-md w-full">
          <div className="relative z-10 flex flex-col h-full gap-6">
            <div className="flex justify-between items-start">
              <div />
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
            <div className="transition-transform duration-300 group-hover:md:-translate-y-8">
              <h3 className="font-hero text-5xl sm:text-6xl mb-1 text-white leading-none">{renderStatValue(statsData.stat2Value)}</h3>
              <p className="font-display text-sm font-medium text-white/50 uppercase tracking-wide group-hover:text-white/80 transition-colors duration-300">{statsData.stat2Label}</p>
            </div>
          </div>
          
          <div className="hidden md:flex absolute bottom-6 left-6 right-6 items-center gap-3 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#E85D04] to-orange-500 p-[1px] shadow-sm">
               <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium tracking-wide text-white">Enterprise Grade</span>
              <p className="text-[10px] text-white/50 leading-tight font-mono">Robust architecture ensuring high availability.</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-[#FAFAFA] border border-black/5 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 w-full">
          <div className="relative z-10 flex flex-col h-full gap-6">
            <div className="flex justify-between items-start">
              <div />
              <div className="w-10 h-10 rounded-full bg-orange-50 text-[#E85D04] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div>
              <h3 className="font-hero text-5xl sm:text-6xl mb-1 text-[#E85D04] leading-none">{renderStatValue(statsData.stat3Value)}</h3>
              <p className="font-display text-sm font-medium text-gray-500 uppercase tracking-wide">{statsData.stat3Label}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

