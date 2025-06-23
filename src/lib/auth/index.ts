// src/lib/auth/core.ts
// src/lib/auth/core.ts
import { betterAuth as betterAuthClient } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin as adminPlugin, openAPI, organization } from 'better-auth/plugins'
import { z } from 'zod'

import { env } from '@/env'

import { db } from '../db'
import { ac, allRoles } from './permissions'

const authOptions = betterAuthClient({
	baseURL: env.BETTER_AUTH_URL,
	database: prismaAdapter(db, { provider: 'postgresql' }),
	emailAndPassword: {
		autoSignIn: false,
		enabled: true,
		requireEmailVerification: false,
	},
	plugins: [
		organization(),
		nextCookies(), // OK: plugin registers server behaviors later
		openAPI(),
		adminPlugin({
			ac,
			adminRoles: ['adminRole', 'doctorRole'],
			defaultRole: 'patientRole',
			impersonationSessionDuration: 60 * 60 * 24 * 7,
			roles: allRoles,
		}),
	],
	secret: env.BETTER_AUTH_SECRET,
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	rateLimit: {
		enabled: true,
		storage: 'database',
	},
	user: {
		additionalFields: {
			firstName: { required: false, type: 'string' },
			lastName: { required: false, type: 'string' },
			role: {
				input: false,
				required: false,
				type: 'string',
				validator: {
					input: z.enum(['patient', 'doctor', 'admin', 'nurse']).default('patient'),
				},
			},
			deletedAt: { type: 'string', required: false, defaultValue: null },
		},
		deleteUser: { enabled: true },
	},
	session: {
		cookieCache: { enabled: true, maxAge: 5 * 60 },
		freshAge: 60 * 60 * 24,
		additionalFields: {
			deletedAt: { type: 'string', required: false, defaultValue: null },
		},
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24 * 7,
	},
})

export const auth = authOptions
export const { handler } = authOptions
export type Session = typeof auth.$Infer.Session
export type User = Session['user']
export type Role = User['role']
export type AuthUserType = Session['user']
export type Auth = typeof auth

// Client-safe exports (no headers usage here)
export const { signInEmail: login, signOut: logout, signUpEmail: register } = auth.api
