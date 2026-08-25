import { BasketIcon } from "@sanity/icons/Basket";
import { defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "invoice",
      title: "Invoice Number / Ref",
      type: "string",
    }),
    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe / Payment Session ID",
      type: "string",
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "products",
      title: "Order Products",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              initialValue: 1,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "INR",
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discounted",
      type: "number",
    }),
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "reference",
      to: [{ type: "address" }],
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      subtitle: "customerEmail",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      return {
        title: `Order #${title}`,
        subtitle: `${subtitle} (${status || "pending"})`,
      };
    },
  },
});
