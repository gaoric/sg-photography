import { createReadStream, existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const studioRoot = path.resolve(__dirname, "..");
const assetsRoot = path.join(repoRoot, "src", "assets");

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  const envFile = readFileSync(filePath, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");

    process.env[key] ??= value;
  }
};

loadEnvFile(path.join(studioRoot, ".env"));

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_SEED_TOKEN || process.env.SANITY_AUTH_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "2026-06-08";

if (!projectId || !token) {
  throw new Error("Set SANITY_STUDIO_PROJECT_ID and SANITY_SEED_TOKEN before running the seed script.");
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false
});

const monthIndexes = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11
};

const placeholderIdentities = [
  { slug: "maya-daniel", names: "Maya & Daniel", service: "Wedding" },
  { slug: "ari-thomas", names: "Ari & Thomas", service: "Couple" },
  { slug: "leah", names: "Leah", service: "Solo" },
  { slug: "the-chens", names: "The Chens", service: "Family" },
  { slug: "nora-sam", names: "Nora & Sam", service: "Couple" },
  { slug: "isla", names: "Isla", service: "Solo" },
  { slug: "priya-alex", names: "Priya & Alex", service: "Wedding" },
  { slug: "the-martins", names: "The Martins", service: "Family" },
  { slug: "elena-chris", names: "Elena & Chris", service: "Wedding" }
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const seededNumber = (seed) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const stableShuffle = (items, seed) => {
  const shuffled = [...items];
  let state = seededNumber(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    const swapIndex = ((state ^ (state >>> 14)) >>> 0) % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const parseFolder = (folder) => {
  const match = folder.match(/^(.*)\s+\((\w+)\s+(\d{4})\)$/);

  if (!match) {
    return {
      place: folder,
      dateTaken: "",
      sortTime: 0
    };
  }

  const [, place, monthName, year] = match;
  const monthIndex = monthIndexes[monthName.toLowerCase()] ?? 0;
  const date = new Date(Number(year), monthIndex, 1);

  return {
    place,
    dateTaken: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    sortTime: date.getTime()
  };
};

const imageFilesIn = (folder) =>
  readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
    .map((entry) => path.join(folder, entry.name))
    .sort((pathA, pathB) => pathA.localeCompare(pathB));

const discoverAlbums = () => {
  const sourceAlbums = readdirSync(assetsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !["about", "home", "placeholders"].includes(entry.name))
    .map((entry) => {
      const folder = entry.name;
      return {
        folder,
        ...parseFolder(folder),
        photos: imageFilesIn(path.join(assetsRoot, folder))
      };
    })
    .filter((album) => album.photos.length > 0)
    .sort((albumA, albumB) => albumB.sortTime - albumA.sortTime);

  return sourceAlbums.slice(0, placeholderIdentities.length).map((sourceAlbum, index) => {
    const identity = placeholderIdentities[index];
    const selectedImages = stableShuffle(sourceAlbum.photos, `${sourceAlbum.folder}-${sourceAlbum.dateTaken}`).slice(0, 12);

    return {
      ...identity,
      place: sourceAlbum.place,
      dateTaken: sourceAlbum.dateTaken,
      photos: selectedImages
    };
  });
};

const uploadImage = async (absolutePath, alt, existingImage) => {
  if (existingImage?.asset?._ref) {
    return {
      _type: "image",
      asset: existingImage.asset,
      crop: existingImage.crop,
      hotspot: existingImage.hotspot,
      alt: existingImage.alt || alt
    };
  }

  if (!existsSync(absolutePath)) {
    throw new Error(`Missing seed image: ${absolutePath}`);
  }

  const asset = await client.assets.upload("image", createReadStream(absolutePath), {
    filename: path.basename(absolutePath)
  });

  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id
    },
    alt
  };
};

const fetchExisting = (id) => client.fetch("*[_id == $id][0]", { id });

const createOrReplace = async (doc) => {
  await client.createOrReplace(doc);
  console.log(`Seeded ${doc._type}: ${doc._id}`);
};

const seedSingletons = async () => {
  const existingSiteSettings = await fetchExisting("siteSettings");
  const existingHomePage = await fetchExisting("homePage");
  const existingAboutPage = await fetchExisting("aboutPage");

  await createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    businessName: "Sally Gao Photography",
    defaultSeo: {
      title: "Sally Gao Photography",
      description: "Authentic, heartfelt wedding photography based in Toronto and available in the GTA."
    },
    navLinks: [
      { _key: "about", href: "/about/", label: "About" },
      { _key: "client-gallery", href: "/client-gallery/", label: "Client Gallery" },
      { _key: "contact", href: "/contact/", label: "Contact" }
    ],
    footer: {
      kicker: "Sally Gao Photography",
      quotePrefix: "LET'S CREATE SOMETHING TIMELESS",
      quoteEmphasis: "together",
      email: "hello@sallygaophotography.com",
      instagramUrl: "https://www.instagram.com/sallygaophotography/",
      instagramHandle: "@sallygaophotography"
    }
  });

  await createOrReplace({
    _id: "homePage",
    _type: "homePage",
    seo: {
      title: "Sally Gao Photography",
      description: "Authentic, heartfelt wedding photography based in Toronto and available in the GTA."
    },
    hero: {
      kicker: "based in Toronto, available in the GTA",
      headingTop: "Authentic, Heartfelt",
      headingBottom: "Portrait Photography",
      subtitle: "Capturing moments since 2017",
      image: await uploadImage(
        path.join(assetsRoot, "home", "hero", "hero.jpeg"),
        "A joyful wedding moment shared by a couple.",
        existingHomePage?.hero?.image
      )
    },
    introduction: {
      firstState: ["Photography", "for", "moments"],
      secondState: ["You'll", "relive", "forever"],
      ariaLabel: "Photography for moments. You'll relive forever."
    },
    photographerIntro: {
      leftText: "Captured by Sally Gao, Lifestyle Photographer",
      rightText: "Based in Toronto, Available in the GTA",
      image: await uploadImage(
        path.join(assetsRoot, "home", "photographer", "photographer.jpeg"),
        "Portrait of Sally Gao.",
        existingHomePage?.photographerIntro?.image
      )
    },
    testimonialsTitle: "Testimonials"
  });

  await createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    seo: {
      title: "About | Sally Gao Photography",
      description: "Meet Sally Gao, a Toronto wedding photographer with a natural, soft, and vibrant approach."
    },
    portrait: await uploadImage(path.join(assetsRoot, "about", "profile.jpeg"), "Portrait of Sally Gao.", existingAboutPage?.portrait),
    headingLines: ["Hello,", "I'm Sally"],
    intro:
      "I'm a wedding photographer based in Toronto, Ontario. I have over 10 years of experience in wedding, engagement, family, events and portrait photography. Let us help you capture your precious moments to keep for generations to come!",
    approachHeading: "My Approach",
    approach:
      "I have a natural, soft and vibrant photography style. I like whimsical and ethereal wedding and engagement styles but I'm open to different styles to fit your needs! I also do outdoor portrait photography and indoor studio photography for individuals, couples and families. And I can do event photography for bridal showers, baby showers, proposals, corporate parties, etc."
  });

  await createOrReplace({
    _id: "contactPage",
    _type: "contactPage",
    seo: {
      title: "Contact | Sally Gao Photography",
      description: "Contact Sally Gao Photography for weddings, couples, family, and lifestyle photography in Toronto and the GTA."
    },
    heading: "Let's Connect",
    intro: "I'd love to hear from you! Fill out the form below to reach out or ask me anything.",
    instagramUrl: existingSiteSettings?.footer?.instagramUrl || "https://www.instagram.com/sallygaophotography/"
  });
};

