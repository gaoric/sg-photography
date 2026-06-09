import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "businessName",
      title: "Business name",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "defaultSeo",
      title: "Default SEO",
      type: "seo",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "navLinks",
      title: "Navigation links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "href", title: "URL", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() })
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "href"
            }
          }
        }
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "quotePrefix", title: "Quote prefix", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "quoteEmphasis", title: "Quote emphasis", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "email", title: "Email", type: "email", validation: (Rule) => Rule.required() }),
        defineField({ name: "instagramUrl", title: "Instagram URL", type: "url", validation: (Rule) => Rule.required() }),
        defineField({ name: "instagramHandle", title: "Instagram handle", type: "string", validation: (Rule) => Rule.required() })
      ],
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      title: "businessName"
    }
  }
});
