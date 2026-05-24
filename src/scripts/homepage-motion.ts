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
    const heroFrame = document.querySelector<HTMLElement>("[data-hero-frame]");
    const heroImage = heroFrame?.querySelector<HTMLImageElement>("img");
    const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const heroTitleTop = document.querySelector<HTMLElement>("[data-hero-title-top]");
    const heroTitleBottom = document.querySelector<HTMLElement>("[data-hero-title-bottom]");
    const heroCopyTop = document.querySelector<HTMLElement>("[data-hero-copy-top]");
    const heroCopyBottom = document.querySelector<HTMLElement>("[data-hero-copy-bottom]");
    const introductionCopy = document.querySelector<HTMLElement>("[data-introduction-copy]");
    const introWordTracks = gsap.utils.toArray<HTMLElement>("[data-intro-word-track]");

    // These helpers give GSAP responsive dimensions. Passing the functions into
    // GSAP means they can be recalculated when ScrollTrigger refreshes.
    const compactWidth = () => {
      const sideMargin = window.innerWidth < 720 ? 24 : 64;
      return Math.max(window.innerWidth - sideMargin * 2, 280);
    };

    const compactHeight = () => {
      const ratio = window.innerWidth < 720 ? 0.66 : 0.72;
      return Math.max(window.innerHeight * ratio, 420);
    };

    if (heroScroll && heroFrame) {
      const upperHeroText = [heroTitleTop, heroCopyTop].filter(Boolean);
      const lowerHeroText = [heroTitleBottom, heroCopyBottom].filter(Boolean);
      const zoomDuration = 1;
      const zoomInDuration = 4;
      const textExitDuration = zoomInDuration * 0.95;
      const heroImageTop = () => {
        if (!heroTitleTop || !heroTitleBottom) {
          return window.innerHeight * 0.5;
        }

        // The hero image appears vertically centered between the title's top and bottom halves.
        const stickyTop = heroFrame.offsetParent instanceof HTMLElement
          ? heroFrame.offsetParent.getBoundingClientRect().top
          : 0;
        const topLine = heroTitleTop.getBoundingClientRect();
        const bottomLine = heroTitleBottom.getBoundingClientRect();

        return (topLine.bottom + bottomLine.top) / 2 - stickyTop;
      };

      // Start with the photo completely hidden between the headline lines.
      // Scroll progress then reveals and enlarges it while the text moves away,
      // creating the telescope-style zoom into the image.
      gsap.set(heroFrame, {
        xPercent: -50,
        yPercent: -50,
        top: heroImageTop,
        width: () => Math.min(window.innerWidth * 0.32, 460),
        height: () => Math.min(window.innerHeight * 0.22, 220),
        scale: 0
      });

      if (heroImage) {
        gsap.set(heroImage, { scale: 1.75, transformOrigin: "center center" });
      }

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
          // The full height of `.hero-scroll` acts like a scrub range.
          // As the user moves from its top to bottom, the timeline moves from
          // progress 0 to 1, keeping animation tightly locked to scroll.
          trigger: heroScroll,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      // Phase 1: reveal the hidden image and telescope into it. The title's top
      // and bottom halves move away from the center while the photo expands.
      heroTimeline.to(heroFrame, {
        top: "50%",
        width: "100vw",
        height: "100vh",
        scale: 1,
        ease: "none",
        duration: zoomInDuration
      });

      heroTimeline.to(
        upperHeroText,
        {
          y: () => -window.innerHeight * 0.5,
          ease: "none",
          duration: textExitDuration
        },
        0
      );

      heroTimeline.to(
        lowerHeroText,
        {
          y: () => window.innerHeight * 0.5,
          ease: "none",
          duration: textExitDuration
        },
        0
      );

      if (heroImage) {
        heroTimeline.to(
          heroImage,
          {
            scale: 1,
            ease: "none",
            duration: zoomInDuration
          },
          0
        );
      }

      // Phase 2: shrink it back down, lift it upward, and fade it out so the
      // next section can take over visually.
      heroTimeline.to(heroFrame, {
        width: compactWidth,
        height: compactHeight,
        y: () => -window.innerHeight * 0.18,
        autoAlpha: 0,
        ease: "none",
        delay: 1,
        duration: 1
      });

      // The hero copy fades out slightly before the end of the zoom-out to avoid
      // abrupt transitions.
      if (heroCopy) {
        heroTimeline.set(heroCopy, { autoAlpha: 0 }, zoomInDuration);
      }

      // Phase 3: fade in the introduction copy.
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
          zoomInDuration + 1
        );

        // After the intro copy reaches center, hold briefly before scroll
        // progress advances each clipped two-row reel from row 1 to row 2.
        // Scrolling upward naturally reverses the same timeline back to row 1.
        heroTimeline
          .to(introPreRollHold, { progress: 1, duration: 1 }, zoomDuration + 3)
          .to(
            introWordTracks,
            {
              yPercent: -50,
              duration: 0.5,
              ease: "none",
              stagger: 0.5
            },
            zoomInDuration + 4
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
