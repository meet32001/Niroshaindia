"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export type SubscribeResult = {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
};

export async function subscribeNewsletter(formData: FormData): Promise<SubscribeResult> {
  try {
    const clientIp = await getClientIp();
    const rateLimit = checkRateLimit("newsletter", clientIp, {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 5,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        message: "Too many subscription attempts. Please try again later.",
      };
    }

    const rawEmail = formData.get("email");
    const validated = emailSchema.safeParse({ email: rawEmail });

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid email address.",
      };
    }

    const email = validated.data.email.toLowerCase();

    const supabase = supabaseAdmin;

    // Check if already subscribed
    const { data: existing, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, is_active, welcome_sent_at")
      .eq("email", email)
      .maybeSingle();

    if (
      fetchError &&
      fetchError.code !== "PGRST116" &&
      fetchError.code !== "PGRST205" &&
      !fetchError.message.includes("does not exist")
    ) {
      console.error("[Newsletter] Supabase check error:", fetchError);
    }

    let isNewSubscriber = false;

    if (existing) {
      if (!existing.is_active) {
        // Reactivate
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        return {
          success: true,
          alreadySubscribed: true,
          message: "You are already an active VIP Club member! Check your inbox on Mondays for drops.",
        };
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        // If table doesn't exist yet, log reminder to run migration
        if (
          insertError.message?.includes("does not exist") ||
          insertError.code === "42P01" ||
          insertError.code === "PGRST205"
        ) {
          console.warn("[Newsletter] Table 'newsletter_subscribers' does not exist yet. Run migration 20260920_newsletter_deals_system.sql.");
        } else {
          console.error("[Newsletter] Insert error:", insertError);
        }
      }
      isNewSubscriber = true;
    }

    // Trigger Welcome Email via Resend if API key is present
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && isNewSubscriber) {
      try {
        const resend = new Resend(resendApiKey);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://niroshaindia.com";
        const emailHtml = await render(
          WelcomeEmail({
            email,
            voucherCode: "WELCOME-NIROSHA-500",
            dealsUrl: `${baseUrl}/deals`,
          })
        );

        // Attempt sending welcome email (using verified domain or Resend sandbox)
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Nirosha VIP <onboarding@resend.dev>";
        const { error: sendError } = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Welcome to the Nirosha VIP Club — Exclusive Weekly High-Ticket Deals Inside",
          html: emailHtml,
        });

        if (sendError) {
          console.warn("[Newsletter] Resend welcome email notice:", sendError.message);
        } else {
          // Record welcome email timestamp
          await supabase
            .from("newsletter_subscribers")
            .update({ welcome_sent_at: new Date().toISOString() })
            .eq("email", email);
        }
      } catch (err: any) {
        console.warn("[Newsletter] Error dispatching welcome email:", err?.message || err);
      }
    }

    return {
      success: true,
      message: "Welcome to Nirosha VIP Club! Check your inbox for your exclusive welcome gift.",
    };
  } catch (error: unknown) {
    const errorId = crypto.randomUUID();
    console.error(`[Newsletter Error] [ID: ${errorId}]:`, error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? `An unexpected error occurred. Please try again or quote reference: ${errorId.slice(0, 8)}`
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again later.",
    };
  }
}
