import { createAuthClient, createInternalNeonAuth } from '@neondatabase/auth';
import { setAuthTokenGetter } from './api.js';

export const NEON_AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ||
  'https://ep-round-surf-b5anxfnl.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth';

const internalAuth = createInternalNeonAuth(NEON_AUTH_URL);

// Provide token getter to api client so all backend calls carry the Bearer JWT token
setAuthTokenGetter(async () => {
  try {
    return await internalAuth.getJWTToken();
  } catch {
    return null;
  }
});

export const neonAuth = internalAuth.adapter;


