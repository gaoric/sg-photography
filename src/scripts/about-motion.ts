import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let aboutContext: gsap.Context | undefined;
let splitTextInstances: SplitText[] = [];
let aboutMotionRun = 0;

const getActivePageFadeAnimations = () =>
  document.getAnimations().filter((animation) => {
    const effect = animation.effect;

    return (
      effect instanceof KeyframeEffect &&
      effect.pseudoElement === "::view-transition-new(root)" &&
      animation.playState !== "finished"
    );
  });

const playAfterPageFade = async (timeline: gsap.core.Timeline, runId: number) => {
  const fadeAnimations = getActivePageFadeAnimations();

  if (fadeAnimations.length) {
    await Promise.allSettled(fadeAnimations.map((animation) => animation.finished));
  }

  if (runId === aboutMotionRun) {
    timeline.play(0);
  }
};

const revealCharsFromRight = (targets: Element[], stagger = 0.018) =>
  gsap.fromTo(
    targets,
    { x: 42, autoAlpha: 0 },
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.62,
      ease: "power3.out",
      stagger
    }
  );

const revealLines = (targets: Element[], stagger = 0.2) =>
  gsap.fromTo(
    targets,
    { yPercent: 115, autoAlpha: 0 },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.76,
      ease: "power3.out",
      stagger
    }
  );

const dropWords = (targets: Element[], stagger = 0.15) =>
  gsap.fromTo(
    targets,
    { y: -100, autoAlpha: 0, rotation: "random(-80, 80)" },
    {
      y: 0,
      autoAlpha: 1,
      rotation: 0,
      duration: 0.7,
      ease: "back.out(1.7)",
      stagger
    }
  );

export const initAboutMotion = () => {
  aboutMotionRun += 1;
  aboutContext?.revert();
  splitTextInstances.forEach((splitText) => splitText.revert());
  aboutContext = undefined;
  splitTextInstances = [];
  const runId = aboutMotionRun;

  if (prefersReducedMotion.matches) {
    document.documentElement.classList.remove("about-motion-enabled");
    return;
  }

  gsap.registerPlugin(SplitText);

  aboutContext = gsap.context(() => {
    const aboutHero = document.querySelector<HTMLElement>(".about-hero");
    const headingLines = gsap.utils.toArray<HTMLElement>("[data-about-heading-line]");
    const bodyBlocks = gsap.utils.toArray<HTMLElement>("[data-about-body]");

    if (!aboutHero || !headingLines.length || !bodyBlocks.length) {
      document.documentElement.classList.remove("about-motion-enabled");
      return;
    }

    const introHeadingSplits = headingLines
      .slice(0, 2)
      .map((line) => SplitText.create(line, { type: "chars", charsClass: "about-char" }));
    const approachHeadingSplit = SplitText.create(headingLines[2], {
      type: "words",
      wordsClass: "about-word"
    });
    const bodySplits = bodyBlocks.map((block) =>
      SplitText.create(block, { type: "lines", mask: "lines", linesClass: "about-line" })
    );
    splitTextInstances = [...introHeadingSplits, approachHeadingSplit, ...bodySplits];

    const timeline = gsap.timeline({
      paused: true,
      defaults: { overwrite: "auto" },
      onStart: () => document.documentElement.classList.remove("about-motion-enabled")
    });

    // Animate heading lines and body blocks with staggered timings for a dynamic reveal effect
    // Start the reveal of each section slightly before the previous one finishes for a more engaging animation sequence
    timeline
      .add(revealCharsFromRight(introHeadingSplits[0].chars, 0.1))
      .add(revealCharsFromRight(introHeadingSplits[1].chars, 0.1), ">-0.18")
      .add(revealLines(bodySplits[0].lines), ">-0.08")
      .add(dropWords(approachHeadingSplit.words), ">-0.02")
      .add(revealLines(bodySplits[1].lines), ">-0.08");

    void playAfterPageFade(timeline, runId);
  });
};

document.addEventListener("astro:page-load", initAboutMotion);
document.addEventListener("astro:before-swap", () => {
  aboutMotionRun += 1;
  aboutContext?.revert();
  splitTextInstances.forEach((splitText) => splitText.revert());
  aboutContext = undefined;
  splitTextInstances = [];
  document.documentElement.classList.remove("about-motion-enabled");
});

initAboutMotion();
