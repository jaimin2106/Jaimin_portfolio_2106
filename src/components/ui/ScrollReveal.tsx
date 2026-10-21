import { motion } from "motion/react";
import { ReactNode } from "react";
import { VARIANTS } from "../../lib/motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof VARIANTS;
  delay?: number;
}

export function ScrollReveal({ children, className = "", variant = "fadeInUp", delay = 0 }: ScrollRevealProps) {
  const selectedVariant = VARIANTS[variant];
  
  // If there's a delay, we clone the variant and inject the delay
  const finalVariant = delay > 0 ? {
    ...selectedVariant,
    visible: {
      ...selectedVariant.visible,
      transition: {
        ...(selectedVariant.visible as any).transition,
        delay
      }
    }
  } : selectedVariant;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={finalVariant}
    >
      {children}
    </motion.div>
  );
}
