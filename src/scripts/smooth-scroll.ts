import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SiteWindow = Window & {
  __siteLenis?: Lenis;
};

const siteWindow = window as SiteWindow;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lenisTicker: ((time: number) => void) | undefined;

gsap.registerPlugin(ScrollTrigger);

const createLenis = () => {
  if (siteWindow.__siteLenis || prefersReducedMotion.matches) {
    return;
  }

  const lenis = new Lenis({
    duration: 1,
    easing: (progress) => Math.min(1, 1.001 - 2 ** (-10 * progress)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
    anchors: {
      duration: 0.9
    }
  });

  siteWindow.__siteLenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);

  lenisTicker = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(lenisTicker);

  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();
};

const destroyLenis = () => {
  if (!siteWindow.__siteLenis) {
    return;
  }

  siteWindow.__siteLenis.destroy();
  siteWindow.__siteLenis = undefined;
  if (lenisTicker) {
    gsap.ticker.remove(lenisTicker);
    lenisTicker = undefined;
  }
  ScrollTrigger.refresh();
};

createLenis();

prefersReducedMotion.addEventListener("change", () => {
  if (prefersReducedMotion.matches) {
    destroyLenis();
    return;
  }

  createLenis();
});

document.addEventListener("astro:page-load", () => {
  createLenis();
  siteWindow.__siteLenis?.resize();
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
