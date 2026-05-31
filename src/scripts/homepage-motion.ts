import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Respect the user's OS accessibility setting by skipping the JS-driven
// animations entirely when reduced motion is preferred.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let homepageContext: gsap.Context | undefined;

export const initHomepageMotion = () => {
  homepageContext?.revert();
  homepageContext = undefined;

  if (prefersReducedMotion.matches) {
    return;
  }

  // ScrollTrigger is a GSAP plugin that lets a timeline advance based on scroll
  // position instead of time alone.
  gsap.registerPlugin(ScrollTrigger);

  homepageContext = gsap.context(() => {
    const heroScroll = document.querySelector<HTMLElement>("[data-hero-scroll]");
    const heroStage = document.querySelector<HTMLElement>("[data-hero-stage]");
    const heroFrame = document.querySelector<HTMLElement>("[data-hero-frame]");
    const heroImage = heroFrame?.querySelector<HTMLElement>("img");
    const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const heroCopyTop = document.querySelector<HTMLElement>("[data-hero-copy-top]");
    const heroTitleTop = document.querySelector<HTMLElement>("[data-hero-title-top]");
    const heroTitleBottom = document.querySelector<HTMLElement>("[data-hero-title-bottom]");
    const heroCopyBottom = document.querySelector<HTMLElement>("[data-hero-copy-bottom]");
    const introductionCopy = document.querySelector<HTMLElement>("[data-introduction-copy]");
    const introWordTracks = gsap.utils.toArray<HTMLElement>("[data-intro-word-track]");

    // These helpers give GSAP responsive dimensions. Passing the functions into
    // GSAP means they can be recalculated when ScrollTrigger refreshes.
    const heroStartWidth = () => {
      if (window.innerWidth < 720) {
        return Math.min(window.innerWidth * 0.46, 320);
      }

      return Math.min(window.innerWidth * 0.32, 460);
    };

    const heroStartHeight = () => {
      if (window.innerWidth < 720) {
        return Math.min(window.innerHeight * 0.16, 150);
      }

      return Math.min(window.innerHeight * 0.22, 220);
    };

    const heroImageTop = () => {
      if (!heroTitleTop || !heroTitleBottom) {
        return window.innerHeight * 0.5;
      }

      const stageTop = heroStage?.getBoundingClientRect().top ?? 0;
      const topLine = heroTitleTop.getBoundingClientRect();
      const bottomLine = heroTitleBottom.getBoundingClientRect();

      return (topLine.bottom + bottomLine.top) / 2 - stageTop;
    };

    if (heroScroll && heroStage && heroFrame) {
      gsap.set(heroFrame, {
        xPercent: -50,
        yPercent: -50,
        top: heroImageTop,
        width: heroStartWidth,
        height: heroStartHeight,
        scale: 0,
        autoAlpha: 1
      });

      if (heroImage) {
        gsap.set(heroImage, {
          scale: 1.65,
          transformOrigin: "center center"
        });
      }

      gsap.set(
        [heroCopyTop, heroTitleTop, heroTitleBottom, heroCopyBottom].filter(Boolean),
        {
          y: 0,
          autoAlpha: 1
        }
      );

      if (introductionCopy) {
        gsap.set(introductionCopy, {
          opacity: 0,
          y: () => window.innerHeight * 0.25
        });
      }

      if (introWordTracks.length) {
        // Start with row 1 visible: "Photography / for / moments".
        gsap.set(introWordTracks, { yPercent: 0 });
      }

      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroScroll,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      const topExitElements = [heroCopyTop, heroTitleTop].filter(Boolean);
      const bottomExitElements = [heroTitleBottom, heroCopyBottom].filter(Boolean);
      const zoomDuration = 4;

      // Phase 1: the image starts in the title gap, then telescopes outward.
      // The copy moves away at the same time so the growing frame stays clear.
      heroTimeline.to(heroFrame, {
        top: "50%",
        width: "100vw",
        height: "100vh",
        scale: 1,
        ease: "none",
        duration: zoomDuration
      });

      heroTimeline.to(
        topExitElements,
        {
          y: () => -window.innerHeight * 0.58,
          ease: "none",
          duration: zoomDuration * 0.9
        },
        0
      );

      heroTimeline.to(
        bottomExitElements,
        {
          y: () => window.innerHeight * 0.58,
          ease: "none",
          duration: zoomDuration * 0.9
        },
        0
      );

      if (heroImage) {
        heroTimeline.to(
          heroImage,
          {
            scale: 1,
            ease: "none",
            duration: zoomDuration
          },
          0
        );
      }

      if (heroCopy) {
        heroTimeline.set(heroCopy, { autoAlpha: 0 });
      }

      // Phase 2: fade the image out while the introduction copy rises into view.
      heroTimeline.to(heroFrame, {
        y: () => -window.innerHeight * 0.18,
        autoAlpha: 0,
        ease: "none",
        duration: 1
      });

      if (introductionCopy) {
        const introPreRollHold = { progress: 0 };
        const introHold = { progress: 0 };

        heroTimeline.to(
          introductionCopy,
          {
            opacity: 1,
            y: 0,
            delay: 1,
            duration: 1,
            ease: "none"
          },
          "<"
        );

        // After the intro copy reaches center, hold briefly before scroll
        // progress advances each clipped two-row reel from row 1 to row 2.
        // Scrolling upward naturally reverses the same timeline back to row 1.
        heroTimeline
          .to(introPreRollHold, { progress: 1, duration: 1 })
          .to(
            introWordTracks,
            {
              yPercent: -50,
              duration: 1.5,
              ease: "none",
              stagger: 1.5
            }
          )
          .to(introHold, { progress: 1, duration: 1 });
      }

    }
  });
};

document.addEventListener("astro:page-load", initHomepageMotion);
document.addEventListener("astro:before-swap", () => {
  homepageContext?.revert();
  homepageContext = undefined;
});

initHomepageMotion();
