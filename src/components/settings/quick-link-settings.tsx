import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const SettingsQuickLinks = () => {
	return (
		<Card className="w-full rounded-xl bg-white shadow-none">
			<CardHeader>
				<CardTitle className="text-lg text-gray-500">Quick Links</CardTitle>
			</CardHeader>

			<CardContent className="text-sm font-normal flex flex-wrap gap-4">
				<Link
					className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
					href="?cat=services"
				>
					Services
				</Link>
				<Link
					className="px-4 py-2 rounded-lg bg-violet-100 text-violet-600"
					href="?cat=appointment"
				>
					Payment Methods
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-rose-100 text-rose-600"
					href="?cat=medical-history"
				>
					Medical History
				</Link>
			</CardContent>
		</Card>
	)
}
