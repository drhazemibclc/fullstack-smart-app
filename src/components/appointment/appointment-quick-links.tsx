import Link from 'next/link'

import { checkRole } from '@/utils/roles'

import { ReviewForm } from '../dialogs/review-form'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const AppointmentQuickLinks = async ({ staffId }: { staffId: string }) => {
	const isPatient = await checkRole('PATIENT')

	return (
		<Card className="w-full rounded-xl bg-white shadow-none">
			<CardHeader>
				<CardTitle>Quick Links</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				<Link
					className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
					href="?cat=charts"
				>
					Charts
				</Link>
				<Link
					className="px-4 py-2 rounded-lg bg-violet-100 text-violet-600"
					href="?cat=appointments"
				>
					Appointments
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600"
					href="?cat=diagnosis"
				>
					Diagnosis
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-green-100 text-green-600"
					href="?cat=billing"
				>
					Bills
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-red-100 text-red-600"
					href="?cat=medical-history"
				>
					Medical History
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-purple-100 text-purple-600"
					href="?cat=payments"
				>
					Payments
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-purple-100 text-purple-600"
					href="?cat=lab-test"
				>
					Lab Test
				</Link>

				<Link
					className="px-4 py-2 rounded-lg bg-purple-100 text-purple-600"
					href="?cat=appointments#vital-signs"
				>
					Vital Signs
				</Link>

				{!isPatient && <ReviewForm staffId={staffId} />}
			</CardContent>
		</Card>
	)
}

export default AppointmentQuickLinks
