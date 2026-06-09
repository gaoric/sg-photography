import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    defineField({ name: "seo", title: "SEO", type: "seo", validation: (Rule) => Rule.required() }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "intro", title: "Intro copy", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url", validation: (Rule) => Rule.required() })
  ],
  preview: {
    prepare: () => ({ title: "Contact page" })
  }
});
