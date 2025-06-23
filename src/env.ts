// env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
	/**
	 * Client-side environment variables schema
	 */
	client: {
		NEXT_PUBLIC_SERVER_URL: z.string().url(),
	},

	/**
	 * Server-side environment variables schema
	 */
	server: {
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.string().url(),
		DATABASE_URL: z.string().url(),
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
		NEXT_TELEMETRY_DISABLED: z.string().optional(),
	},

	/**
	 * Runtime environment variables
	 */
	runtimeEnv: {
		// Client-side
		NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,

		// Server-side
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
	},

	/**
	 * Configuration options
	 */
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
