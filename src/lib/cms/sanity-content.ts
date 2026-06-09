import {
  fallbackAboutPage,
  fallbackClientAlbums,
  fallbackContactPage,
  fallbackHomePage,
  fallbackSiteSettings
} from "./fallback";
import { fetchSanity, isSanityConfigured } from "../sanity/client";
import type {
  AboutPageContent,
  AlbumService,
  ClientAlbum,
  CmsImage,
  ContactPageContent,
  HomePageContent,
  SanityImageField,
  SeoContent,
  SiteSettings
} from "./types";

const imageProjection = `{
  ...,
  asset->{
    _id,
    url,
    metadata {
      dimensions {
        width,
        height,
        aspectRatio
      },
      lqip
    }
  }
}`;

interface SanitySeo {
  title?: string;
  description?: string;
}

interface SanitySiteSettings {
  businessName?: string;
  defaultSeo?: SanitySeo;
  navLinks?: SiteSettings["navLinks"];
  footer?: Partial<SiteSettings["footer"]>;
}

interface SanityHomePage {
  seo?: SanitySeo;
  hero?: Partial<Omit<HomePageContent["hero"], "image">> & { image?: SanityImageField };
  introduction?: Partial<HomePageContent["introduction"]>;
  photographerIntro?: Partial<Omit<HomePageContent["photographerIntro"], "image">> & { image?: SanityImageField };
  testimonialsTitle?: string;
}

interface SanityService {
  title?: string;
  description?: string;
  price?: string;
  image?: SanityImageField;
}

interface SanityTestimonial {
  name?: string;
  quote?: string;
  image?: SanityImageField;
}

interface SanityAlbum {
  slug?: string;
  names?: string;
  service?: AlbumService;
  place?: string;
  dateTaken?: string;
  cover?: SanityImageField;
  photos?: { image?: SanityImageField }[];
}

interface SanityHomeResponse {
  page?: SanityHomePage | null;
  services?: SanityService[];
  testimonials?: SanityTestimonial[];
  albums?: SanityAlbum[];
}

interface SanityAboutPage {
  seo?: SanitySeo;
  portrait?: SanityImageField;
  headingLines?: string[];
  intro?: string;
  approachHeading?: string;
  approach?: string;
}

interface SanityContactPage {
  seo?: SanitySeo;
  heading?: string;
  intro?: string;
  instagramUrl?: string;
}

const normalizeSeo = (seo: SanitySeo | undefined, fallback: SeoContent): SeoContent => ({
  title: seo?.title?.trim() || fallback.title,
  description: seo?.description?.trim() || fallback.description
});

const normalizeImage = (image: SanityImageField | undefined, fallbackAlt: string): CmsImage | undefined => {
  if (!image?.asset) {
    return undefined;
  }

  return {
    source: "sanity",
    image,
    alt: image.alt?.trim() || fallbackAlt,
    dimensions: image.asset.metadata?.dimensions,
    lqip: image.asset.metadata?.lqip
  };
};

const normalizeWordTuple = (
  value: Partial<HomePageContent["introduction"]> | undefined,
  key: "firstState" | "secondState",
  fallback: [string, string, string]
): [string, string, string] => {
  const words = value?.[key];

  if (!Array.isArray(words) || words.length < 3) {
    return fallback;
  }

  return [words[0] || fallback[0], words[1] || fallback[1], words[2] || fallback[2]];
};

const normalizeAlbum = (album: SanityAlbum): ClientAlbum | undefined => {
  const slug = album.slug?.trim();
  const names = album.names?.trim();
  const place = album.place?.trim();
  const cover = normalizeImage(album.cover, names ? `${names} album photographed at ${place}.` : "Client album cover.");

  if (!slug || !names || !place || !album.service || !cover) {
    return undefined;
  }

  return {
    slug,
    names,
    place,
    service: album.service,
    dateTaken: album.dateTaken ?? "",
    cover,
    photos:
      album.photos
        ?.map((photo, index) => ({
          image: normalizeImage(photo.image, `${names} photographed at ${place}, image ${index + 1}.`)
        }))
        .filter((photo): photo is { image: CmsImage } => Boolean(photo.image)) ?? []
  };
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (!isSanityConfigured) {
    return fallbackSiteSettings;
  }

  const settings = await fetchSanity<SanitySiteSettings>(`
    *[_type == "siteSettings"][0]{
      businessName,
      defaultSeo,
      navLinks,
      footer
    }
  `);

  return {
    businessName: settings?.businessName?.trim() || fallbackSiteSettings.businessName,
    defaultSeo: normalizeSeo(settings?.defaultSeo, fallbackSiteSettings.defaultSeo),
    navLinks: settings?.navLinks?.length ? settings.navLinks : fallbackSiteSettings.navLinks,
    footer: {
      ...fallbackSiteSettings.footer,
      ...settings?.footer
    }
  };
};

export const getClientAlbums = async (): Promise<ClientAlbum[]> => {
  if (!isSanityConfigured) {
    return fallbackClientAlbums;
  }

  const albums = await fetchSanity<SanityAlbum[]>(`
    *[_type == "clientAlbum" && isVisible != false && defined(slug.current)]
      | order(coalesce(order, 9999) asc, dateTaken desc) {
      "slug": slug.current,
      names,
      service,
      place,
      dateTaken,
      cover ${imageProjection},
      photos[] {
        image ${imageProjection}
      }
    }
  `);

  return albums?.map(normalizeAlbum).filter((album): album is ClientAlbum => Boolean(album)) ?? [];
};

