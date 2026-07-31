import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT) || 587,
  secure: env.SMTP_SECURE === "true",
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]
  );

const getFirstName = (name) => {
  const trimmed = String(name || "").trim();
  return trimmed.split(" ")[0] || "there";
};

const getTextBody = ({ firstName, activationUrl }) => {
  return [
    `Hello ${firstName},`,
    "",
    "A request was made to set up or reset the password for your Housing Society Portal account.",
    "Use the link below to choose your password and activate your account.",
    "",
    `${activationUrl}`,
    "",
    `This link will expire in 72 hours.`,
    "For your security, never share this link or your password with anyone.",
    "",
    "If you did not expect this email, you can safely ignore it.",
    "",
    "Housing Society Portal",
  ].join("\n");
};

const getHtmlBody = ({ firstName, activationUrl }) => {
  const safeUrl = escapeHtml(activationUrl);
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #4f46e5; padding: 22px 32px;">
      <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 0.2px;">Housing Society Portal</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 18px; font-weight: 700;">Activate your Housing Society account</h2>
      <p style="margin: 0 0 12px; color: #334155; font-size: 14px; line-height: 1.7;">Hello ${escapeHtml(firstName)},</p>
      <p style="margin: 0 0 12px; color: #334155; font-size: 14px; line-height: 1.7;">
        A request was made to set up or reset the password for your Housing Society Portal account.
        Click the button below to choose your password and activate your account.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${safeUrl}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">Set Your Password</a>
      </div>
      <p style="margin: 0 0 12px; color: #334155; font-size: 13px; line-height: 1.7; word-break: break-all;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${safeUrl}" style="color: #4f46e5;">${safeUrl}</a>
      </p>
      <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; line-height: 1.7;">
        This link will expire in 72 hours. For your security, never share this link or your password with anyone.
      </p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.7;">
        If you did not expect this email, you can safely ignore it.
      </p>
    </div>
  </div>
`;
};

/**
 * Sends a password setup / reset email used for both:
 *  - resident account activation (invitation email)
 *  - normal password reset
 *
 * Resolves when the message has been accepted by the SMTP server.
 * Rejects if the email could not be sent, so callers can decide
 * how to handle the failure.
 */
export const sendPasswordSetupEmail = async ({ email, name, activationUrl }) => {
  const firstName = getFirstName(name);

  const mailOptions = {
    from: env.MAIL_FROM,
    to: email,
    subject: "Activate your Housing Society account",
    text: getTextBody({ firstName, activationUrl }),
    html: getHtmlBody({ firstName, activationUrl }),
  };

  return transporter.sendMail(mailOptions);
};
