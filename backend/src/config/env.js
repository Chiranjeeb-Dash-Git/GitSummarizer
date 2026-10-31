import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().default(8080),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    COOKIE_NAME: z.string().default('gs_session'),
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    COOKIE_DOMAIN: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().trim().min(1).optional(),
    AI_PROVIDER: z.enum(['openai', 'anthropic', 'gemini']).default('gemini'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_MODEL: z.string().default('claude-haiku-5-5'),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
    AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().default(1800),
    PROMPT_VERSION: z.string().default('v1'),
    SUMMARY_TTL_HOURS: z.coerce.number().int().default(24),
    SERVE_CLIENT: z.enum(['true', 'false']).default('false'),
    LOG_LEVEL: z.string().default('info'),
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV === 'production' && v.RESEND_API_KEY && !v.EMAIL_FROM) {
      ctx.addIssue({ code: 'custom', path: ['EMAIL_FROM'], message: 'Required when email delivery is enabled in production' });
    }
    if (v.AI_PROVIDER === 'openai' && !v.OPENAI_API_KEY) {
      ctx.addIssue({ code: 'custom', path: ['OPENAI_API_KEY'], message: 'Required when AI_PROVIDER=openai' });
    }
    if (v.AI_PROVIDER === 'anthropic' && !v.ANTHROPIC_API_KEY) {
      ctx.addIssue({ code: 'custom', path: ['ANTHROPIC_API_KEY'], message: 'Required when AI_PROVIDER=anthropic' });
    }
    if (v.AI_PROVIDER === 'gemini' && !v.GEMINI_API_KEY) {
      ctx.addIssue({ code: 'custom', path: ['GEMINI_API_KEY'], message: 'Required when AI_PROVIDER=gemini' });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  EMAIL_FROM: parsed.data.EMAIL_FROM ?? 'GitSummarizer <onboarding@resend.dev>',
  isProd: parsed.data.NODE_ENV === 'production',
  serveClient: parsed.data.SERVE_CLIENT === 'true',
  clientOrigins: parsed.data.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
};

