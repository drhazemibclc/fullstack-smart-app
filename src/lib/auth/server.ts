import { headers } from 'next/headers'

import { auth } from '.'

export async function getSessionServer(headers: Headers) {
	const heads = new Headers(headers)
	heads.set('x-trpc-source', 'server')
	return await auth.api.getSession({ headers: heads })
}
export async function getUserServer() {
	const session = await getSessionServer(await headers()) // ✅ CALL headers()
	return session?.user
}
