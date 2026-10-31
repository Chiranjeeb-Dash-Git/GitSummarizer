import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let resendClient = null;

function getClient() {
  if (!resendClient && env.RESEND_API_KEY) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendVerificationOtp({ email, code, displayName }) {
  const client = getClient();
  const subject = `Your GitSummarizer Verification Code: ${code}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080808; color: #E3E6DF; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #161C19; border: 1px solid rgba(227, 230, 223, 0.14); border-radius: 12px; padding: 36px 32px; }
          .logo { font-size: 22px; font-weight: 800; color: #D4AF37; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 700; color: #E3E6DF; margin-top: 24px; }
          .code-box { margin: 28px 0; padding: 20px; background: #0F1412; border: 1px solid #46C494; border-radius: 8px; text-align: center; }
          .code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #46C494; }
          .text { font-size: 14px; line-height: 1.6; color: #94A097; margin-top: 16px; }
          .footer { font-size: 12px; color: #566159; margin-top: 32px; border-top: 1px solid rgba(227, 230, 223, 0.1); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">GitSummarizer</div>
          <div class="title">Verify your email address</div>
          <p class="text">Hello ${displayName || 'there'},</p>
          <p class="text">Use the 6-digit verification code below to complete your registration. This code expires in 10 minutes.</p>
          <div class="code-box">
            <span class="code">${code}</span>
          </div>
          <p class="text">If you didn't create a GitSummarizer account, you can safely ignore this email.</p>
          <div class="footer">GitSummarizer • Next-Gen Repository Intelligence</div>
        </div>
      </body>
    </html>
  `;

  logger.info({ email, code }, `[OTP Code Generated]: ${code} for ${email}`);

  if (!client) {
    logger.warn('[Resend] RESEND_API_KEY not configured.');
    return { success: true, simulated: true };
  }

  try {
    const res = await client.emails.send({
      from: 'GitSummarizer <onboarding@resend.dev>',
      to: email,
      subject,
      html,
    });
    if (res.error) {
      logger.warn({ error: res.error, email }, '[Resend Warning] Direct delivery blocked or failed.');
      return { success: false, error: res.error.message, resendBlocked: true };
    }
    logger.info({ id: res.data?.id, email }, 'Verification email dispatched via Resend');
    return { success: true, id: res.data?.id };
  } catch (err) {
    logger.warn({ err: err.message, email }, '[Resend] Delivery exception.');
    return { success: false, error: err.message, resendBlocked: true };
  }
}
