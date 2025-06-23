import { cache } from 'react'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getSessionServer } from '@/lib/auth/server';


export const createTRPCContext = cache(async(
	opts: { headers: Headers }) => {
  const session = await getSessionServer(); // Your authentication session data

  return {
    auth, // Your global auth client (if it's not part of `session`)
    db, // Your Prisma database client
    session, // User session data
    // If `auth` is passed via `getSession` return, then remove this line.
    ...opts, // Headers or other options passed from the handler
  };
});
export type Context = Awaited<ReturnType<typeof createTRPCContext>>
