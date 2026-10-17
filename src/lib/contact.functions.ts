import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(4000),
  isEstate: z.boolean().default(false),
  estateName: z.string().trim().max(160).nullable().optional(),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

    const estateName = data.isEstate && data.estateName ? data.estateName : null;

    const { data: row, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        is_estate: data.isEstate,
        estate_name: estateName,
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw new Error("Could not save your message.");
    }

    try {
      await sendTemplateEmail("contact-notification", "hello@paarlwine.com", {
        templateData: {
          name: data.name,
          email: data.email,
          message: data.message,
          isEstate: data.isEstate,
          estateName,
          submittedAt: new Date(row.created_at ?? Date.now()).toLocaleString("en-ZA", {
            timeZone: "Africa/Johannesburg",
          }),
        },
        idempotencyKey: `contact-notification-${row.id}`,
        replyTo: data.email,
      });
    } catch (err) {
      // The message is saved either way — never fail the submission on email.
      console.error("Contact notification email failed", err);
    }

    return { ok: true as const };
  });
