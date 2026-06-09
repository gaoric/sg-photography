import { defineConfig } from "astro/config";
import sanity from "@sanity/astro";

const sanityProjectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const sanityDataset = process.env.PUBLIC_SANITY_DATASET ?? "production";
const sanityApiVersion = process.env.SANITY_API_VERSION ?? "2026-06-08";

export default defineConfig({
  integrations: sanityProjectId
    ? [
        sanity({
          projectId: sanityProjectId,
          dataset: sanityDataset,
          apiVersion: sanityApiVersion,
          useCdn: true
        })
      ]
    : [],
  image: {
    responsiveStyles: true
  }
});
