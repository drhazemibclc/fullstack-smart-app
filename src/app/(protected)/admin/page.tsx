import { BriefcaseBusiness, BriefcaseMedical, User, Users } from 'lucide-react'

import { AvailableDoctors } from '@/components/available-doctor'
import { AppointmentChart } from '@/components/charts/appointment-chart'
import { emptyAppointmentCounts, StatSummary } from '@/components/charts/stat-summary'
import { StatCard } from '@/components/stat-card'
import { RecentAppointments } from '@/components/tables/recent-appointment'
import { Button } from '@/components/ui/button'
import type { AvailableDoctorProps } from '@/types/data-types'
import { getAdminDashboardStats } from '@/utils/services/admin'

const AdminDashboard = async () => {
	const {
		availableDoctors,
		last5Records,
		appointmentCounts,
		monthlyData,
		totalDoctors,
		totalPatient,
		totalAppointments,
	} = await getAdminDashboardStats()

	const cardData = [
		{
			title: 'Patients',
			value: totalPatient,
			icon: Users,
			className: 'bg-blue-600/15',
			iconClassName: 'bg-blue-600/25 text-blue-600',
			note: 'Total patients',
			link: '/manage-patients',
		},
		{
			title: 'Doctors',
			value: totalDoctors,
			icon: User,
			className: 'bg-rose-600/15',
			iconClassName: 'bg-rose-600/25 text-rose-600',
			note: 'Total doctors',
			link: '/manage-doctors',
		},
		{
			title: 'Appointments',
			value: totalAppointments,
			icon: BriefcaseBusiness,
			className: 'bg-yellow-600/15',
			iconClassName: 'bg-yellow-600/25 text-yellow-600',
			note: 'Total appointments',
			link: '/manage-appointments',
		},
		{
			title: 'Consultation',
			value: appointmentCounts?.COMPLETED,
			icon: BriefcaseMedical,
			className: 'bg-emerald-600/15',
			iconClassName: 'bg-emerald-600/25 text-emerald-600',
			note: 'Total consultation',
			link: '/manage-appointments',
		},
	]

	return (
		<div className="py-6 px-3 flex flex-col xl:flex-row rounded-xl gap-6">
			{/* LEFT */}
			<div className="w-full xl:w-[69%]">
				<div className="bg-white rounded-xl p-4 mb-8">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-lg font-semibold">Statistics</h1>
						<Button
							size={'sm'}
							variant={'outline'}
						>
							{new Date().getFullYear()}
						</Button>
					</div>

					<div className="w-full  flex flex-wrap gap-5">
						{cardData?.map((el, _index) => (
							<StatCard
								className={el.className}
								icon={el.icon}
								iconClassName={el.iconClassName}
								key={el.title}
								link={el.link}
								note={el.note}
								title={el.title}
								value={el.value as number}
							/>
						))}
					</div>
				</div>

				<div className="h-[500px]">
					<AppointmentChart data={monthlyData ?? []} />
				</div>

				<div className="mt-8 rounded-xl bg-white p-4">
					<RecentAppointments data={last5Records ?? []} />
				</div>
			</div>

			{/* RIGHT */}

			<div className="w-full xl:w-[30%]">
				<div className="h-[450px] w-full">
					<StatSummary
						data={appointmentCounts ?? emptyAppointmentCounts}
						total={totalAppointments ?? 0}
					/>
				</div>

				<AvailableDoctors data={availableDoctors as AvailableDoctorProps} />
			</div>
		</div>
	)
}

export default AdminDashboard
