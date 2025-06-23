import { cache } from 'react'

import { auth } from '@/lib/auth'
import { getSessionServer } from '@/lib/auth/server'
import { db } from '@/lib/db'

export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
	const session = await getSessionServer(opts.headers) 

	return {
		auth,
		db,
		session,
		...opts,
	}
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
