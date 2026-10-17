import * as React from "react";
import { render } from "@react-email/render";
import nodemailer, { type Transporter } from "nodemailer";
import { TEMPLATES } from "./registry";

// Server-only: reads SMTP_* environment variables. Never import from client components.
//
// Required environment variables:
//   SMTP_HOST   e.g. the mail server of the hosting provider that runs hello@paarlwine.com
//   SMTP_PORT   465 (SSL) or 587 (STARTTLS); defaults to 465
//   SMTP_USER   full mailbox name, e.g. hello@paarlwine.com
//   SMTP_PASS   mailbox password
// Optional:
//   SMTP_FROM   display name and address; defaults to "Paarl Wine <hello@paarlwine.com>"

const DEFAULT_FROM = "Paarl Wine <hello@paarlwine.com>";

export type SendTemplateEmailResult = { sent: true };

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>;
  replyTo?: string;
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("Email is not configured: set SMTP_HOST, SMTP_USER and SMTP_PASS");
  }
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

/**
 * Renders a registered React Email template and sends it over SMTP.
 * Throws on failure; callers decide whether a failed email is fatal.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`,
    );
  }

  // Template-level `to` takes precedence — notification templates always
  // send to their fixed address.
  const recipient = template.to || to;
  if (!recipient) {
    throw new Error("Recipient is required (the template defines no fixed recipient)");
  }

  const templateData = options.templateData ?? {};
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function" ? template.subject(templateData) : template.subject;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || DEFAULT_FROM,
    to: recipient,
    replyTo: options.replyTo,
    subject,
    html,
    text,
  });

  return { sent: true };
}
