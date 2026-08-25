import { BillIcon } from "@sanity/icons/Bill";
import { defineField, defineType } from "sanity";

export const couponType = defineType({
  name: "coupon",
  title: "Coupon Code",
  type: "document",
  icon: BillIcon,
  fields: [
    defineField({
      name: "code",
      title: "Coupon Code",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .uppercase()
          .regex(/^[A-Z0-9_-]+$/, { name: "uppercase alphanumeric" }),
    }),
    defineField({
      name: "discount_type",
      title: "Discount Type",
      type: "string",
      options: {
        list: [
          { title: "Percentage (%)", value: "PERCENTAGE" },
          { title: "Fixed Amount (Cents)", value: "FIXED_AMOUNT" },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: "PERCENTAGE",
    }),
    defineField({
      name: "value_cents",
      title: "Discount Value (Percentage integer or Cents)",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "min_order_value_cents",
      title: "Minimum Order Value (Cents)",
      type: "number",
    }),
    defineField({
      name: "starts_at",
      title: "Starts At",
      type: "datetime",
    }),
    defineField({
      name: "expires_at",
      title: "Expires At",
      type: "datetime",
    }),
    defineField({
      name: "is_active",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "code",
      type: "discount_type",
      value: "value_cents",
      isActive: "is_active",
    },
    prepare({ title, type, value, isActive }) {
      const typeLabel = type === "PERCENTAGE" ? `${value}% OFF` : `₹${(value / 100).toFixed(2)} OFF`;
      return {
        title: title || "COUPON",
        subtitle: `${typeLabel} [${isActive ? "ACTIVE" : "INACTIVE"}]`,
      };
    },
  },
});
