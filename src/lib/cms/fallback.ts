import heroImage from "../../assets/home/hero/hero.jpeg";
import type { ImageMetadata } from "astro";
import photographerImage from "../../assets/home/photographer/photographer.jpeg";
import serviceCouples from "../../assets/home/services/couples.jpeg";
import serviceFamily from "../../assets/home/services/family.jpeg";
import serviceWedding from "../../assets/home/services/wedding.jpeg";
import testimonialCamilleKostiantyn from "../../assets/home/testimonials/camille&kostiantyn.jpeg";
import testimonialEmilyScott from "../../assets/home/testimonials/emily&scott.jpeg";
import testimonialJosesSusanna from "../../assets/home/testimonials/joses&susanna.jpeg";
import testimonialLois from "../../assets/home/testimonials/lois.jpg";
import portraitImage from "../../assets/about/profile.jpeg";
import { clientAlbums as localClientAlbums, portfolioPreviewItems as localPortfolioPreviewItems } from "../../data/albums";
import type {
  AboutPageContent,
  ClientAlbum,
  CmsImage,
  ContactPageContent,
  HomePageContent,
  SiteSettings
} from "./types";

const fromLocalImage = (image: ImageMetadata, alt: string): CmsImage => ({
  source: "local",
  image,
  alt
});

export const fallbackSiteSettings: SiteSettings = {
  businessName: "Sally Gao Photography",
  defaultSeo: {
    title: "Sally Gao Photography",
    description: "Authentic, heartfelt wedding photography based in Toronto and available in the GTA."
  },
  navLinks: [
    { href: "/about/", label: "About" },
    { href: "/client-gallery/", label: "Client Gallery" },
    { href: "/contact/", label: "Contact" }
  ],
  footer: {
    kicker: "Sally Gao Photography",
    quotePrefix: "LET'S CREATE SOMETHING TIMELESS",
    quoteEmphasis: "together",
    email: "hello@sallygaophotography.com",
    instagramUrl: "https://www.instagram.com/sallygaophotography/",
    instagramHandle: "@sallygaophotography"
  }
};

export const fallbackClientAlbums: ClientAlbum[] = localClientAlbums.map((album) => ({
  slug: album.slug,
  names: album.names,
  service: album.service,
  place: album.place,
  dateTaken: album.dateTaken,
  cover: fromLocalImage(album.cover, album.coverAlt),
  photos: album.photos.map((photo) => ({
    image: fromLocalImage(photo.image, photo.alt)
  }))
}));

