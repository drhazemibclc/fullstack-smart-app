// src/lib/auth/server.ts
import { headers } from 'next/headers'

import { auth } from '.'

// Plain async function (not a Next.js Server Action)
export async function getSessionServer() {
	const heads = new Headers(await headers())
	return await auth.api.getSession({ headers: heads })
}

export async function getUserServer() {
	const session = await getSessionServer()
	return session?.user
}
