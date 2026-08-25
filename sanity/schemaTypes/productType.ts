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
      name: "title",
      title: "Title (Legacy Alias)",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => (doc.name as string) || (doc.title as string) || "product",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "is_active",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "variants",
      title: "Product Variants",
      type: "array",
      of: [{ type: "productVariant" }],
      validation: (Rule) => Rule.min(1).error("At least 1 product variant is required."),
    }),
    // Legacy top-level fields for backwards compatibility with storefront cards & webhooks
    defineField({
      name: "images",
      title: "Primary Images (Legacy)",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "price",
      title: "Selling Price INR ₹ (Legacy)",
      type: "number",
    }),
    defineField({
      name: "discount",
      title: "Discount Price INR ₹ (Legacy)",
      type: "number",
    }),
    defineField({
      name: "stock",
      title: "Stock Count (Legacy)",
      type: "number",
      initialValue: 10,
    }),
    defineField({
      name: "status",
      title: "Product Status Tag (Legacy)",
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
      title: "Product Type Tag (Legacy)",
      type: "string",
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
      name: "name",
      title: "title",
      brand: "brand.name",
      price: "variants.0.price_cents",
      legacyPrice: "price",
      media: "variants.0.images.0",
      legacyMedia: "images.0",
    },
    prepare({ name, title, brand, price, legacyPrice, media, legacyMedia }) {
      const displayTitle = name || title || "Product";
      const displayPrice = price ? `₹${(price / 100).toFixed(2)}` : legacyPrice ? `₹${legacyPrice}` : "";
      return {
        title: displayTitle,
        subtitle: brand ? `${brand} ${displayPrice ? `• ${displayPrice}` : ""}` : displayPrice,
        media: media || legacyMedia,
      };
    },
  },
});
