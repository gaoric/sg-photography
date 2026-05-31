import type { ImageMetadata } from "astro";

export type AlbumService = "Wedding" | "Couple" | "Family" | "Solo";

export interface AlbumPhoto {
  image: ImageMetadata;
  alt: string;
}

export interface ClientAlbum {
  slug: string;
  names: string;
  service: AlbumService;
  place: string;
  dateTaken: string;
  cover: ImageMetadata;
  coverAlt: string;
  photos: AlbumPhoto[];
}

interface AlbumIdentity {
  slug: string;
  names: string;
  service: AlbumService;
}

interface SourceAlbum {
  folder: string;
  place: string;
  dateTaken: string;
  sortTime: number;
  photos: ImageMetadata[];
}

const albumImages = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/**/*.{jpeg,jpg,png,webp}",
  { eager: true }
);

const placeholderIdentities: AlbumIdentity[] = [
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

const monthIndexes: Record<string, number> = {
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

const seededNumber = (seed: string) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const stableShuffle = <T>(items: T[], seed: string) => {
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

const parseFolder = (folder: string) => {
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

const sourceAlbumsByFolder = Object.entries(albumImages).reduce<Record<string, SourceAlbum>>(
  (albums, [path, module]) => {
    const parts = path.replace("../assets/", "").split("/");
    const [folder] = parts;

    if (!folder || parts.length < 2 || folder === "about" || folder === "home") {
      return albums;
    }

    albums[folder] ??= {
      folder,
      ...parseFolder(folder),
      photos: []
    };
    albums[folder].photos.push(module.default);

    return albums;
  },
  {}
);

const sourceAlbums = Object.values(sourceAlbumsByFolder).sort((albumA, albumB) => albumB.sortTime - albumA.sortTime);

export const clientAlbums: ClientAlbum[] = sourceAlbums.slice(0, placeholderIdentities.length).map((sourceAlbum, index) => {
  const identity = placeholderIdentities[index];
  const selectedImages = stableShuffle(sourceAlbum.photos, `${sourceAlbum.folder}-${sourceAlbum.dateTaken}`).slice(0, 12);
  const photos = selectedImages.map((image, photoIndex) => ({
    image,
    alt: `${identity.names} photographed at ${sourceAlbum.place}, image ${photoIndex + 1}.`
  }));

  return {
    ...identity,
    place: sourceAlbum.place,
    dateTaken: sourceAlbum.dateTaken,
    cover: photos[0].image,
    coverAlt: `${identity.names} album photographed at ${sourceAlbum.place}.`,
    photos
  };
});

export const portfolioPreviewItems = clientAlbums.map((album) => {
  const photo = stableShuffle(album.photos, `${album.slug}-portfolio`)[0] ?? album.photos[0];

  return {
    names: album.names,
    place: album.place,
    image: photo.image,
    alt: `${album.names} photographed at ${album.place}.`
  };
});
