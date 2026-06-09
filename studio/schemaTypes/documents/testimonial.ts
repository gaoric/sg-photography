import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "quote", title: "Quote", type: "text", rows: 6, validation: (Rule) => Rule.required() }),
    defineField({ name: "image", title: "Image", type: "imageWithAlt", validation: (Rule) => Rule.required() }),
    defineField({ name: "order", title: "Display order", type: "number", validation: (Rule) => Rule.required().integer() }),
    defineField({ name: "isVisible", title: "Visible", type: "boolean", initialValue: true })
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "quote",
      media: "image"
    }
  }
});
