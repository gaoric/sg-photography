import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "./client";

const imageBuilder = createImageUrlBuilder({
  projectId: sanityProjectId ?? "placeholder",
  dataset: sanityDataset
});

export const urlFor = (source: SanityImageSource) => imageBuilder.image(source);
