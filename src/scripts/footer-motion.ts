import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let footerContext: gsap.Context | undefined;

export const initFooterMotion = () => {
  footerContext?.revert();
  footerContext = undefined;

  if (prefersReducedMotion.matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  footerContext = gsap.context(() => {
    // Each animated footer owns its own ScrollTrigger. This keeps the footer
    // reusable across the homepage, gallery index, and album pages.
    document.querySelectorAll<HTMLElement>("[data-footer]").forEach((footer) => {
      const footerReveal = footer.querySelector<HTMLElement>("[data-footer-reveal]");

      if (!footerReveal) {
        return;
      }

      // The outer footer clips this inner layer. Scroll moves the whole footer
      // upward while this slower downward tween creates the parallax uncover.
      gsap.set(footerReveal, { yPercent: -50 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: footer,
            // Start as soon as the previous section is complete: the footer's
            // top edge has just reached the viewport bottom.
            start: "top bottom",
            // End when the sticky footer has fully occupied its scroll range.
            end: "bottom bottom",
            // Tie progress directly to scroll position instead of elapsed time.
            scrub: 1,
            invalidateOnRefresh: true
          }
        })
        .to(footerReveal, {
          yPercent: 0,
          ease: "none",
          duration: 1
        });
    });
  });
};

document.addEventListener("astro:page-load", initFooterMotion);
document.addEventListener("astro:before-swap", () => {
  footerContext?.revert();
  footerContext = undefined;
});

initFooterMotion();