const seedServices = async () => {
  const services = [
    {
      id: "service-wedding",
      order: 1,
      title: "Wedding",
      description:
        "This package includes up to 12 hours of coverage, 1 photographer, and an online gallery with 1200+ high-resolution edited images available for download and sharing. It's perfect for capturing the ceremony, key moments of the reception, and some pre-ceremony preparations.",
      price: "From $750-$1,500",
      imagePath: path.join(assetsRoot, "home", "services", "wedding.jpeg"),
      alt: "A newly married couple sharing a warm wedding portrait moment."
    },
    {
      id: "service-couples",
      order: 2,
      title: "Couples",
      description:
        "The most requested package, it offers up to 2 hours of coverage with 1 photographer, such as an engagement session, bridal shower or pre-wedding session. You'll receive an online gallery with 200+ edited images, a 10x10 luxury leather album with 20 pages showcasing your favourite photos from the photo session.",
      price: "From $150-$300",
      imagePath: path.join(assetsRoot, "home", "services", "couples.jpeg"),
      alt: "A couple photographed together near the Toronto waterfront."
    },
    {
      id: "service-family",
      order: 3,
      title: "Family",
      description:
        "The package covers up to 3 hours of coverage with 1 photographer, perfect for family photoshoots, baby showers and maternity photos. You'll get an online gallery with 300+ edited images, a 12x12 premium leather album with 30 pages showcasing your favourite photos form the photo session.",
      price: "From $250-$500",
      imagePath: path.join(assetsRoot, "home", "services", "family.jpeg"),
      alt: "A family sharing a joyful outdoor portrait moment."
    }
  ];

  for (const service of services) {
    const existing = await fetchExisting(service.id);
    await createOrReplace({
      _id: service.id,
      _type: "service",
      title: service.title,
      description: service.description,
      price: service.price,
      order: service.order,
      isVisible: true,
      image: await uploadImage(service.imagePath, service.alt, existing?.image)
    });
  }
};

