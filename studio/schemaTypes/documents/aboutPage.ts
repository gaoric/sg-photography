import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo", validation: (Rule) => Rule.required() }),
    defineField({ name: "portrait", title: "Portrait", type: "imageWithAlt", validation: (Rule) => Rule.required() }),
    defineField({
      name: "headingLines",
      title: "Heading lines",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().length(2)
    }),
    defineField({ name: "intro", title: "Intro copy", type: "text", rows: 5, validation: (Rule) => Rule.required() }),
    defineField({
      name: "approachHeading",
      title: "Approach heading",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "approach", title: "Approach copy", type: "text", rows: 6, validation: (Rule) => Rule.required() })
  ],
  preview: {
    prepare: () => ({ title: "About page" })
  }
});
