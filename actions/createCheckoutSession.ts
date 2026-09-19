"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store";
import { urlFor } from "@/lib/image";

export interface CheckoutMetadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any;
  couponCode?: string;
  discountCents?: number;
}

export async function createCheckoutSession(
  items: CartItem[],
  metadata: CheckoutMetadata
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 1. Search for existing customer by email
    let customerId: string | undefined;
    if (metadata.customerEmail) {
      const customers = await stripe.customers.list({
        email: metadata.customerEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // 2. Map cart items to Stripe line items
    const line_items = items.map((item) => {
      const product = item.product;
      const id = String(product._id || product.id || "");
      const name = product.name || product.title || "Electronics Gadget";
      const description = product.description || "High-performance electronics product.";
      const price = product.price || 0;
      const mainImg = Array.isArray(product.images) ? product.images[0] : product.image;

      let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
      if (typeof mainImg === "string") {
        imageUrl = mainImg;
      } else if (mainImg) {
        try {
          imageUrl = urlFor(mainImg).url();
        } catch {
          imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
        }
      }

      return {
        price_data: {
          currency: "inr",
          unit_amount: Math.round(price * 100),
          product_data: {
            name,
            description: String(description).slice(0, 200),
            images: [imageUrl],
            metadata: {
              id,
            },
          },
        },
        quantity: item.quantity,
      };
    });

    // If discountCents is present, apply proportional discount to unit_amounts
    if (metadata.discountCents && metadata.discountCents > 0) {
      const totalCents = line_items.reduce((sum, item) => sum + (item.price_data.unit_amount * item.quantity), 0);
      if (totalCents > 0) {
        const discountRatio = Math.min(1, metadata.discountCents / totalCents);
        line_items.forEach((item) => {
          const originalUnit = item.price_data.unit_amount;
          const discountedUnit = Math.max(100, Math.round(originalUnit * (1 - discountRatio)));
          item.price_data.unit_amount = discountedUnit;
        });
      }
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : metadata.customerEmail,
      payment_method_types: ["card"],
      mode: "payment",
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        clerkUserId: metadata.clerkUserId || "",
        address: JSON.stringify(metadata.address),
        couponCode: metadata.couponCode || "",
        discountCents: String(metadata.discountCents || 0),
      },
      line_items,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_number=${metadata.orderNumber}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    throw error;
  }
}
