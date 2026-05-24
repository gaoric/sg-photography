interface SlideshowPhoto {
  src: string;
  alt: string;
}

let cleanupAlbumSlideshow: (() => void) | undefined;

export const initAlbumSlideshow = () => {
  cleanupAlbumSlideshow?.();
  cleanupAlbumSlideshow = undefined;

  const photoButtons = Array.from(document.querySelectorAll<HTMLElement>("[data-album-photo]"));
  const slideshow = document.querySelector<HTMLElement>("[data-album-slideshow]");
  const slideshowFigure = document.querySelector<HTMLElement>("[data-slideshow-figure]");
  const slideshowImage = document.querySelector<HTMLImageElement>("[data-slideshow-image]");
  const closeButton = document.querySelector<HTMLButtonElement>("[data-slideshow-close]");
  const previousButton = document.querySelector<HTMLButtonElement>("[data-slideshow-prev]");
  const nextButton = document.querySelector<HTMLButtonElement>("[data-slideshow-next]");

  if (
    !photoButtons.length ||
    !slideshow ||
    !slideshowFigure ||
    !slideshowImage ||
    !closeButton ||
    !previousButton ||
    !nextButton
  ) {
    return;
  }

  const photos: SlideshowPhoto[] = photoButtons.map((button) => ({
    src: button.dataset.fullSrc ?? "",
    alt: button.dataset.fullAlt ?? ""
  }));
  let activeIndex = 0;
  let lastFocusedPhoto: HTMLElement | null = null;

  const resetZoom = () => {
    slideshow.classList.remove("is-zoomed");
    slideshowImage.style.transformOrigin = "";
  };

  const setZoomOrigin = (event: PointerEvent) => {
    if (!slideshow.classList.contains("is-zoomed")) {
      return;
    }

    const rect = slideshowFigure.getBoundingClientRect();
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    slideshowImage.style.transformOrigin = `50% ${Math.max(0, Math.min(100, y))}%`;
  };

  const showPhoto = (index: number) => {
    resetZoom();
    activeIndex = (index + photos.length) % photos.length;
    const photo = photos[activeIndex];

    slideshowImage.src = photo.src;
    slideshowImage.alt = photo.alt;
  };

  const openSlideshow = (index: number, trigger: HTMLElement) => {
    lastFocusedPhoto = trigger;
    showPhoto(index);
    slideshow.classList.add("is-open");
    slideshow.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-open-slideshow");
    closeButton.focus();
  };

  const closeSlideshow = () => {
    slideshow.classList.remove("is-open");
    slideshow.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-open-slideshow");
    resetZoom();
    slideshowImage.removeAttribute("src");
    lastFocusedPhoto?.focus();
  };

  const handleFigureClick = (event: MouseEvent) => {
    slideshow.classList.toggle("is-zoomed");
    setZoomOrigin(event as PointerEvent);
  };

  const photoCleanups = photoButtons.map((button, index) => {
    const handleClick = () => openSlideshow(index, button);

    button.addEventListener("click", handleClick);
    return () => button.removeEventListener("click", handleClick);
  });

  const handlePreviousClick = () => showPhoto(activeIndex - 1);
  const handleNextClick = () => showPhoto(activeIndex + 1);
  const handleKeydown = (event: KeyboardEvent) => {
    if (!slideshow.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeSlideshow();
    }

    if (event.key === "ArrowLeft") {
      showPhoto(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showPhoto(activeIndex + 1);
    }
  };

  previousButton.addEventListener("click", handlePreviousClick);
  nextButton.addEventListener("click", handleNextClick);
  closeButton.addEventListener("click", closeSlideshow);
  slideshowFigure.addEventListener("click", handleFigureClick);
  slideshowFigure.addEventListener("pointermove", setZoomOrigin);
  document.addEventListener("keydown", handleKeydown);

  cleanupAlbumSlideshow = () => {
    photoCleanups.forEach((cleanup) => cleanup());
    previousButton.removeEventListener("click", handlePreviousClick);
    nextButton.removeEventListener("click", handleNextClick);
    closeButton.removeEventListener("click", closeSlideshow);
    slideshowFigure.removeEventListener("click", handleFigureClick);
    slideshowFigure.removeEventListener("pointermove", setZoomOrigin);
    document.removeEventListener("keydown", handleKeydown);
    document.body.classList.remove("has-open-slideshow");
    resetZoom();
  };
};

document.addEventListener("astro:page-load", initAlbumSlideshow);
document.addEventListener("astro:before-swap", () => {
  cleanupAlbumSlideshow?.();
  cleanupAlbumSlideshow = undefined;
});

initAlbumSlideshow();
