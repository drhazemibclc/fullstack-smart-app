'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/utils/trpc/query-client'

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			disableTransitionOnChange
			enableColorScheme
			enableSystem
		>
			<QueryClientProvider client={queryClient}>
				<NuqsAdapter>{children}</NuqsAdapter>
			</QueryClientProvider>
			<Toaster
				closeButton
				position="bottom-center"
			/>
		</ThemeProvider>
	)
}
