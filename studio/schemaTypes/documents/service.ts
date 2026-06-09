import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "price", title: "Price", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "image", title: "Image", type: "imageWithAlt", validation: (Rule) => Rule.required() }),
    defineField({ name: "order", title: "Display order", type: "number", validation: (Rule) => Rule.required().integer() }),
    defineField({ name: "isVisible", title: "Visible", type: "boolean", initialValue: true })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "price",
      media: "image"
    }
  }
});
