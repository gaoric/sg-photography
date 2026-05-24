import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let cleanupServicesSnap: (() => void) | undefined;

export const initServicesSnap = () => {
  cleanupServicesSnap?.();
  cleanupServicesSnap = undefined;

  const servicesSection = document.querySelector<HTMLElement>(".services");
  const copyPanels = gsap.utils.toArray<HTMLElement>("[data-service-copy]");
  const mediaPanels = gsap.utils.toArray<HTMLElement>("[data-service-media]");

  if (
    !servicesSection ||
    copyPanels.length < 2 ||
    mediaPanels.length !== copyPanels.length ||
    prefersReducedMotion.matches
  ) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const snapStep = 1 / (copyPanels.length - 1);
  const triggers: ScrollTrigger[] = [];

  gsap.set(mediaPanels, {
    autoAlpha: 1,
    zIndex: (index) => index + 1
  });
  gsap.set(mediaPanels.slice(1), { yPercent: 100 });

  copyPanels.slice(1).forEach((panel, index) => {
    triggers.push(
      ScrollTrigger.create({
        animation: gsap.to(mediaPanels[index + 1], {
          yPercent: 0,
          ease: "none"
        }),
        trigger: panel,
        start: "top bottom",
        end: "top top",
        scrub: true
      })
    );
  });

  triggers.push(
    ScrollTrigger.create({
      trigger: servicesSection,
      start: "top top",
      end: "bottom bottom",
      snap: {
        snapTo: (progress) => gsap.utils.snap(snapStep, progress),
        duration: { min: 0.32, max: 0.72 },
        delay: 0.05,
        ease: "power2.inOut"
      }
    })
  );

  ScrollTrigger.refresh();

  cleanupServicesSnap = () => {
    triggers.forEach((trigger) => trigger.kill());
    gsap.set(mediaPanels, { clearProps: "opacity,visibility,zIndex,transform" });
  };
};

document.addEventListener("astro:page-load", initServicesSnap);
document.addEventListener("astro:before-swap", () => {
  cleanupServicesSnap?.();
  cleanupServicesSnap = undefined;
});

initServicesSnap();
