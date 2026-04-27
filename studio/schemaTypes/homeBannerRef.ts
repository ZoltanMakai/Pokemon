import { defineField, defineType } from "sanity";

export const homeBannerRef = defineType({
  name: "homeBannerRef",
  title: "Home Banner Block",
  type: "object",
  fields: [
    defineField({
      name: "banner",
      title: "Banner",
      type: "reference",
      to: [{ type: "homeBanner" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "banner.text",
      subtitle: "banner.backgroundColor",
    },
    prepare(selection) {
      return {
        title: selection.title || "Home Banner block",
        subtitle: selection.subtitle || "No banner selected",
      };
    },
  },
});