export const fallbackHomePage: HomePageContent = {
  seo: fallbackSiteSettings.defaultSeo,
  hero: {
    kicker: "based in Toronto, available in the GTA",
    headingTop: "Authentic, Heartfelt",
    headingBottom: "Portrait Photography",
    subtitle: "Capturing moments since 2017",
    image: fromLocalImage(heroImage, "A joyful wedding moment shared by a couple.")
  },
  introduction: {
    firstState: ["Photography", "for", "moments"],
    secondState: ["You'll", "relive", "forever"],
    ariaLabel: "Photography for moments. You'll relive forever."
  },
  photographerIntro: {
    leftText: "Captured by Sally Gao, Lifestyle Photographer",
    rightText: "Based in Toronto, Available in the GTA",
    image: fromLocalImage(photographerImage, "Portrait of Sally Gao.")
  },
  testimonialsTitle: "Testimonials",
  portfolioItems: localPortfolioPreviewItems.map((item) => ({
    names: item.names,
    place: item.place,
    image: fromLocalImage(item.image, item.alt)
  })),
  testimonials: [
    {
      name: "Joses & Susanna",
      image: fromLocalImage(testimonialJosesSusanna, "Joses and Susanna portrait session photographed by Sally Gao."),
      quote:
        "[We] had the pleasure of having Sally take photographs for us. She did such a great job directing us, finding the best scenic spots with great lighting, and took absolutely wonderful photos that we can treasure for the years to come. Thank you, Sally!"
    },
    {
      name: "Camille & Kostiantyn",
      image: fromLocalImage(testimonialCamilleKostiantyn, "Camille and Kostiantyn portrait session photographed by Sally Gao."),
      quote:
        "Sally's photos are truly captivating! The way she captures light and composition is exceptional. Each photo tells a unique story and evokes such strong emotions. Her talent shines through in every shot. Keep inspiring us with your incredible work!"
    },
    {
      name: "Lois",
      image: fromLocalImage(testimonialLois, "Lois portrait session photographed by Sally Gao."),
      quote:
        "Sally has taken many photographs of myself and my family. She has taken photos of myself at Mint Room Studios, Preto Loft, [Purple Hill] Lavender Farm and [Pringles Farm]. All the photos she took of myself and my family are amazing. I would highly recommend her and her photography services. We all love the photos she took of us."
    },
    {
      name: "Emily & Scott",
      image: fromLocalImage(testimonialEmilyScott, "Emily and Scott portrait session photographed by Sally Gao."),
      quote:
        "Sally was accommodating, friendly and helped in the choice of location. We would definitely recommend her to anyone who's looking for a portrait photographer!"
    }
  ],
  services: [
    {
      title: "Wedding",
      description:
        "This package includes up to 12 hours of coverage, 1 photographer, and an online gallery with 1200+ high-resolution edited images available for download and sharing. It's perfect for capturing the ceremony, key moments of the reception, and some pre-ceremony preparations.",
      price: "From $750-$1,500",
      image: fromLocalImage(serviceWedding, "A newly married couple sharing a warm wedding portrait moment.")
    },
    {
      title: "Couples",
      description:
        "The most requested package, it offers up to 2 hours of coverage with 1 photographer, such as an engagement session, bridal shower or pre-wedding session. You'll receive an online gallery with 200+ edited images, a 10x10 luxury leather album with 20 pages showcasing your favourite photos from the photo session.",
      price: "From $150-$300",
      image: fromLocalImage(serviceCouples, "A couple photographed together near the Toronto waterfront.")
    },
    {
      title: "Family",
      description:
        "The package covers up to 3 hours of coverage with 1 photographer, perfect for family photoshoots, baby showers and maternity photos. You'll get an online gallery with 300+ edited images, a 12x12 premium leather album with 30 pages showcasing your favourite photos form the photo session.",
      price: "From $250-$500",
      image: fromLocalImage(serviceFamily, "A family sharing a joyful outdoor portrait moment.")
    }
  ]
};

export const fallbackAboutPage: AboutPageContent = {
  seo: {
    title: "About | Sally Gao Photography",
    description: "Meet Sally Gao, a Toronto wedding photographer with a natural, soft, and vibrant approach."
  },
  portrait: fromLocalImage(portraitImage, "Portrait of Sally Gao."),
  headingLines: ["Hello,", "I'm Sally"],
  intro:
    "I'm a wedding photographer based in Toronto, Ontario. I have over 10 years of experience in wedding, engagement, family, events and portrait photography. Let us help you capture your precious moments to keep for generations to come!",
  approachHeading: "My Approach",
  approach:
    "I have a natural, soft and vibrant photography style. I like whimsical and ethereal wedding and engagement styles but I'm open to different styles to fit your needs! I also do outdoor portrait photography and indoor studio photography for individuals, couples and families. And I can do event photography for bridal showers, baby showers, proposals, corporate parties, etc."
};

export const fallbackContactPage: ContactPageContent = {
  seo: {
    title: "Contact | Sally Gao Photography",
    description: "Contact Sally Gao Photography for weddings, couples, family, and lifestyle photography in Toronto and the GTA."
  },
  heading: "Let's Connect",
  intro: "I'd love to hear from you! Fill out the form below to reach out or ask me anything.",
  instagramUrl: fallbackSiteSettings.footer.instagramUrl
};
