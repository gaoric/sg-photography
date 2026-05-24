import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let albumCoverContext: gsap.Context | undefined;

type WindowWithLenis = Window & {
  __siteLenis?: {
    scrollTo: (target: number, options?: { immediate?: boolean; force?: boolean }) => void;
  };
};

const resetAlbumScroll = () => {
  ScrollTrigger.clearScrollMemory("manual");
  (window as WindowWithLenis).__siteLenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
};

export const initAlbumCoverMotion = () => {
  albumCoverContext?.revert();
  albumCoverContext = undefined;

  if (prefersReducedMotion.matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  albumCoverContext = gsap.context(() => {
    const cover = document.querySelector<HTMLElement>("[data-album-cover]");
    const topPanel = document.querySelector<HTMLElement>("[data-album-cover-top]");
    const bottomPanel = document.querySelector<HTMLElement>("[data-album-cover-bottom]");
    const preview = document.querySelector<HTMLElement>("[data-album-cover-preview]");
    const albumGrid = document.querySelector<HTMLElement>("[data-album-grid]");

    if (!cover || !topPanel || !bottomPanel || !preview || !albumGrid) {
      return;
    }

    resetAlbumScroll();

    // Helper to toggle album grid visibility and interactivity based on scroll progress
    const setAlbumReady = (isReady: boolean) => {
      albumGrid.classList.toggle("is-revealed", isReady);
      albumGrid.toggleAttribute("inert", !isReady);
    };

    setAlbumReady(false);
    gsap.set(topPanel, { yPercent: 0 });
    gsap.set(bottomPanel, { yPercent: 0 });
    gsap.set(preview, { x: 0 });
    gsap.set(albumGrid, { x: "-100vw" });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: cover,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
          onEnterBack: () => setAlbumReady(false),
          onLeave: () => setAlbumReady(true),
          onUpdate: (self) => setAlbumReady(self.progress >= 0.985)
        }
      })
      .to(
        topPanel,
        {
          yPercent: -100,
          ease: "none",
          duration: 1
        },
        0
      )
      .to(
        bottomPanel,
        {
          yPercent: 100,
          ease: "none",
          duration: 1
        },
        0
      )
      .to(
        albumGrid,
        {
          x: 0,
          ease: "none",
          duration: 1
        },
        1
      )
      .to(
        preview,
        {
          x: () => window.innerWidth,
          ease: "none",
          duration: 1
        },
        1
      )
  });
};

document.addEventListener("astro:page-load", initAlbumCoverMotion);
document.addEventListener("astro:before-swap", () => {
  albumCoverContext?.revert();
  albumCoverContext = undefined;
  document.querySelector<HTMLElement>("[data-album-grid]")?.removeAttribute("inert");
});

initAlbumCoverMotion();
