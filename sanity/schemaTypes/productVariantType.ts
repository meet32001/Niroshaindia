import { defineField, defineType } from "sanity";

export const productVariantType = defineType({
  name: "productVariant",
  title: "Product Variant",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Variant Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "upc",
      title: "UPC / Barcode",
      type: "string",
    }),
    defineField({
      name: "price_cents",
      title: "Price (Cents)",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "compare_at_price_cents",
      title: "Compare At Price (Cents)",
      type: "number",
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: "is_serialized",
      title: "Is Serialized Hardware (Requires IMEI / Serial #)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "images",
      title: "Variant Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "specs",
      title: "Specifications",
      type: "array",
      of: [
        {
          type: "object",
          name: "specItem",
          fields: [
            defineField({ name: "key", title: "Specification Key", type: "string" }),
            defineField({ name: "value", title: "Specification Value", type: "string" }),
          ],
          preview: {
            select: {
              title: "key",
              subtitle: "value",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "sku",
      media: "images.0",
    },
  },
});