export const getHomePage = async (): Promise<HomePageContent> => {
  if (!isSanityConfigured) {
    return fallbackHomePage;
  }

  const response = await fetchSanity<SanityHomeResponse>(`
    {
      "page": *[_type == "homePage"][0]{
        seo,
        hero {
          kicker,
          headingTop,
          headingBottom,
          subtitle,
          image ${imageProjection}
        },
        introduction,
        photographerIntro {
          leftText,
          rightText,
          image ${imageProjection}
        },
        testimonialsTitle
      },
      "services": *[_type == "service" && isVisible != false] | order(coalesce(order, 9999) asc, title asc) {
        title,
        description,
        price,
        image ${imageProjection}
      },
      "testimonials": *[_type == "testimonial" && isVisible != false] | order(coalesce(order, 9999) asc, name asc) {
        name,
        quote,
        image ${imageProjection}
      },
      "albums": *[_type == "clientAlbum" && isVisible != false && defined(slug.current)]
        | order(coalesce(order, 9999) asc, dateTaken desc) {
        "slug": slug.current,
        names,
        service,
        place,
        dateTaken,
        cover ${imageProjection},
        photos[] {
          image ${imageProjection}
        }
      }
    }
  `);

  const page = response?.page;
  const heroFallback = fallbackHomePage.hero;
  const photographerFallback = fallbackHomePage.photographerIntro;
  const introductionFallback = fallbackHomePage.introduction;
  const albums = response?.albums?.map(normalizeAlbum).filter((album): album is ClientAlbum => Boolean(album)) ?? [];

  return {
    seo: normalizeSeo(page?.seo, fallbackHomePage.seo),
    hero: {
      kicker: page?.hero?.kicker?.trim() || heroFallback.kicker,
      headingTop: page?.hero?.headingTop?.trim() || heroFallback.headingTop,
      headingBottom: page?.hero?.headingBottom?.trim() || heroFallback.headingBottom,
      subtitle: page?.hero?.subtitle?.trim() || heroFallback.subtitle,
      image: normalizeImage(page?.hero?.image, heroFallback.image.alt) ?? heroFallback.image
    },
    introduction: {
      firstState: normalizeWordTuple(page?.introduction, "firstState", introductionFallback.firstState),
      secondState: normalizeWordTuple(page?.introduction, "secondState", introductionFallback.secondState),
      ariaLabel: page?.introduction?.ariaLabel?.trim() || introductionFallback.ariaLabel
    },
    photographerIntro: {
      leftText: page?.photographerIntro?.leftText?.trim() || photographerFallback.leftText,
      rightText: page?.photographerIntro?.rightText?.trim() || photographerFallback.rightText,
      image: normalizeImage(page?.photographerIntro?.image, photographerFallback.image.alt) ?? photographerFallback.image
    },
    testimonialsTitle: page?.testimonialsTitle?.trim() || fallbackHomePage.testimonialsTitle,
    portfolioItems: albums.flatMap((album) => {
      const image = album.photos[0]?.image ?? album.cover;
      return image ? [{ names: album.names, place: album.place, image }] : [];
    }),
    testimonials:
      response?.testimonials
        ?.map((testimonial) => {
          const name = testimonial.name?.trim();
          const quote = testimonial.quote?.trim();
          const image = normalizeImage(testimonial.image, name ? `${name} portrait session photographed by Sally Gao.` : "");

          return name && quote && image ? { name, quote, image } : undefined;
        })
        .filter((testimonial): testimonial is HomePageContent["testimonials"][number] => Boolean(testimonial)) ?? [],
    services:
      response?.services
        ?.map((service) => {
          const title = service.title?.trim();
          const description = service.description?.trim();
          const price = service.price?.trim();
          const image = normalizeImage(service.image, title ? `${title} photography service image.` : "");

          return title && description && price && image ? { title, description, price, image } : undefined;
        })
        .filter((service): service is HomePageContent["services"][number] => Boolean(service)) ?? []
  };
};

export const getAboutPage = async (): Promise<AboutPageContent> => {
  if (!isSanityConfigured) {
    return fallbackAboutPage;
  }

  const page = await fetchSanity<SanityAboutPage>(`
    *[_type == "aboutPage"][0]{
      seo,
      portrait ${imageProjection},
      headingLines,
      intro,
      approachHeading,
      approach
    }
  `);

  return {
    seo: normalizeSeo(page?.seo, fallbackAboutPage.seo),
    portrait: normalizeImage(page?.portrait, fallbackAboutPage.portrait.alt) ?? fallbackAboutPage.portrait,
    headingLines:
      page?.headingLines && page.headingLines.length >= 2
        ? [page.headingLines[0] || fallbackAboutPage.headingLines[0], page.headingLines[1] || fallbackAboutPage.headingLines[1]]
        : fallbackAboutPage.headingLines,
    intro: page?.intro?.trim() || fallbackAboutPage.intro,
    approachHeading: page?.approachHeading?.trim() || fallbackAboutPage.approachHeading,
    approach: page?.approach?.trim() || fallbackAboutPage.approach
  };
};

export const getContactPage = async (): Promise<ContactPageContent> => {
  if (!isSanityConfigured) {
    return fallbackContactPage;
  }

  const page = await fetchSanity<SanityContactPage>(`
    *[_type == "contactPage"][0]{
      seo,
      heading,
      intro,
      instagramUrl
    }
  `);

  return {
    seo: normalizeSeo(page?.seo, fallbackContactPage.seo),
    heading: page?.heading?.trim() || fallbackContactPage.heading,
    intro: page?.intro?.trim() || fallbackContactPage.intro,
    instagramUrl: page?.instagramUrl?.trim() || fallbackContactPage.instagramUrl
  };
};
