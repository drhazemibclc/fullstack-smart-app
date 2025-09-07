import { auth } from '@clerk/nextjs/server'

import db from '@/lib/db'

import { RatingList } from './rating-list'

export const PatientRatingContainer = async ({ id }: { id?: string }) => {
	const { userId } = await auth()

	const data = await db.rating.findMany({
		take: 10,

		where: { patient_id: id ? id : (userId ?? 'N/A') },
		include: { patient: { select: { lastName: true, firstName: true } } },
		orderBy: { created_at: 'desc' },
	})

	if (!data) return null

	return (
		<div>
			<RatingList data={data} />
		</div>
	)
}
