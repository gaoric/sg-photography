import { defineField, defineType } from "sanity";

export const galleryPhoto = defineType({
  name: "galleryPhoto",
  title: "Gallery photo",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      media: "image",
      title: "image.alt"
    }
  }
});
