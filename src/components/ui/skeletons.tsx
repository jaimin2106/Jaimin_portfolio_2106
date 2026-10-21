/**
 * Enterprise Skeleton Loaders
 * 
 * Contextual skeletons that mirror the final layout for each section.
 * All skeletons use a CSS shimmer animation and respect prefers-reduced-motion.
 * GPU-accelerated via transform-based shimmer (no layout-triggering properties).
 */

function SkeletonBase({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-md bg-gray-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── Hero Skeleton ────────────────────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center pt-24 lg:pt-32 pb-16 lg:pb-24 w-full bg-[#FAFAFA]"
      aria-busy="true"
      aria-label="Loading hero section"
    >
      <div className="px-5 sm:px-8 max-w-[1440px] mx-auto w-full flex-1 flex flex-col justify-center items-center lg:items-stretch">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12 lg:gap-16 xl:gap-24 w-full">
          {/* Left column */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-[60%] gap-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-5">
              {/* Avatar circle */}
              <SkeletonBase className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full flex-shrink-0" />
              <div className="flex flex-col items-center lg:items-start gap-2">
                {/* Availability badge */}
                <SkeletonBase className="h-7 w-32 rounded-full" />
                {/* Label */}
                <SkeletonBase className="h-3 w-24 mt-2" />
              </div>
            </div>
            {/* Headline */}
            <div className="flex flex-col gap-3 w-full">
              <SkeletonBase className="h-10 w-[80%] max-w-md" />
              <SkeletonBase className="h-10 w-[60%] max-w-xs" />
            </div>
            {/* Large name */}
            <div className="flex flex-col gap-2 w-full mt-2">
              <SkeletonBase className="h-20 lg:h-36 w-full" />
            </div>
          </div>
          {/* Right column */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-[40%] max-w-[540px] gap-6">
            {/* Subtitle lines */}
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-[90%]" />
            <SkeletonBase className="h-4 w-[75%]" />
            {/* Stats */}
            <div className="flex gap-8 mt-4">
              <div className="flex flex-col gap-1.5">
                <SkeletonBase className="h-3 w-20" />
                <SkeletonBase className="h-5 w-16" />
              </div>
              <div className="flex flex-col gap-1.5">
                <SkeletonBase className="h-3 w-16" />
                <SkeletonBase className="h-5 w-20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <SkeletonBase className="h-3 w-18" />
                <SkeletonBase className="h-5 w-24" />
              </div>
            </div>
            {/* CTA buttons */}
            <div className="flex gap-4 mt-4 w-full">
              <SkeletonBase className="h-14 flex-1 rounded-full" />
              <SkeletonBase className="h-14 flex-1 rounded-full" />
            </div>
            {/* Social icons */}
            <div className="flex gap-4">
              <SkeletonBase className="w-12 h-12 rounded-full" />
              <SkeletonBase className="w-12 h-12 rounded-full" />
              <SkeletonBase className="w-12 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Project Skeleton ────────────────────────────────────────────────
export function FeaturedProjectSkeleton() {
  return (
    <section className="px-4 sm:px-6 pb-20 md:pb-32 max-w-[1400px] mx-auto" aria-busy="true">
      <div className="border border-black/5 rounded-[2rem] md:rounded-[3.5rem] p-5 sm:p-10 md:p-16 bg-[#FAFAFA]">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-end mb-10">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex gap-3">
              <SkeletonBase className="h-6 w-24 rounded-full" />
              <SkeletonBase className="h-6 w-28 rounded-full" />
            </div>
            <SkeletonBase className="h-16 w-[80%]" />
            <SkeletonBase className="h-16 w-[60%]" />
            <SkeletonBase className="h-4 w-full max-w-lg mt-2" />
            <SkeletonBase className="h-4 w-[80%] max-w-md" />
          </div>
          <div className="flex gap-3 shrink-0">
            <SkeletonBase className="h-12 w-36 rounded-full" />
            <SkeletonBase className="h-12 w-28 rounded-full" />
          </div>
        </div>
        {/* Image area */}
        <SkeletonBase className="w-full aspect-[21/9] rounded-[2rem] md:rounded-[3rem]" />
      </div>
    </section>
  );
}

// ─── Stats Skeleton ───────────────────────────────────────────────────────────
export function StatsSkeleton() {
  return (
    <section className="px-4 sm:px-6 pb-16 md:pb-24 max-w-7xl mx-auto" aria-busy="true">
      {/* Section header */}
      <div className="flex items-center justify-between mb-10 border-b border-black/10 pb-6">
        <div className="flex items-center gap-4">
          <SkeletonBase className="w-12 h-12 rounded-xl" />
          <SkeletonBase className="h-12 w-32" />
        </div>
        <SkeletonBase className="h-4 w-48" />
      </div>
      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-black/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6 bg-white">
            <div className="flex justify-end">
              <SkeletonBase className="w-10 h-10 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <SkeletonBase className={`h-14 w-28 ${i === 1 ? 'bg-gray-700/20' : ''}`} />
              <SkeletonBase className="h-4 w-36" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Blog Card Skeleton ───────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col group" aria-hidden="true">
      <SkeletonBase className="w-full aspect-video rounded-[1.5rem] md:rounded-[2rem] mb-4 md:mb-6" />
      <div className="flex justify-between mb-3">
        <SkeletonBase className="h-3 w-24" />
        <SkeletonBase className="h-3 w-16" />
      </div>
      <SkeletonBase className="h-6 w-full mb-2" />
      <SkeletonBase className="h-6 w-[80%] mb-3" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-[70%] mt-1" />
    </div>
  );
}

// ─── Blog Grid Skeleton (featured + 3 cards) ──────────────────────────────────
export function BlogGridSkeleton() {
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 max-w-7xl mx-auto" aria-busy="true">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="flex flex-col gap-4">
          <SkeletonBase className="h-20 md:h-28 w-48 md:w-64" />
          <SkeletonBase className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <SkeletonBase className="h-8 w-12 rounded-full" />
          <SkeletonBase className="h-8 w-20 rounded-full" />
          <SkeletonBase className="h-8 w-24 rounded-full" />
        </div>
      </div>
      {/* Featured post */}
      <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <SkeletonBase className="aspect-video lg:aspect-square rounded-[1.5rem] md:rounded-[2.5rem]" />
        <div className="flex flex-col gap-4 px-2">
          <div className="flex gap-2">
            <SkeletonBase className="h-5 w-16 rounded-full" />
            <SkeletonBase className="h-5 w-24" />
          </div>
          <SkeletonBase className="h-10 w-full" />
          <SkeletonBase className="h-10 w-[80%]" />
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-[90%]" />
          <SkeletonBase className="h-4 w-[75%]" />
          <SkeletonBase className="h-5 w-28 mt-2" />
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {[0, 1, 2].map((i) => <BlogCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ─── Project Card Skeleton ────────────────────────────────────────────────────
export function ProjectRowSkeleton() {
  return (
    <div className="border-b border-white/10 py-10 md:py-14 flex flex-col lg:flex-row lg:items-center justify-between gap-8" aria-hidden="true">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-3">
          <SkeletonBase className="h-4 w-20 bg-white/20" />
          <SkeletonBase className="h-4 w-12 bg-white/20" />
          <SkeletonBase className="h-4 w-28 bg-white/20" />
        </div>
        <SkeletonBase className="h-16 w-full max-w-lg bg-white/20" />
        <SkeletonBase className="h-4 w-[60%] bg-white/20" />
        <div className="flex gap-2 mt-2">
          <SkeletonBase className="h-6 w-16 rounded-full bg-white/20" />
          <SkeletonBase className="h-6 w-20 rounded-full bg-white/20" />
          <SkeletonBase className="h-6 w-14 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="flex flex-col gap-3 shrink-0">
        <SkeletonBase className="h-11 w-40 rounded-full bg-white/20" />
        <SkeletonBase className="h-11 w-28 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// ─── Testimonial Skeleton ─────────────────────────────────────────────────────
export function TestimonialSkeleton() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto" aria-busy="true">
      <div className="flex items-center justify-between mb-12 md:mb-24 pb-8 border-b border-black/10">
        <div className="flex items-center gap-4">
          <SkeletonBase className="w-12 h-12 rounded-xl" />
          <SkeletonBase className="h-12 w-48" />
        </div>
        <SkeletonBase className="h-4 w-48 hidden md:block" />
      </div>
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        <div className="flex-1 flex flex-col gap-8">
          <SkeletonBase className="h-8 w-8 rounded-sm opacity-20" />
          <SkeletonBase className="h-6 w-full" />
          <SkeletonBase className="h-6 w-[90%]" />
          <SkeletonBase className="h-6 w-[75%]" />
          <div className="border-t border-black/5 pt-8 flex gap-4 items-center">
            <SkeletonBase className="w-14 h-14 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-2">
              <SkeletonBase className="h-5 w-32" />
              <SkeletonBase className="h-3 w-40" />
            </div>
          </div>
        </div>
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[0,1,2].map((i) => (
              <SkeletonBase key={i} className="aspect-[3/4] rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Blog Detail Skeleton ─────────────────────────────────────────────────────
export function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen pt-24" aria-busy="true">
      <SkeletonBase className="w-full h-[50vh] md:h-[60vh]" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-5">
        <div className="flex gap-2 mb-2">
          <SkeletonBase className="h-5 w-20 rounded-full" />
          <SkeletonBase className="h-5 w-24" />
        </div>
        <SkeletonBase className="h-12 w-full" />
        <SkeletonBase className="h-12 w-[85%]" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-[90%]" />
        <SkeletonBase className="h-4 w-[80%]" />
        <SkeletonBase className="h-64 w-full rounded-xl mt-4" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-[95%]" />
        <SkeletonBase className="h-4 w-[70%]" />
      </div>
    </div>
  );
}

// ─── Project Detail Skeleton ──────────────────────────────────────────────────
export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen pt-24" aria-busy="true">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-3 mb-6">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-6 w-32 rounded-full" />
        </div>
        <SkeletonBase className="h-16 w-full max-w-2xl mb-4" />
        <SkeletonBase className="h-4 w-full max-w-xl mb-8" />
        <SkeletonBase className="w-full aspect-[16/9] rounded-[2rem] mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-[90%]" />
            <SkeletonBase className="h-4 w-[80%]" />
            <SkeletonBase className="h-48 w-full rounded-xl mt-4" />
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-[85%]" />
          </div>
          <div className="flex flex-col gap-4">
            <SkeletonBase className="h-6 w-24 mb-2" />
            {[0,1,2,3].map(i => (
              <div key={i} className="flex flex-col gap-1">
                <SkeletonBase className="h-3 w-20" />
                <SkeletonBase className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Layout Skeleton (for route-level Suspense) ─────────────────────────
export function PageSkeleton() {
  return (
    <div className="w-full min-h-[80vh] pt-24 md:pt-32 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8" aria-busy="true" aria-label="Loading page">
      <div className="flex flex-col gap-4">
        <SkeletonBase className="h-12 w-64" />
        <SkeletonBase className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="flex flex-col gap-3">
            <SkeletonBase className="aspect-video rounded-2xl" />
            <SkeletonBase className="h-5 w-full" />
            <SkeletonBase className="h-4 w-[80%]" />
          </div>
        ))}
      </div>
    </div>
  );
}
