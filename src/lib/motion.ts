import { Variants } from "motion/react";

// ==========================================
// EASINGS - Apple / Premium Vercel-like curves
// ==========================================
export const EASINGS = {
  // Ultra smooth, fast out, slow in (Perfect for general UI elements)
  smooth: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // Bouncy but elegant spring (Perfect for scale/hover)
  spring: { type: "spring", stiffness: 400, damping: 30, mass: 1 },
  // Linear-like precision for simple opacity fades
  linear: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

// ==========================================
// TRANSITIONS - Standardized Durations
// ==========================================
export const TRANSITIONS = {
  fast: { duration: 0.2, ease: EASINGS.smooth },
  normal: { duration: 0.4, ease: EASINGS.smooth },
  emphasis: { duration: 0.6, ease: EASINGS.smooth },
  slow: { duration: 0.8, ease: EASINGS.smooth },
};

// ==========================================
// VARIANTS - Standardized Animations
// ==========================================

export const VARIANTS = {
  // FADE IN UP (Standard scroll reveal)
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: TRANSITIONS.normal
    },
    exit: { opacity: 0, y: -20, transition: TRANSITIONS.fast }
  },

  // FADE IN (Simple opacity)
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: TRANSITIONS.normal
    },
    exit: { opacity: 0, transition: TRANSITIONS.fast }
  },

  // SCALE UP (Images, Cards)
  scaleUp: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: TRANSITIONS.emphasis
    }
  },

  // STAGGER CONTAINER (For grids and lists)
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }
};
