import { auth } from '@clerk/nextjs/server'

import type { Roles } from '@/types/globals'

export const checkRole = async (role: Roles) => {
	const { sessionClaims } = await auth()

	return sessionClaims?.metadata?.role === role.toLowerCase()
}

export const getRole = async () => {
	const { sessionClaims } = await auth()

	const role = sessionClaims?.metadata.role?.toLowerCase() || 'patient'

	return role
}
