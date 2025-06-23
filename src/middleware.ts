// middleware.ts
// middleware.ts

import { type NextRequest, NextResponse } from 'next/server'

import { getSessionServer } from './lib/auth/server'
import { routeAccess } from './lib/routes'

export async function middleware(req: NextRequest) {
	const session = await getSessionServer()
	const url = new URL(req.url)

	const role = session?.user?.role ?? 'patient' // default to patient if no role

	const path = url.pathname

	// Match path to routeAccess rule
	const matchingAccess = Object.entries(routeAccess).find(([pattern]) =>
		new RegExp(`^${pattern}`).test(path),
	)

	if (matchingAccess) {
		const [_, allowedRoles] = matchingAccess
		if (!allowedRoles.includes(role)) {
			// Redirect unauthorized role to their homepage
			return NextResponse.redirect(new URL(`/${role}`, url.origin))
		}
	}

	return NextResponse.next()
}

// Apply middleware only to relevant paths
export const config = {
	matcher: [
		// Match everything except static files
		'/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|ts|tsx|json|webmanifest)).*)',
		'/api/:path*',
		'/trpc/:path*',
	],
}
