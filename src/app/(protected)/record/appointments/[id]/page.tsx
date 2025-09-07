import { AppointmentDetails } from '@/components/appointment/appointment-details'
import AppointmentQuickLinks from '@/components/appointment/appointment-quick-links'
import { BillsContainer } from '@/components/appointment/bills-container'
import ChartContainer from '@/components/appointment/chart-container'
import { DiagnosisContainer } from '@/components/appointment/diagnosis-container'
import { PatientDetailsCard } from '@/components/appointment/patient-details-card'
import { PaymentsContainer } from '@/components/appointment/payment-container'
import { VitalSigns } from '@/components/appointment/vital-signs'
import { MedicalHistoryContainer } from '@/components/medical-history-container'
import { getAppointmentWithMedicalRecordsById } from '@/utils/services/appointment'

const AppointmentDetailsPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
	const { id } = await params
	const search = await searchParams
	const cat = (search?.cat as string) || 'charts'

	const { data } = await getAppointmentWithMedicalRecordsById(Number(id))

	if (!data) {
		return (
			<div className="p-6">
				<p className="text-red-600">Appointment not found or failed to load data.</p>
			</div>
		)
	}

	const {
		id: appointmentId,
		patient_id,
		doctor_id,
		appointment_date,
		note,
		time,
		patient, // ✅ assumed to be included by `getAppointmentWithMedicalRecordsById`
	} = data

	return (
		<div className="flex p-6 flex-col-reverse lg:flex-row w-full min-h-screen gap-10">
			{/* LEFT */}
			<div className="w-full lg:w-[65%] flex flex-col gap-6">
				{cat === 'charts' && <ChartContainer id={patient_id} />}
				{cat === 'appointments' && (
					<>
						<AppointmentDetails
							appointment_date={appointment_date}
							id={appointmentId}
							notes={note ?? undefined}
							patient_id={patient_id}
							time={time}
						/>

						<VitalSigns
							doctorId={doctor_id}
							id={id}
							patientId={patient_id}
						/>
					</>
				)}
				{cat === 'diagnosis' && (
					<DiagnosisContainer
						doctorId={doctor_id}
						id={id}
						patientId={patient_id}
					/>
				)}
				{cat === 'medical-history' && (
					<MedicalHistoryContainer
						id={id}
						patientId={patient_id}
					/>
				)}
				{cat === 'billing' && <BillsContainer id={id} />}
				{cat === 'payments' && <PaymentsContainer patientId={patient_id} />}
			</div>

			{/* RIGHT */}
			<div className="flex-1 space-y-6">
				<AppointmentQuickLinks staffId={doctor_id} />
				{patient ? (
					<PatientDetailsCard data={patient} />
				) : (
					<p className="text-gray-500">No patient data available.</p>
				)}
			</div>
		</div>
	)
}

export default AppointmentDetailsPage
