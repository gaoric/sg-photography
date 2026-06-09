import { aboutPage } from "./documents/aboutPage";
import { clientAlbum } from "./documents/clientAlbum";
import { contactPage } from "./documents/contactPage";
import { homePage } from "./documents/homePage";
import { service } from "./documents/service";
import { siteSettings } from "./documents/siteSettings";
import { testimonial } from "./documents/testimonial";
import { galleryPhoto } from "./objects/galleryPhoto";
import { imageWithAlt } from "./objects/imageWithAlt";
import { seo } from "./objects/seo";

export const schemaTypes = [
  seo,
  imageWithAlt,
  galleryPhoto,
  siteSettings,
  homePage,
  aboutPage,
  contactPage,
  service,
  testimonial,
  clientAlbum
];
