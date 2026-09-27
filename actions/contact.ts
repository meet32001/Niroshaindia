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
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Nirosha Support <onboarding@resend.dev>";
        const typeLabel = INQUIRY_TYPE_LABELS[inquiry_type] || inquiry_type;
        const istTimestamp =
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "medium",
          }) + " IST";

        // Dispatch Admin Alert to niroshaindia26@gmail.com
        const adminNotificationPromise = resend.emails.send({
          from: fromEmail,
          to: ["niroshaindia26@gmail.com"],
          subject: `[New Support Ticket] #${ticketId}: ${typeLabel} - ${name}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #059669;">Nirosha Helpdesk Alert</span>
                <h2 style="color: #0f172a; margin: 6px 0 0 0; font-size: 20px;">New Support Ticket Received</h2>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 150px;">Ticket ID:</td>
                    <td style="padding: 10px 0; color: #0f172a; font-weight: 800; font-family: monospace; font-size: 16px;">#${ticketId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Customer Name:</td>
                    <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Customer Email:</td>
                    <td style="padding: 10px 0; color: #059669;"><a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Phone:</td>
                    <td style="padding: 10px 0; color: #0f172a;">${cleanPhone || phone || "Not provided"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Inquiry Type:</td>
                    <td style="padding: 10px 0; color: #0f172a;">${typeLabel}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Associated Order #:</td>
                    <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${order_number || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Timestamp:</td>
                    <td style="padding: 10px 0; color: #64748b;">${istTimestamp}</td>
                  </tr>
                </tbody>
              </table>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 10px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Customer Message:</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                Automated triage alert sent from Nirosha India Production Helpdesk.
              </div>
            </div>
          `,
        });

        // Dispatch User Confirmation
        const userConfirmationPromise = resend.emails.send({
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

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">Nirosha India • Customer Support Desk</p>
                <p style="margin: 4px 0 0 0;">Official customer service channel: support@niroshaindia.com</p>
              </div>
            </div>
          `,
        });

        await Promise.allSettled([adminNotificationPromise, userConfirmationPromise]);
      } catch (emailErr) {
        console.warn("Resend email dispatch error (non-blocking):", emailErr);
      }
    }

    return {
      success: true,
      ticketId,
      message: "Your inquiry has been logged successfully. Our team will get back to you shortly.",
    };
  } catch (err) {
    console.error("Unhandled error in submitContactInquiryAction:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again or email us directly at support@niroshaindia.com.",
    };
  }
}
