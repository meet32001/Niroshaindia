"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Resend } from "resend";
import {
  contactFormSchema,
  INQUIRY_TYPE_LABELS,
  ContactFormData,
  ContactActionResult,
} from "@/types/contact";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids confusing 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NIR-${code}`;
}

export async function submitContactInquiryAction(
  rawInput: ContactFormData
): Promise<ContactActionResult> {
  try {
    // 0. Rate Limiting Check (Max 5 submissions per 15 minutes per IP)
    const clientIp = await getClientIp();
    const rateLimit = checkRateLimit("contact", clientIp, { windowMs: 15 * 60 * 1000, max: 5 });
    if (!rateLimit.success) {
      return {
        success: false,
        message: "Too many contact submissions. Please wait a few minutes before trying again.",
      };
    }

    // 1. Validate Form Input with Zod
    const parsed = contactFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      return {
        success: false,
        message: "Please correct the highlighted form errors.",
        errors: fieldErrors,
      };
    }

    const { name, email, phone, inquiry_type, order_number, message, honeypot } = parsed.data;

    // 2. Honeypot Bot Detection
    if (honeypot && honeypot.trim().length > 0) {
      console.warn("🤖 Bot submission detected via honeypot field. Silently dropping.");
      return {
        success: true,
        ticketId: generateTicketId(),
        message: "Your inquiry has been received.",
      };
    }

    // 3. Extract Clerk User ID if authenticated
    let userId: string | null = null;
    try {
      const authObj = await auth();
      userId = authObj?.userId || null;
    } catch {
      userId = null;
    }

    // 4. Generate Ticket ID
    const ticketId = generateTicketId();
    const cleanPhone = phone ? phone.replace(/\s+/g, "").replace(/^\+91/, "") : null;

    // 5. Database Persistence into Supabase
    try {
      const { error: dbError } = await supabaseServer.from("contact_inquiries").insert({
        ticket_id: ticketId,
        name,
        email,
        phone: cleanPhone,
        inquiry_type,
        order_number: order_number || null,
        message,
        status: "open",
        user_id: userId,
      });

      if (dbError) {
        if (dbError.code === "PGRST205") {
          console.warn(
            "⚠️ Table 'contact_inquiries' does not exist in Supabase yet. Please apply migration 20260928_contact_inquiries.sql."
          );
        } else {
          console.error("Supabase insert error for contact inquiry:", dbError);
        }
      }
    } catch (dbExc) {
      console.error("Exception during contact inquiry database insert:", dbExc);
    }

    // 6. Graceful Resend Email Dispatch
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const typeLabel = INQUIRY_TYPE_LABELS[inquiry_type] || inquiry_type;
      const istTimestamp =
        new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "full",
          timeStyle: "medium",
        }) + " IST";

      // 6a. Dispatch Admin Alert
      if (!adminEmail) {
        console.warn(
          "[Config Error]: ADMIN_NOTIFICATION_EMAIL is not set in environment. Skipping admin notification dispatch."
        );
      } else if (!fromEmail) {
        console.warn(
          "[Config Error]: RESEND_FROM_EMAIL is not set in environment. Skipping admin notification dispatch."
        );
      } else {
        try {
          const adminResult = await resend.emails.send({
            from: fromEmail,
            to: [adminEmail],
            subject: `[New Support Ticket] #${ticketId}: ${typeLabel} - ${name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #1e293b; background-color: #ffffff;">
                <h2 style="color: #0f172a; margin-top: 0;">New Support Ticket: #${ticketId}</h2>
                <p><strong>Customer Name:</strong> ${name}</p>
                <p><strong>Customer Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${cleanPhone || phone || "Not provided"}</p>
                <p><strong>Inquiry Type:</strong> ${typeLabel}</p>
                <p><strong>Associated Order #:</strong> ${order_number || "N/A"}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #0f172a; margin: 12px 0;">
                  ${message}
                </blockquote>
                <p style="font-size: 12px; color: #64748b;">Submitted at: ${istTimestamp}</p>
              </div>
            `,
          });

          if (adminResult.error) {
            console.error("ADMIN EMAIL FAILED TO SEND:", adminResult.error.message || adminResult.error);
            if (adminResult.error.message?.includes("testing emails to your own email address")) {
              console.warn(
                "\n⚠️ [RESEND SANDBOX RESTRICTION]:\n" +
                `You are sending from '${fromEmail}'. Resend sandbox strictly restricts outgoing emails to your account's registered address.\n` +
                `Attempted recipient: '${adminEmail}'.\n` +
                "To resolve, verify your custom domain in Resend Dashboard (resend.com/domains) or set ADMIN_NOTIFICATION_EMAIL to your verified sandbox recipient.\n"
              );
            }
          } else {
            console.log("Admin email dispatched successfully (ID:", adminResult.data?.id, ")");
          }
        } catch (adminErr: unknown) {
          const errMsg = adminErr instanceof Error ? adminErr.message : String(adminErr);
          console.error("ADMIN EMAIL FAILED TO SEND:", errMsg);
        }
      }

      // 6b. Dispatch Customer Confirmation
      if (!fromEmail) {
        console.warn(
          "[Config Error]: RESEND_FROM_EMAIL is not set in environment. Skipping customer confirmation dispatch."
        );
      } else {
        try {
          const customerResult = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: `Ticket Received: #${ticketId} — Nirosha India Support`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0f172a; margin-top: 0;">We've received your request!</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>Thank you for reaching out to Nirosha India Customer Support. Your inquiry has been routed to our live triage desk with the reference ticket below:</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 600;">Assigned Ticket ID</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 800; color: #059669; letter-spacing: 1px;">#${ticketId}</p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #334155;"><strong>Topic:</strong> ${typeLabel}</p>
                  ${order_number ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #334155;"><strong>Order Number:</strong> ${order_number}</p>` : ""}
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                  Expected response time: 24–48 business hours (Mon–Sat, 09:00 AM – 08:00 PM IST).
                </p>

                ${supportEmail ? `
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                  <p style="margin: 0;">Nirosha India • Customer Support Desk</p>
                  <p style="margin: 4px 0 0 0;">Official customer service channel: ${supportEmail}</p>
                </div>
                ` : ""}
              </div>
            `,
          });

          if (customerResult.error) {
            console.warn("Customer confirmation email error:", customerResult.error.message || customerResult.error);
          } else {
            console.log("Customer email dispatched successfully (ID:", customerResult.data?.id, ")");
          }
        } catch (customerErr: unknown) {
          const errMsg = customerErr instanceof Error ? customerErr.message : String(customerErr);
          console.warn("Customer confirmation email error (non-blocking):", errMsg);
        }
      }
    }

    return {
      success: true,
      ticketId,
      message: "Your inquiry has been logged successfully. Our team will get back to you shortly.",
    };
  } catch (err) {
    const errorId = crypto.randomUUID();
    console.error(`[Error ID: ${errorId}] Unhandled error in submitContactInquiryAction:`, err);
    return {
      success: false,
      message: `An unexpected error occurred (Ref: ${errorId.slice(0, 8)}). Please try again or contact customer support.`,
    };
  }
}
