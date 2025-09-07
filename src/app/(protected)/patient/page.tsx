import { currentUser } from '@clerk/nextjs/server'
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AvailableDoctors } from '@/components/available-doctor'
import { AppointmentChart } from '@/components/charts/appointment-chart'
import { StatSummary } from '@/components/charts/stat-summary'
import { PatientRatingContainer } from '@/components/patient-rating-container'
import { StatCard } from '@/components/stat-card'
import { RecentAppointments } from '@/components/tables/recent-appointment'
import { Button } from '@/components/ui/button'
import type { AvailableDoctorProps } from '@/types/data-types'
import { getPatientDashboardStatistics } from '@/utils/services/patient'

const PatientDashboard = async () => {
	const user = await currentUser()

	const { data, appointmentCounts, last5Records, totalAppointments, availableDoctor, monthlyData } =
		user?.id
			? await getPatientDashboardStatistics(user.id)
			: {
					data: null,
					appointmentCounts: null,
					last5Records: [],
					totalAppointments: 0,
					availableDoctor: [],
					monthlyData: [],
				}

	if (user && !data) {
		redirect('/patient/registration')
	}

	if (!data) return null

	const cardData = [
		{
			title: 'appointments',
			value: totalAppointments,
			icon: Briefcase,
			className: 'bg-blue-600/15',
			iconClassName: 'bg-blue-600/25 text-blue-600',
			note: 'Total appointments',
		},
		{
			title: 'cancelled',
			value: appointmentCounts?.CANCELLED,
			icon: Briefcase,
			className: 'bg-rose-600/15',
			iconClassName: 'bg-rose-600/25 text-rose-600',
			note: 'Cancelled Appointments',
		},
		{
			title: 'pending',
			value: (appointmentCounts?.PENDING ?? 0) + (appointmentCounts?.SCHEDULED ?? 0),
			icon: BriefcaseBusiness,
			className: 'bg-yellow-600/15',
			iconClassName: 'bg-yellow-600/25 text-yellow-600',
			note: 'Pending Appointments',
		},
		{
			title: 'completed',
			value: appointmentCounts?.COMPLETED,
			icon: BriefcaseMedical,
			className: 'bg-emerald-600/15',
			iconClassName: 'bg-emerald-600/25 text-emerald-600',
			note: 'Successfully appointments',
		},
	]

	return (
		<div className="py-6 px-3 flex flex-col rounded-xl xl:flex-row gap-6">
			{/* LEFT */}
			<div className="w-full xl:w-[69%]">
				<div className="bg-white rounded-xl p-4 mb-8">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-lg xl:text-2xl font-semibold">
							Welcome {data?.firstName || user?.firstName}
						</h1>

						<div className="space-x-2">
							<Button size={'sm'}>{new Date().getFullYear()}</Button>
							<Button
								className="hover:underline"
								size="sm"
								variant="outline"
							>
								<Link href="/patient/self">View Profile</Link>
							</Button>
						</div>
					</div>

					<div className="w-full flex flex-wrap gap-5">
						{cardData?.map(el => (
							<StatCard
								key={el.title}
								{...el}
								link="#"
							/>
						))}
					</div>
				</div>

				<div className="h-[500px]">
					<AppointmentChart data={monthlyData} />
				</div>

				<div className="bg-white rounded-xl p-4 mt-8">
					<RecentAppointments data={last5Records} />
				</div>
			</div>

			{/* RIGHT */}
			<div className="w-full xl:w-[30%]">
				<div className="w-full h-[450px] mb-8">
					<StatSummary
						data={appointmentCounts}
						total={totalAppointments}
					/>
				</div>

				<AvailableDoctors data={availableDoctor as AvailableDoctorProps} />

				<PatientRatingContainer />
			</div>
		</div>
	)
}

export default PatientDashboard
