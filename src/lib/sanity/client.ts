import { createClient } from "@sanity/client";

export const sanityProjectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
export const sanityDataset = import.meta.env.PUBLIC_SANITY_DATASET ?? "production";
export const sanityApiVersion = import.meta.env.SANITY_API_VERSION ?? "2026-06-08";
export const isSanityConfigured = Boolean(sanityProjectId && sanityDataset);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true
    })
  : null;

export const fetchSanity = async <T>(query: string, params: Record<string, string | number | boolean> = {}) => {
  if (!sanityClient) {
    return null;
  }

  return sanityClient.fetch<T>(query, params);
};
