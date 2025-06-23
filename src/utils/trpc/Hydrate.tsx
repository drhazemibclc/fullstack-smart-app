'use client'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { getQueryClient } from './query-client'

export function Hydrate({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient()
	const dehydratedState = dehydrate(queryClient)

	return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
}
