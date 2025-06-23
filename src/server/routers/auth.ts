import { cookies } from 'next/headers';

import { auth } from '@/auth';
import { loginSchema, signUpSchema } from '@/lib/zod/auth';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc';

export const authRouter = createTRPCRouter({
  /**
   * Retrieves the current user's session data.
   * Available to all requests, authenticated or not, if `ctx.session` is always populated.
   */
  getSession: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),

  /**
   * Authenticates a user with email and password.
   * Validates input using `loginSchema`.
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    try {
      await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
      });
    } catch (error) {
      if (error) {
        throw error;
      }
      throw error;
    }

    return { success: true };
  }),

  /**
   * Logs out the currently authenticated user by deleting the session cookie.
   * Requires an active session.
   */
  logout: protectedProcedure.mutation(async () => {
    const cookieStore = cookies();

    const sessionCookieName = 'session_token'; // Example: Replace with your actual cookie name

    // Set the cookie to expire immediately (maxAge: 0)

    (
      await // Set the cookie to expire immediately (maxAge: 0)
      cookieStore
    ).set(sessionCookieName, '', { maxAge: 0 });

    return { success: true };
  }),
  /**
   * Handles user sign-up via email and password.
   * Validates input using `signUpSchema`.
   */
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    try {
      await auth.api.signUpEmail({
        body: {
          email: input.email,
          name: input.name,
          password: input.password,
        },
      });
    } catch (error) {
      if (error) {
        throw error;
      }
      throw error;
    }

    return { success: true };
  }),
});
