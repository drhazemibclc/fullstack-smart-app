'use server'
import { createHydrationHelpers } from '@trpc/react-query/rsc';

import {
	dehydrate,
	HydrationBoundary,
	type InfiniteQueryObserverOptions,
	type QueryKey,
	type QueryObserverOptions,
} from '@tanstack/react-query'
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
	const heads = new Headers(await headers())
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
 * Hydration for React Query in RSC
 */
export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient()

	return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
}

/**
 * Prefetch util for tRPC queries in server components
 */
export function prefetch<TData extends readonly unknown[]>(
	queryOptions:
		| QueryObserverOptions<TData, Error, TData, TData, QueryKey>
		| InfiniteQueryObserverOptions<TData, Error, TData, TData, QueryKey>,
): void {
	const queryClient = getQueryClient()

	if ('getNextPageParam' in queryOptions && typeof queryOptions.getNextPageParam === 'function') {
		// Infinite query
		void queryClient.prefetchInfiniteQuery(
			queryOptions as InfiniteQueryObserverOptions<TData, Error, TData, TData, QueryKey>,
		)
	} else {
		// Normal query
		void queryClient.prefetchQuery(
			queryOptions as QueryObserverOptions<TData, Error, TData, TData, QueryKey>,
		)
	}
}

/**
 * Unified API helper
 */
export const { trpc: api } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);