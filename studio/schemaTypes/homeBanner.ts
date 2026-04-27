import { defineField, defineType } from "sanity";

export const homeBanner = defineType({
  name: "homeBanner",
  title: "Home Banner",
  type: "document",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "backgroundColor",
      title: "Background color",
      type: "string",
      initialValue: "#1D4ED8",
      validation: (Rule) =>
        Rule.required().regex(
          /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
          { name: "hex", invert: false }
        ),
      description: "Hex color, pl. #1D4ED8",
    }),
  ],
  preview: {
    select: {
      title: "text",
      subtitle: "backgroundColor",
    },
  },
});
