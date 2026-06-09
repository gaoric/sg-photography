import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo", validation: (Rule) => Rule.required() }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "headingTop", title: "Heading top line", type: "string", validation: (Rule) => Rule.required() }),
        defineField({
          name: "headingBottom",
          title: "Heading bottom line",
          type: "string",
          validation: (Rule) => Rule.required()
        }),
        defineField({ name: "subtitle", title: "Subtitle", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "image", title: "Image", type: "imageWithAlt", validation: (Rule) => Rule.required() })
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "introduction",
      title: "Animated introduction",
      type: "object",
      fields: [
        defineField({
          name: "firstState",
          title: "First phrase words",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.required().length(3)
        }),
        defineField({
          name: "secondState",
          title: "Second phrase words",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.required().length(3)
        }),
        defineField({
          name: "ariaLabel",
          title: "Accessible full phrase",
          type: "string",
          validation: (Rule) => Rule.required()
        })
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "photographerIntro",
      title: "Photographer intro",
      type: "object",
      fields: [
        defineField({ name: "leftText", title: "Left text", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "rightText", title: "Right text", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "image", title: "Portrait image", type: "imageWithAlt", validation: (Rule) => Rule.required() })
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "testimonialsTitle",
      title: "Testimonials section title",
      type: "string",
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    prepare: () => ({ title: "Home page" })
  }
});
