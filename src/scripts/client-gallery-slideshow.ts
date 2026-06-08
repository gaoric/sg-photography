import gsap from "gsap";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let cleanupClientGallerySlideshow: (() => void) | undefined;

export const initClientGallerySlideshow = () => {
  cleanupClientGallerySlideshow?.();
  cleanupClientGallerySlideshow = undefined;

  const hero = document.querySelector<HTMLElement>("[data-client-gallery-hero]");
  const slides = gsap.utils.toArray<HTMLElement>("[data-client-gallery-slide]");
  const thumbs = gsap.utils.toArray<HTMLButtonElement>("[data-client-gallery-thumb]");

  if (!hero || slides.length < 2 || thumbs.length !== slides.length) {
    return;
  }

  let activeIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active"))
  );
  let autoplayId: number | undefined;

  const setThumbState = (nextIndex: number) => {
    thumbs.forEach((thumb, index) => {
      const isActive = index === nextIndex;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const showSlide = (nextIndex: number) => {
    if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= slides.length) {
      return;
    }

    const previousSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];
    const duration = prefersReducedMotion.matches ? 0 : 0.62;

    nextSlide.classList.add("is-active");
    nextSlide.setAttribute("aria-hidden", "false");
    gsap.set(nextSlide, { autoAlpha: 0, scale: 0.985 });

    gsap.to(previousSlide, {
      autoAlpha: 0,
      scale: 1.015,
      duration,
      ease: "power2.out",
      onComplete: () => {
        previousSlide.classList.remove("is-active");
        previousSlide.setAttribute("aria-hidden", "true");
        gsap.set(previousSlide, { clearProps: "opacity,visibility,scale" });
      }
    });

    gsap.to(nextSlide, {
      autoAlpha: 1,
      scale: 1,
      duration,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(nextSlide, { clearProps: "opacity,visibility,scale" });
      }
    });

    activeIndex = nextIndex;
    setThumbState(nextIndex);
  };

  const startAutoplay = () => {
    window.clearInterval(autoplayId);

    if (prefersReducedMotion.matches || document.hidden) {
      return;
    }

    autoplayId = window.setInterval(() => {
      showSlide((activeIndex + 1) % slides.length);
    }, 4300);
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayId);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  };

  const cleanupHandlers: Array<() => void> = [];

  thumbs.forEach((thumb, index) => {
    const handleClick = () => {
      showSlide(index);
      startAutoplay();
    };

    thumb.addEventListener("click", handleClick);
    cleanupHandlers.push(() => thumb.removeEventListener("click", handleClick));
  });

  document.addEventListener("visibilitychange", handleVisibilityChange);

  cleanupHandlers.push(() => document.removeEventListener("visibilitychange", handleVisibilityChange));

  setThumbState(activeIndex);
  startAutoplay();

  cleanupClientGallerySlideshow = () => {
    window.clearInterval(autoplayId);
    cleanupHandlers.forEach((cleanup) => cleanup());
    gsap.killTweensOf(slides);
  };
};

document.addEventListener("astro:page-load", initClientGallerySlideshow);
document.addEventListener("astro:before-swap", () => {
  cleanupClientGallerySlideshow?.();
  cleanupClientGallerySlideshow = undefined;
});

initClientGallerySlideshow();
