import { defineField, defineType } from "sanity";

export const bigDog = defineType({
  name: "bigDog",
  title: "Big Dog",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "backgroundColor",
      title: "Background color",
      type: "string",
      initialValue: "#0F172A",
      validation: (Rule) =>
        Rule.required().regex(
          /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
          { name: "hex", invert: false }
        ),
      description: "Hex color, pl. #0F172A",
    }),
  ],
  preview: {
    select: {
      title: "text",
      media: "image",
    },
    prepare(selection) {
      const title =
        typeof selection.title === "string" && selection.title.trim().length > 0
          ? selection.title
          : "Big Dog block";
      return {
        title,
        subtitle: "Big Dog",
        media: selection.media,
      };
    },
  },
});