const seedTestimonials = async () => {
  const testimonials = [
    {
      id: "testimonial-joses-susanna",
      order: 1,
      name: "Joses & Susanna",
      imagePath: path.join(assetsRoot, "home", "testimonials", "joses&susanna.jpeg"),
      alt: "Joses and Susanna portrait session photographed by Sally Gao.",
      quote:
        "[We] had the pleasure of having Sally take photographs for us. She did such a great job directing us, finding the best scenic spots with great lighting, and took absolutely wonderful photos that we can treasure for the years to come. Thank you, Sally!"
    },
    {
      id: "testimonial-camille-kostiantyn",
      order: 2,
      name: "Camille & Kostiantyn",
      imagePath: path.join(assetsRoot, "home", "testimonials", "camille&kostiantyn.jpeg"),
      alt: "Camille and Kostiantyn portrait session photographed by Sally Gao.",
      quote:
        "Sally's photos are truly captivating! The way she captures light and composition is exceptional. Each photo tells a unique story and evokes such strong emotions. Her talent shines through in every shot. Keep inspiring us with your incredible work!"
    },
    {
      id: "testimonial-lois",
      order: 3,
      name: "Lois",
      imagePath: path.join(assetsRoot, "home", "testimonials", "lois.jpg"),
      alt: "Lois portrait session photographed by Sally Gao.",
      quote:
        "Sally has taken many photographs of myself and my family. She has taken photos of myself at Mint Room Studios, Preto Loft, [Purple Hill] Lavender Farm and [Pringles Farm]. All the photos she took of myself and my family are amazing. I would highly recommend her and her photography services. We all love the photos she took of us."
    },
    {
      id: "testimonial-emily-scott",
      order: 4,
      name: "Emily & Scott",
      imagePath: path.join(assetsRoot, "home", "testimonials", "emily&scott.jpeg"),
      alt: "Emily and Scott portrait session photographed by Sally Gao.",
      quote:
        "Sally was accommodating, friendly and helped in the choice of location. We would definitely recommend her to anyone who's looking for a portrait photographer!"
    }
  ];

  for (const testimonial of testimonials) {
    const existing = await fetchExisting(testimonial.id);
    await createOrReplace({
      _id: testimonial.id,
      _type: "testimonial",
      name: testimonial.name,
      quote: testimonial.quote,
      order: testimonial.order,
      isVisible: true,
      image: await uploadImage(testimonial.imagePath, testimonial.alt, existing?.image)
    });
  }
};

const seedAlbums = async () => {
  const albums = discoverAlbums();

  for (const [albumIndex, album] of albums.entries()) {
    const id = `clientAlbum-${album.slug}`;
    const existing = await fetchExisting(id);
    const existingPhotos = new Map((existing?.photos || []).map((photo) => [photo._key, photo]));

    const photos = [];
    for (const [photoIndex, photoPath] of album.photos.entries()) {
      const key = `${slugify(path.basename(photoPath, path.extname(photoPath)))}-${photoIndex + 1}`;
      const alt = `${album.names} photographed at ${album.place}, image ${photoIndex + 1}.`;
      photos.push({
        _key: key,
        _type: "galleryPhoto",
        image: await uploadImage(photoPath, alt, existingPhotos.get(key)?.image)
      });
    }

    await createOrReplace({
      _id: id,
      _type: "clientAlbum",
      names: album.names,
      slug: {
        _type: "slug",
        current: album.slug
      },
      service: album.service,
      place: album.place,
      dateTaken: album.dateTaken,
      cover: await uploadImage(
        album.photos[0],
        `${album.names} album photographed at ${album.place}.`,
        existing?.cover
      ),
      photos,
      order: albumIndex + 1,
      isVisible: true
    });
  }
};

await seedSingletons();
await seedServices();
await seedTestimonials();
await seedAlbums();

console.log("Sanity seed complete.");
