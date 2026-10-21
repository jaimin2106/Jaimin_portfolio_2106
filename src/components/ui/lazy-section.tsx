import { useRef, useEffect, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  height?: string;
  rootMargin?: string;
}

export function LazySection({ children, height = "400px", rootMargin = "200px" }: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin, // Load a bit before it comes into view
        threshold: 0.01,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? "auto" : height }}>
      {isVisible ? children : null}
    </div>
  );
}
