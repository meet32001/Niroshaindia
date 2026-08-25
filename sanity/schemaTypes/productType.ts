import { PackageIcon } from "@sanity/icons/Package";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "price",
      title: "Price (INR ₹)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Discount Price (INR ₹)",
      type: "number",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
    }),
    defineField({
      name: "stock",
      title: "Stock Count",
      type: "number",
      initialValue: 10,
    }),
    defineField({
      name: "status",
      title: "Product Status Tag",
      type: "string",
      options: {
        list: [
          { title: "New Arrival", value: "new" },
          { title: "Hot Deal", value: "hot" },
          { title: "On Sale", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "productType",
      title: "Product Type",
      type: "string",
      options: {
        list: [
          { title: "Gadgets & Accessories", value: "gadget" },
          { title: "Smart Appliances", value: "appliances" },
          { title: "Refrigerators", value: "refrigerators" },
          { title: "Other Electronics", value: "others" },
        ],
      },
      initialValue: "gadget",
    }),
    defineField({
      name: "isFeatured",
      title: "Is Featured Product",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "price",
      media: "images.0",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `₹${subtitle}` : undefined,
        media,
      };
    },
  },
});
