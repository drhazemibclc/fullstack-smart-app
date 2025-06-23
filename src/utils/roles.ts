// src/utils/roles.client.ts
'use client'

import { useSession } from '@/lib/auth/client'
import type { Roles } from '@/types/globals'

export const checkRole = (role: Roles) => {
	const session = useSession()
	return session.data?.user?.role?.toLowerCase() === role.toLowerCase()
}

export const getRole = () => {
	const session = useSession()
	return session.data?.user?.role?.toLowerCase() || 'patient'
}
