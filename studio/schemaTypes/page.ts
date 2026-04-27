import { defineArrayMember, defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content blocks",
      type: "array",
      of: [
        defineArrayMember({ type: "bigDog" }),
        defineArrayMember({ type: "homeBannerRef" }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
    prepare(selection) {
      return {
        title: selection.title || "Untitled page",
        subtitle: selection.subtitle ? `/${selection.subtitle}` : "No slug",
      };
    },
  },
});
