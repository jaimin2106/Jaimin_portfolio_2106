import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

const DEFAULT_TESTIMONIALS: any[] = [];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { data: fetchedTestimonials } = useQuery({
    queryKey: QUERY_KEYS.testimonials,
    queryFn: () => api.getTestimonials(),
    staleTime: STALE_TIMES.projects,
  });

  const testimonials = (fetchedTestimonials && fetchedTestimonials.length > 0)
    ? fetchedTestimonials
    : DEFAULT_TESTIMONIALS;



  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Autoplay
  useEffect(() => {
    if (testimonials.length === 0 || isHovered) return;
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [handleNext, isHovered, testimonials.length]);

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-24 pb-8 gap-6 border-b border-black/10">
        <div className="flex items-center gap-4">
          <div className="bg-[#E85D04] p-3 md:p-3.5 rounded-xl text-white transform -rotate-3 shadow-lg shadow-[#E85D04]/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </div>
          <h2 className="font-hero text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-black">TESTIMONIALS</h2>
        </div>
        <p className="font-mono text-xs md:text-sm text-gray-500 max-w-sm leading-relaxed uppercase tracking-wider">
          Hear from those who've experienced the engineering expertise firsthand.
        </p>
      </div>

      {/* MOBILE LAYOUT: Swipeable Cards */}
      <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {testimonials.map((person, idx) => (
          <div key={idx} className="snap-center shrink-0 w-[85vw] sm:w-[60vw] flex flex-col p-6 sm:p-8 rounded-[2rem] bg-[#FAFAFA] border border-black/5 shadow-sm">
            <div className="flex items-center gap-1 mb-6">
              {[...Array(person.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#E85D04] text-[#E85D04]" />
              ))}
            </div>
            <p className="font-display text-xl sm:text-2xl leading-relaxed text-gray-900 tracking-tight mb-8">
              "{person.quote}"
            </p>
            <div className="mt-auto flex items-center gap-4 pt-6 border-t border-black/5">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-black/5 bg-gray-200">
                {person.img ? (
                  <img src={person.img || undefined} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                    {person.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h4 className="font-display font-medium text-base text-black">{person.name}</h4>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  <span className="text-[#E85D04]">{person.role}</span>
                  {person.company && <span className="mx-1 opacity-50">•</span>}
                  {person.company && <span>{person.company}</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP LAYOUT */}
      <div 
        className="hidden lg:flex flex-col lg:flex-row gap-12 lg:gap-24"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Col: Quote & Details */}
        <div className="flex-1 lg:w-2/3 flex flex-col justify-center min-h-[300px]">
          <div className="text-[#E85D04] font-hero text-[100px] leading-none opacity-20 mb-[-40px]">"</div>
          <AnimatePresence mode="wait">
             <motion.div
               key={currentIndex}
               initial={{ opacity: 0, x: -16 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 16 }}
               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
               className="flex flex-col gap-8"
             >
               <p className="font-display text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-gray-900 tracking-tight relative z-10">
                 {currentTestimonial.quote}
               </p>
               
               <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between border-t border-black/5 pt-8">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-full bg-gray-200 border border-black/10 shadow-sm overflow-hidden flex-shrink-0">
                     {currentTestimonial.img ? (
                       <img src={currentTestimonial.img || undefined} alt={currentTestimonial.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                         {currentTestimonial.name?.charAt(0)}
                       </div>
                     )}
                   </div>
                   <div className="flex flex-col">
                     <h4 className="font-display font-medium text-lg tracking-tight text-black">{currentTestimonial.name}</h4>
                     <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mt-1">
                       <span className="text-[#E85D04]">{currentTestimonial.role}</span>
                       {currentTestimonial.company && <span className="mx-2 opacity-50">•</span>}
                       {currentTestimonial.company && <span>{currentTestimonial.company}</span>}
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-1">
                   {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                     <Star key={i} className="w-4 h-4 fill-[#E85D04] text-[#E85D04]" />
                   ))}
                 </div>
               </div>
             </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Col: Navigation / Thumbnails */}
        <div className="lg:w-1/3 flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
            {testimonials.map((person, idx) => (
              <motion.div 
                key={person.id}
                onClick={() => setCurrentIndex(idx)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`aspect-[3/4] rounded-3xl p-2 border transition-all duration-500 cursor-pointer overflow-hidden relative group
                  ${currentIndex === idx 
                    ? 'border-[#E85D04] shadow-lg shadow-[#E85D04]/10 bg-white' 
                    : 'border-black/5 bg-gray-50 hover:bg-gray-100 hover:border-black/20 opacity-60 hover:opacity-100'}`}
              >
                <img src={person.img || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&auto=format&fit=crop"} alt={person.name} className={`w-full h-full object-cover rounded-[1.25rem] filter transition-all duration-700 ${currentIndex === idx ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} />
                {currentIndex === idx && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute inset-0 border-2 border-[#E85D04] rounded-3xl pointer-events-none"
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-4 items-end mt-auto pt-4">
             {/* Progress Bar */}
             <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden flex">
               {testimonials.map((_, idx) => (
                 <div key={idx} className="flex-1 h-full border-r border-white last:border-0 bg-transparent relative">
                    {currentIndex === idx && (
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "100%" }} 
                        transition={{ duration: isHovered ? 0 : 6, ease: "linear" }}
                        className="absolute left-0 top-0 bottom-0 bg-[#E85D04]" 
                      />
                    )}
                    {idx < currentIndex && <div className="absolute inset-0 bg-gray-300" />}
                 </div>
               ))}
             </div>
             
             {/* Nav Buttons */}
             <div className="flex items-center gap-3">
              <button 
                 onClick={handlePrev} 
                 aria-label="Previous Testimonial"
                 className="p-3 md:p-4 rounded-full border border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-300 text-gray-500 bg-white shadow-sm"
              >
                <ArrowLeft className="w-5 h-5"/>
              </button>
              <button 
                 onClick={handleNext} 
                 aria-label="Next Testimonial"
                 className="p-3 md:p-4 rounded-full border border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-300 text-gray-500 bg-white shadow-sm"
              >
                <ArrowRight className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

