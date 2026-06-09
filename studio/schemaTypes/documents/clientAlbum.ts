import { defineField, defineType } from "sanity";

const services = ["Wedding", "Couple", "Family", "Solo"];

export const clientAlbum = defineType({
  name: "clientAlbum",
  title: "Client album",
  type: "document",
  fields: [
    defineField({ name: "names", title: "Client names", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "names", maxLength: 80 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "service",
      title: "Service",
      type: "string",
      options: {
        list: services.map((title) => ({ title, value: title }))
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "place", title: "Place", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "dateTaken",
      title: "Date taken",
      type: "string",
      description: "Use YYYY-MM, for example 2026-02.",
      validation: (Rule) =>
        Rule.required().regex(/^\d{4}-\d{2}$/, {
          name: "year-month",
          invert: false
        })
    }),
    defineField({ name: "cover", title: "Cover image", type: "imageWithAlt", validation: (Rule) => Rule.required() }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [{ type: "galleryPhoto" }],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({ name: "order", title: "Display order", type: "number", validation: (Rule) => Rule.required().integer() }),
    defineField({ name: "isVisible", title: "Visible", type: "boolean", initialValue: true })
  ],
  preview: {
    select: {
      title: "names",
      subtitle: "place",
      media: "cover"
    }
  }
});
