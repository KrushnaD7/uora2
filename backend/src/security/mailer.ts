import nodemailer from "nodemailer";
import { env } from "../config/env";

/**
 * Email delivery abstraction.
 *
 * Provider selection (auto-detected at startup):
 *   - SmtpMailProvider  — activated when MAIL_HOST + MAIL_USER + MAIL_PASS are
 *                         all set in the environment. Uses nodemailer over TLS
 *                         (port 465 by default, compatible with Hostinger SMTP).
 *   - DevMailProvider   — development only; prints the full message to stdout so
 *                         reset / verification links are testable without SMTP.
 *   - NoopMailProvider  — production fallback when SMTP vars are absent; returns
 *                         false so callers know delivery did not occur.
 *
 * To enable email on Hostinger, set these env vars in hPanel:
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465
 *   SMTP_SECURE=true
 *   SMTP_USER=no-reply@uorapublications.com
 *   SMTP_PASS=<your-mailbox-password>
 *   SMTP_FROM=UORA Publications <no-reply@uorapublications.com>
 *
 * (MAIL_* names are still read as a fallback for one release — see env.ts —
 * but SMTP_* is canonical and is what backend/.env.example documents.)
 */

export interface MailProvider {
  send(opts: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// SMTP provider (nodemailer) — used in production when MAIL_* vars are set
// ---------------------------------------------------------------------------
class SmtpMailProvider implements MailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_SECURE, // true = TLS on port 465
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
    });
  }

  async send(opts: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: env.MAIL_FROM || env.MAIL_USER,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      return true;
    } catch (err) {
      // Log the error (never log the body/password in production).
      console.error(`[mail:smtp] Failed to send email to ${opts.to}:`, err instanceof Error ? err.message : err);
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Development provider — logs the full message so flows can be tested locally
// ---------------------------------------------------------------------------
class DevMailProvider implements MailProvider {
  async send(opts: { to: string; subject: string; html: string }): Promise<boolean> {
    console.log(`[mail:dev] To: ${opts.to} | Subject: ${opts.subject}`);
    console.log(`[mail:dev] Body: ${opts.html}`);
    return true;
  }
}

// ---------------------------------------------------------------------------
// No-op fallback — production without SMTP vars configured
// ---------------------------------------------------------------------------
class NoopMailProvider implements MailProvider {
  async send(_opts: { to: string; subject: string; html: string }): Promise<boolean> {
    console.warn("[mail:noop] Email delivery is disabled — SMTP_HOST/SMTP_USER/SMTP_PASS not configured.");
    return false;
  }
}

// ---------------------------------------------------------------------------
// Factory — pick the right provider once at startup
// ---------------------------------------------------------------------------
let instance: MailProvider | null = null;

/** Whether SMTP env vars are fully configured. */
function smtpConfigured(): boolean {
  return !!(env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASS);
}

export function getMailProvider(): MailProvider {
  if (instance) return instance;

  if (smtpConfigured()) {
    // SMTP is configured — use it in all environments (including local dev with
    // a real mailbox configured for testing).
    instance = new SmtpMailProvider();
  } else if (env.NODE_ENV !== "production") {
    // Development without SMTP — log to console.
    instance = new DevMailProvider();
  } else {
    // Production without SMTP — warn and no-op.
    instance = new NoopMailProvider();
  }

  return instance;
}

/** Whether email can actually be delivered in this environment. */
export function emailDeliveryEnabled(): boolean {
  return smtpConfigured() || env.NODE_ENV !== "production";
}
