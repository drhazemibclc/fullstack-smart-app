'use server'

import type {
	InfiniteQueryObserverOptions,
	QueryKey,
	QueryObserverOptions,
} from '@tanstack/react-query'
import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'

import { createTRPCContext } from '@/server/lib/context'
import { type AppRouter, appRouter, createCaller } from '@/server/lib/root'

import { makeQueryClient } from './query-client'

/**
 * Create the tRPC context with RSC headers
 */
const createContext = cache(async () => {
	const heads = new Headers(await headers()) // ✅ these are now passed into getSessionServer
	heads.set('x-trpc-source', 'rsc')

	return createTRPCContext({ headers: heads })
})

const getQueryClient = cache(makeQueryClient)
const caller = createCaller(createContext)

/**
 * tRPC proxy for server usage
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
	router: appRouter,
	ctx: createContext,
	queryClient: getQueryClient,
})

/**
 * Prefetch util for tRPC queries in server components
 */
export async function prefetch<TData extends readonly unknown[]>(
	queryOptions:
		| QueryObserverOptions<TData, Error, TData, TData, QueryKey>
		| InfiniteQueryObserverOptions<TData, Error, TData, TData, QueryKey>,
): Promise<void> {
	const queryClient = getQueryClient()

	if ('getNextPageParam' in queryOptions && typeof queryOptions.getNextPageParam === 'function') {
		await queryClient.prefetchInfiniteQuery(
			queryOptions as InfiniteQueryObserverOptions<TData, Error, TData, TData, QueryKey>,
		)
	} else {
		await queryClient.prefetchQuery(
			queryOptions as QueryObserverOptions<TData, Error, TData, TData, QueryKey>,
		)
	}
}

/**
 * Unified API helper for RSC hydration
 */
export const { trpc: api } = createHydrationHelpers<AppRouter>(caller, getQueryClient)
