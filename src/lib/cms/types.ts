import type { ImageMetadata } from "astro";

export type AlbumService = "Wedding" | "Couple" | "Family" | "Solo";

export interface SeoContent {
  title: string;
  description: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface SanityImageDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface SanityImageAsset {
  _id?: string;
  _ref?: string;
  url?: string;
  metadata?: {
    dimensions?: SanityImageDimensions;
    lqip?: string;
  };
}

export interface SanityImageField {
  _type?: "image";
  asset?: SanityImageAsset;
  crop?: unknown;
  hotspot?: unknown;
  alt?: string;
}

export type CmsImage =
  | {
      source: "local";
      image: ImageMetadata;
      alt: string;
    }
  | {
      source: "sanity";
      image: SanityImageField;
      alt: string;
      dimensions?: SanityImageDimensions;
      lqip?: string;
    };

export interface SiteSettings {
  businessName: string;
  defaultSeo: SeoContent;
  navLinks: NavLink[];
  footer: {
    kicker: string;
    quotePrefix: string;
    quoteEmphasis: string;
    email: string;
    instagramUrl: string;
    instagramHandle: string;
  };
}

export interface PortfolioPreviewItem {
  names: string;
  place: string;
  image: CmsImage;
}

export interface Testimonial {
  name: string;
  quote: string;
  image: CmsImage;
}

export interface Service {
  title: string;
  description: string;
  price: string;
  image: CmsImage;
}

export interface HomePageContent {
  seo: SeoContent;
  hero: {
    kicker: string;
    headingTop: string;
    headingBottom: string;
    subtitle: string;
    image: CmsImage;
  };
  introduction: {
    firstState: [string, string, string];
    secondState: [string, string, string];
    ariaLabel: string;
  };
  photographerIntro: {
    leftText: string;
    rightText: string;
    image: CmsImage;
  };
  testimonialsTitle: string;
  services: Service[];
  testimonials: Testimonial[];
  portfolioItems: PortfolioPreviewItem[];
}

export interface AboutPageContent {
  seo: SeoContent;
  portrait: CmsImage;
  headingLines: [string, string];
  intro: string;
  approachHeading: string;
  approach: string;
}

export interface ContactPageContent {
  seo: SeoContent;
  heading: string;
  intro: string;
  instagramUrl: string;
}

export interface AlbumPhoto {
  image: CmsImage;
}

export interface ClientAlbum {
  slug: string;
  names: string;
  service: AlbumService;
  place: string;
  dateTaken: string;
  cover: CmsImage;
  photos: AlbumPhoto[];
}
