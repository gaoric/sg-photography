import gsap from "gsap";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let cleanupTestimonials: (() => void) | undefined;

export const initTestimonials = () => {
  cleanupTestimonials?.();
  cleanupTestimonials = undefined;

  const testimonialCards = gsap.utils.toArray<HTMLButtonElement>("[data-testimonial-card]");

  if (!testimonialCards.length) {
    return;
  }

  const cleanupHandlers: Array<() => void> = [];
  const liftAmount = 18;

  const cards = testimonialCards.map((card) => {
    const inner = card.querySelector<HTMLElement>("[data-testimonial-inner]");
    const baseRotation =
      Number.parseFloat(getComputedStyle(card).getPropertyValue("--card-rotate")) || 0;
    const baseY = Number.parseFloat(getComputedStyle(card).getPropertyValue("--card-offset-y")) || 0;
    const liftedY = baseY - liftAmount;
    const name =
      card.querySelector<HTMLElement>(".testimonial-card__name")?.textContent?.trim() ??
      "this customer";

    return {
      card,
      inner,
      name,
      baseRotation,
      baseY,
      liftedY,
      flipped: false,
      animating: false
    };
  });

  const setAccessibility = (name: string, card: HTMLButtonElement, flipped: boolean) => {
    card.setAttribute("aria-pressed", flipped ? "true" : "false");
    card.setAttribute(
      "aria-label",
      flipped ? `Put away testimonial from ${name}` : `Show testimonial from ${name}`
    );
  };

  cards.forEach((item, index) => {
    if (!item.inner) return;

    gsap.set(item.card, {
      rotation: item.baseRotation,
      y: item.baseY,
      transformOrigin: "center center",
      zIndex: index + 1
    });
    gsap.set(item.inner, {
      rotateY: 0,
      transformOrigin: "center center"
    });

    setAccessibility(item.name, item.card, false);

    const handlePointerEnter = () => {
      if (item.animating || item.flipped) return;

      item.card.style.zIndex = "12";
      gsap.to(item.card, {
        y: item.liftedY,
        duration: prefersReducedMotion.matches ? 0 : 0.24,
        ease: "power2.out"
      });
    };

    const handlePointerLeave = () => {
      if (item.animating || item.flipped) return;

      item.card.style.zIndex = String(index + 1);
      gsap.to(item.card, {
        y: item.baseY,
        duration: prefersReducedMotion.matches ? 0 : 0.24,
        ease: "power2.out"
      });
    };

    const handleClick = () => {
      if (!item.inner || item.animating) return;

      item.animating = true;
      item.card.style.zIndex = "20";

      if (!item.flipped) {
        gsap
          .timeline({
            onComplete: () => {
              item.flipped = true;
              item.animating = false;
              setAccessibility(item.name, item.card, true);
            }
          })
          .to(item.card, {
            rotation: 0,
            y: item.liftedY,
            duration: prefersReducedMotion.matches ? 0 : 0.38,
            ease: "power2.out"
          })
          .to(
            item.inner,
            {
              rotateY: 180,
              duration: prefersReducedMotion.matches ? 0 : 0.58,
              ease: "power2.inOut"
            },
            prefersReducedMotion.matches ? 0 : "-=0.18"
          );

        return;
      }

      gsap
        .timeline({
          onComplete: () => {
            item.flipped = false;
            item.animating = false;
            item.card.style.zIndex = String(index + 1);
            setAccessibility(item.name, item.card, false);
          }
        })
        .to(item.inner, {
          rotateY: 0,
          duration: prefersReducedMotion.matches ? 0 : 0.5,
          ease: "power2.inOut"
        })
        .to(
          item.card,
          {
            rotation: item.baseRotation,
            y: item.baseY,
            duration: prefersReducedMotion.matches ? 0 : 0.38,
            ease: "power2.out"
          },
          prefersReducedMotion.matches ? 0 : "-=0.18"
        );
    };

    item.card.addEventListener("pointerenter", handlePointerEnter);
    item.card.addEventListener("pointerleave", handlePointerLeave);
    item.card.addEventListener("click", handleClick);

    cleanupHandlers.push(() => {
      item.card.removeEventListener("pointerenter", handlePointerEnter);
      item.card.removeEventListener("pointerleave", handlePointerLeave);
      item.card.removeEventListener("click", handleClick);
    });
  });

  cleanupTestimonials = () => {
    cleanupHandlers.forEach((cleanup) => cleanup());
    gsap.killTweensOf(testimonialCards);
    gsap.killTweensOf(cards.map((item) => item.inner).filter(Boolean));
  };
};

document.addEventListener("astro:page-load", initTestimonials);
document.addEventListener("astro:before-swap", () => {
  cleanupTestimonials?.();
  cleanupTestimonials = undefined;
});

initTestimonials();
