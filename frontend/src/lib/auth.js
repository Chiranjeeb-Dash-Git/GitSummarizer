import { createAuthClient } from '@neondatabase/auth';

export const NEON_AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ||
  'https://ep-round-surf-b5anxfnl.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth';

export const neonAuth = createAuthClient(NEON_AUTH_URL);

