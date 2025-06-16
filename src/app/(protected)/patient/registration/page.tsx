import { auth } from '@clerk/nextjs/server'

import { NewPatient } from '@/components/new-patient'
import { getPatientById } from '@/utils/services/patient'

const Registration = async () => {
	const { userId } = await auth()

	const { data } = await getPatientById(userId ?? 'N/A')

	return (
		<div className="w-full h-full flex justify-center">
			<div className="max-w-6xl w-full relative pb-10">
				<NewPatient
					data={data ?? undefined}
					type={!data ? 'create' : 'update'}
				/>
			</div>
		</div>
	)
}

export default Registration
