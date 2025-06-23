// src/lib/auth/auth-client.ts

import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { toast } from 'sonner'

import type { auth } from '.' // server instance
import { ac, allRoles } from './permissions'

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
	fetchOptions: {
		onError: e => {
			if (e.error.status === 429) {
				toast.error('Too many requests. Please try again later.')
			} else {
				toast.error(e.error.message || 'An unknown error occurred.')
			}
		},
	},
	plugins: [
		adminClient({
			ac,
			roles: allRoles,
		}),
		inferAdditionalFields<typeof auth>(),
	],
})

// ✅ All hooks from the same typed client
export const { signIn, signOut, signUp, useSession } = authClient

export type Session = typeof authClient.$Infer.Session
export type User = Session['user']
export type Role = User['role']

export function useUser() {
	const session = useSession()
	return session.data?.user
}

export function useRole() {
	const session = useSession()
	return session.data?.user?.role
}

export function useIsAdmin() {
	const role = useRole()
	return role === 'admin'
}
