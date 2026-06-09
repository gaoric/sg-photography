import type { StructureResolver } from "sanity/structure";

const singletonItem = (S: Parameters<StructureResolver>[0], title: string, schemaType: string) =>
  S.listItem()
    .title(title)
    .id(schemaType)
    .schemaType(schemaType)
    .child(S.document().schemaType(schemaType).documentId(schemaType));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      singletonItem(S, "Site settings", "siteSettings"),
      singletonItem(S, "Home page", "homePage"),
      singletonItem(S, "About page", "aboutPage"),
      singletonItem(S, "Contact page", "contactPage"),
      S.divider(),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("clientAlbum").title("Client albums")
    ]);
