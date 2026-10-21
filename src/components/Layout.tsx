import { useEffect } from "react";
import Lenis from "lenis";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BackToTop from "./BackToTop";
import Footer from "./Footer";
import { useSettings } from "../contexts/SettingsContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Layout() {
  const { pathname } = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

    useEffect(() => {
    if (!settings.features.smoothScroll) return;

    let lenis: Lenis;
    let update: (time: number) => void;

    // Defer initialization to reduce Total Blocking Time (TBT)
    const timeoutId = setTimeout(() => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
      });
      
      lenis.on('scroll', ScrollTrigger.update);
      update = (time: number) => { lenis.raf(time * 1000); };
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0, 0);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (update) gsap.ticker.remove(update);
      if (lenis) lenis.destroy();
    };
  }, [settings.features.smoothScroll]);

  return (
    <div className="min-h-screen selection:bg-[#E85D04] selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}



