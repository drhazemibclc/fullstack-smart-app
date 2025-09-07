import { getRatingById } from '@/utils/services/doctor'

import { RatingChart } from './charts/rating-chart'
import { RatingList } from './rating-list'

interface Rating {
	id: number
	staff_id: string
	rating: number
	comment?: string
	created_at: Date | string
	patient: { lastName: string; firstName: string }
}

interface RatingData {
	ratings: Rating[]
	totalRatings: number
	averageRating: number
}

export const RatingContainer = async ({ id }: { id: string }) => {
	const data = await getRatingById(id)

	if (!data) {
		return (
			<div className="text-center text-gray-500">
				<p>No rating data available.</p>
			</div>
		)
	}

	const { ratings, totalRatings, averageRating } = data as unknown as RatingData

	return (
		<div className="space-y-4">
			<RatingChart
				averageRating={averageRating}
				totalRatings={totalRatings}
			/>
			<RatingList data={ratings} />
		</div>
	)
}
