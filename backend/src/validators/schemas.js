import { z } from 'zod';

const tag = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(24)
  .regex(/^[a-z0-9][a-z0-9 _-]*$/, 'Use letters, numbers, spaces, dashes or underscores.');

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8, 'Use at least 8 characters.').max(72),
  displayName: z.string().trim().min(1).max(60),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  code: z.string().trim().regex(/^\d{6}$/),
});

export const resendCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const summaryRequestSchema = z.object({
  input: z.string().trim().min(3).max(300),
  kind: z.enum(['overview', 'release_notes', 'commit']).default('overview'),
  audience: z.enum(['learner', 'product', 'maintainer']).default('learner'),
  options: z
    .object({
      limit: z.number().int().min(5).max(100).default(30),
      sha: z.string().regex(/^[0-9a-f]{7,40}$/i).optional(),
      refresh: z.boolean().default(false),
    })
    .prefault({}),
});

export const previewQuerySchema = z.object({ input: z.string().trim().min(3).max(300) });
export const uuidParamSchema = z.object({ id: z.string().uuid() });

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(200).optional(),
});

export const savedQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  tag: z.string().trim().toLowerCase().max(24).optional(),
});

export const saveBodySchema = z.object({
  summaryId: z.string().uuid(),
  note: z.string().trim().max(500).default(''),
  tags: z.array(tag).max(8).default([]),
});

export const savedPatchSchema = z
  .object({ note: z.string().trim().max(500).optional(), tags: z.array(tag).max(8).optional() })
  .refine((v) => v.note !== undefined || v.tags !== undefined, 'Provide a note or tags.');

