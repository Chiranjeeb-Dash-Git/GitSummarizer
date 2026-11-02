import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export async function sendVerificationOtp({ email, code, displayName }) {
  logger.info({ email, code }, `[OTP Code Generated]: ${code} for ${email}`);

  if (!env.RESEND_API_KEY) {
    throw new AppError(503, 'EMAIL_UNAVAILABLE', 'Email verification is not configured. Please try again later.');
  }

  const client = new Resend(env.RESEND_API_KEY);
  const subject = `Your GitSummarizer Verification Code: ${code}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 24px; }
          .container { max-width: 480px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; }
          .logo { font-size: 20px; font-weight: 700; color: #38bdf8; margin-bottom: 24px; }
          .title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #ffffff; }
          .text { font-size: 14px; line-height: 24px; color: #9ca3af; margin-bottom: 24px; }
          .code-box { background-color: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
          .code { font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #38bdf8; }
          .footer { font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">GitSummarizer</div>
          <div class="title">Verify your email address</div>
          <p class="text">Hello ${escapeHtml(displayName || 'there')},</p>
          <p class="text">Use the 6-digit verification code below to complete your registration. This code expires in 10 minutes.</p>
          <div class="code-box">
            <span class="code">${code}</span>
          </div>
          <p class="text">If you did not request this verification code, you can safely ignore this email.</p>
          <div class="footer">&copy; ${new Date().getFullYear()} GitSummarizer. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;

  let result;
  try {
    result = await client.emails.send({
      from: env.EMAIL_FROM || 'GitSummarizer <onboarding@resend.dev>',
      to: email,
      subject,
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html,
    }, { signal: AbortSignal.timeout(15_000) });
  } catch (err) {
    logger.warn({ err: err?.message, email }, '[Resend] Delivery exception.');
    throw new AppError(502, 'EMAIL_UNAVAILABLE', 'Could not send the verification email. Please try again later.');
  }

  if (result?.error) {
    logger.warn({ error: result.error, email }, '[Resend Warning] Direct delivery blocked or failed.');
    throw new AppError(502, 'EMAIL_UNAVAILABLE', 'Could not send the verification email. Please try again later.');
  }

  logger.info({ id: result?.data?.id, email }, 'Verification email dispatched via Resend');
  return { success: true, id: result?.data?.id };
}
