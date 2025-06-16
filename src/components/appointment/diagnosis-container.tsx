import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import db from '@/lib/db'
import { checkRole } from '@/utils/roles'

import { AddDiagnosis } from '../dialogs/add-diagnosis'
import { NoDataFound } from '../no-data-found'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { MedicalHistoryCard } from './medical-history-card'

export const DiagnosisContainer = async ({
	patientId,
	doctorId,
	id,
}: {
	patientId: string
	doctorId: string
	id: string
}) => {
	const { userId } = await auth()

	if (!userId) redirect('/sign-in')

	const data = await db.medicalRecords.findFirst({
		where: { appointment_id: Number(id) },
		include: {
			diagnosis: {
				include: { doctor: true },
				orderBy: { created_at: 'desc' },
			},
		},
		orderBy: { created_at: 'desc' },
	})

	const diagnosis = data?.diagnosis || null
	const isPatient = await checkRole('PATIENT')

	return (
		<div>
			{diagnosis?.length === 0 || !diagnosis ? (
				<div className="flex flex-col items-center justify-center mt-20">
					<NoDataFound note="No diagnosis found" />
					<AddDiagnosis
						appointmentId={id}
						doctorId={doctorId}
						key={Date.now()}
						medicalId={data?.id.toString() || ''}
						patientId={patientId}
					/>
				</div>
			) : (
				<section className="space-y-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Medical Records</CardTitle>

							{!isPatient && (
								<AddDiagnosis
									appointmentId={id}
									doctorId={doctorId}
									key={Date.now()}
									medicalId={data?.id.toString() || ''}
									patientId={patientId}
								/>
							)}
						</CardHeader>

						<CardContent className="space-y-8">
							{diagnosis?.map((record, id) => (
								<div key={record.id}>
									<MedicalHistoryCard
										index={id}
										record={record}
									/>
								</div>
							))}
						</CardContent>
					</Card>
				</section>
			)}
		</div>
	)
}
