import SEO from "../components/SEO";
import { motion } from "motion/react";

export default function StyleGuide() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto"
    >
      <SEO title="Style Guide | Jaimin Umaraniya" description="Style guide and visual identity." />
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Style Guide</h1>
      
      <div className="space-y-16">
        <section>
          <h2 className="font-mono text-sm uppercase text-gray-500 mb-6">Typography</h2>
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Display (Space Grotesk)</p>
              <h1 className="font-display text-4xl font-bold">The quick brown fox jumps over the lazy dog</h1>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Body (Inter)</p>
              <p className="font-sans text-lg">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Mono (JetBrains Mono)</p>
              <p className="font-mono text-sm">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-sm uppercase text-gray-500 mb-6">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-black border border-black/10"></div>
              <p className="font-mono text-xs">Primary Black</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-white border border-black/10"></div>
              <p className="font-mono text-xs">Primary White</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-[#E85D04] border border-black/10"></div>
              <p className="font-mono text-xs">Accent Orange</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-gray-50 border border-black/10"></div>
              <p className="font-mono text-xs">Background Gray</p>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
