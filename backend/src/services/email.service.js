import { Resend } from 'resend';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export async function sendVerificationOtp({ email, code }) {
  if (!env.RESEND_API_KEY) {
    throw new AppError(503, 'EMAIL_UNAVAILABLE', 'Email verification is not configured. Please try again later.');
  }

  const resend = new Resend(env.RESEND_API_KEY);
  let result;
  try {
    result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Your GitSummarizer verification code',
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    }, { signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new AppError(502, 'EMAIL_UNAVAILABLE', 'Could not send the verification email. Please try again later.');
  }
  if (result.error) {
    throw new AppError(502, 'EMAIL_UNAVAILABLE', 'Could not send the verification email. Please try again later.');
  }

}
