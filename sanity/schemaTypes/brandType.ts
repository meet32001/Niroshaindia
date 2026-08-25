import { RocketIcon } from "@sanity/icons/Rocket";
import { defineField, defineType } from "sanity";

export const brandType = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({
      name: "name",
      title: "Brand Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title (Legacy Alias)",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => (doc.name as string) || (doc.title as string) || "brand",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Brand Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "image",
      title: "Brand Image (Legacy Alias)",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
  ],
  preview: {
    select: {
      name: "name",
      title: "title",
      subtitle: "description",
      logo: "logo",
      image: "image",
    },
    prepare({ name, title, subtitle, logo, image }) {
      return {
        title: name || title || "Brand",
        subtitle,
        media: logo || image,
      };
    },
  },
});
