import type { ImageMetadata } from "astro";
import couplesImage from "../assets/polaroid-couples-placeholder.png";
import familyImage from "../assets/polaroid-family-placeholder.png";
import soloImage from "../assets/polaroid-solo-placeholder.png";
import weddingImage from "../assets/polaroid-wedding-placeholder.png";

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
  cover: ImageMetadata;
  coverAlt: string;
  photos: AlbumPhoto[];
}

const albumPhotoSets: Record<AlbumService, AlbumPhoto[]> = {
  Wedding: [
    { image: weddingImage, alt: "Romantic wedding celebration placeholder photograph." },
    { image: couplesImage, alt: "Newlyweds walking together placeholder photograph." },
    { image: weddingImage, alt: "Editorial wedding portrait placeholder photograph." },
    { image: familyImage, alt: "Wedding family gathering placeholder photograph." },
    { image: weddingImage, alt: "Quiet wedding detail placeholder photograph." },
    { image: couplesImage, alt: "Wedding couple embrace placeholder photograph." }
  ],
  Couple: [
    { image: couplesImage, alt: "Natural light couples session placeholder photograph." },
    { image: soloImage, alt: "Portrait moment during a couples session placeholder photograph." },
    { image: couplesImage, alt: "Candid couples walk placeholder photograph." },
    { image: weddingImage, alt: "Romantic outdoor couples placeholder photograph." },
    { image: couplesImage, alt: "Intimate couples portrait placeholder photograph." },
    { image: familyImage, alt: "Lifestyle couples session detail placeholder photograph." }
  ],
  Family: [
    { image: familyImage, alt: "Relaxed family lifestyle placeholder photograph." },
    { image: soloImage, alt: "Child portrait placeholder photograph." },
    { image: familyImage, alt: "Family walk placeholder photograph." },
    { image: couplesImage, alt: "Parents portrait placeholder photograph." },
    { image: familyImage, alt: "Warm family gathering placeholder photograph." },
    { image: weddingImage, alt: "Family celebration detail placeholder photograph." }
  ],
  Solo: [
    { image: soloImage, alt: "Editorial solo portrait placeholder photograph." },
    { image: couplesImage, alt: "Environmental solo portrait placeholder photograph." },
    { image: soloImage, alt: "Soft natural light portrait placeholder photograph." },
    { image: weddingImage, alt: "Lifestyle portrait detail placeholder photograph." },
    { image: soloImage, alt: "Quiet solo session placeholder photograph." },
    { image: familyImage, alt: "Outdoor solo session placeholder photograph." }
  ]
};

// Keep the album list as the source of truth for both index links and static
// album routes, so adding a future client gallery only requires one data edit.
export const clientAlbums: ClientAlbum[] = [
  {
    slug: "maya-daniel",
    names: "Maya & Daniel",
    service: "Wedding",
    place: "Graydon Hall Manor",
    cover: weddingImage,
    coverAlt: "Maya and Daniel wedding album placeholder cover.",
    photos: albumPhotoSets.Wedding
  },
  {
    slug: "ari-thomas",
    names: "Ari & Thomas",
    service: "Couple",
    place: "Toronto Island",
    cover: couplesImage,
    coverAlt: "Ari and Thomas couple album placeholder cover.",
    photos: albumPhotoSets.Couple
  },
  {
    slug: "leah",
    names: "Leah",
    service: "Solo",
    place: "Trinity Bellwoods",
    cover: soloImage,
    coverAlt: "Leah solo album placeholder cover.",
    photos: albumPhotoSets.Solo
  },
  {
    slug: "the-chens",
    names: "The Chens",
    service: "Family",
    place: "High Park",
    cover: familyImage,
    coverAlt: "The Chens family album placeholder cover.",
    photos: albumPhotoSets.Family
  },
  {
    slug: "nora-sam",
    names: "Nora & Sam",
    service: "Couple",
    place: "Distillery District",
    cover: couplesImage,
    coverAlt: "Nora and Sam couple album placeholder cover.",
    photos: albumPhotoSets.Couple
  },
  {
    slug: "isla",
    names: "Isla",
    service: "Solo",
    place: "The Annex",
    cover: soloImage,
    coverAlt: "Isla solo album placeholder cover.",
    photos: albumPhotoSets.Solo
  },
  {
    slug: "priya-alex",
    names: "Priya & Alex",
    service: "Wedding",
    place: "Evergreen Brick Works",
    cover: weddingImage,
    coverAlt: "Priya and Alex wedding album placeholder cover.",
    photos: albumPhotoSets.Wedding
  },
  {
    slug: "the-martins",
    names: "The Martins",
    service: "Family",
    place: "Scarborough Bluffs",
    cover: familyImage,
    coverAlt: "The Martins family album placeholder cover.",
    photos: albumPhotoSets.Family
  },
  {
    slug: "elena-chris",
    names: "Elena & Chris",
    service: "Wedding",
    place: "Osgoode Hall",
    cover: weddingImage,
    coverAlt: "Elena and Chris wedding album placeholder cover.",
    photos: albumPhotoSets.Wedding
  },
  {
    slug: "serena-miles",
    names: "Serena & Miles",
    service: "Couple",
    place: "Rosedale Valley",
    cover: couplesImage,
    coverAlt: "Serena and Miles couple album placeholder cover.",
    photos: albumPhotoSets.Couple
  },
  {
    slug: "the-patel-family",
    names: "The Patel Family",
    service: "Family",
    place: "Riverdale Farm",
    cover: familyImage,
    coverAlt: "The Patel family album placeholder cover.",
    photos: albumPhotoSets.Family
  },
  {
    slug: "marin",
    names: "Marin",
    service: "Solo",
    place: "Kensington Market",
    cover: soloImage,
    coverAlt: "Marin solo album placeholder cover.",
    photos: albumPhotoSets.Solo
  }
];
