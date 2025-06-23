'use client'

// ^-- to make sure we can mount the Provider from a server component
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import superjson from 'superjson'

import type { AppRouter } from '@/server/lib/root'

import { getQueryClient } from './query-client'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

function getUrl() {
	if (typeof window !== 'undefined') return '/trpc'

	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}/trpc`
	}

	if (process.env.NEXT_PUBLIC_SERVER_URL) {
		return `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`
	}

	throw new Error('Missing server URL')
}
export function TRPCReactProvider(
	props: Readonly<{
		children: React.ReactNode
	}>,
) {
	// NOTE: Avoid useState when initializing the query client if you don't
	//       have a suspense boundary between this and the code that may
	//       suspend because React will throw away the client on the initial
	//       render if it suspends and there is no boundary
	const queryClient = getQueryClient()
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					transformer: superjson,
					url: getUrl(),
				}),
			],
		}),
	)
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider
				queryClient={queryClient}
				trpcClient={trpcClient}
			>
				{props.children}
			</TRPCProvider>
		</QueryClientProvider>
	)
}
