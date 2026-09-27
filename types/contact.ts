import { z } from "zod";

export const inquiryTypeEnum = z.enum([
  "order_tracking",
  "returns_replacements",
  "warranty_claim",
  "general_inquiry",
]);

export type InquiryType = z.infer<typeof inquiryTypeEnum>;

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  order_tracking: "Order Tracking & Delivery",
  returns_replacements: "Returns & Replacements",
  warranty_claim: "Brand Warranty Assistance",
  general_inquiry: "General Question",
};

export const contactFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Please provide a valid email address."),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const cleaned = val.replace(/\s+/g, "").replace(/^\+91/, "");
          return /^[6-9]\d{9}$/.test(cleaned);
        },
        { message: "Please enter a valid 10-digit Indian mobile number." }
      ),
    inquiry_type: inquiryTypeEnum,
    order_number: z.string().trim().optional(),
    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters.")
      .max(2000, "Message cannot exceed 2000 characters."),
    honeypot: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.inquiry_type === "order_tracking" || data.inquiry_type === "returns_replacements") &&
        (!data.order_number || data.order_number.trim().length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Order number is required for tracking and returns.",
      path: ["order_number"],
    }
  );

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface ContactActionResult {
  success: boolean;
  ticketId?: string;
  message: string;
  errors?: Record<string, string>;
}
