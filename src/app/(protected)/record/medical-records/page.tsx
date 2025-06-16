import type { Diagnosis, LabTest, MedicalRecords, Patient } from '@prisma/client'
import { format } from 'date-fns'
import { BriefcaseBusiness } from 'lucide-react'

import { ViewAction } from '@/components/action-options'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import type { SearchParamsProps } from '@/types'
import { DATA_LIMIT } from '@/utils/seetings'
import { getMedicalRecords } from '@/utils/services/medical-record'

const columns = [
	{ header: 'No', key: 'no' },
	{ header: 'Info', key: 'name' },
	{ header: 'Date & Time', key: 'medical_date', className: 'hidden md:table-cell' },
	{ header: 'Doctor', key: 'doctor', className: 'hidden 2xl:table-cell' },
	{ header: 'Diagnosis', key: 'diagnosis', className: 'hidden lg:table-cell' },
	{ header: 'Lab Test', key: 'lab_test', className: 'hidden xl:table-cell' },
	{ header: 'Action', key: 'action' },
]

interface ExtendedProps extends MedicalRecords {
	patient: Patient
	diagnosis: Diagnosis[]
	lab_test: LabTest[]
}

const MedicalRecordsPage = async (props: SearchParamsProps) => {
	const searchParams = await props.searchParams
	const page = (searchParams?.p || '1') as string
	const searchQuery = (searchParams?.q || '') as string
	const { data, totalPages, totalRecords, currentPage } = await getMedicalRecords({
		page,
		search: searchQuery,
	})

	if (!data || data.length === 0) return null

	const renderRow = (item: ExtendedProps) => {
		const patient = item.patient
		const name = `${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`

		return (
			<tr
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
				key={item.id}
			>
				<td className="flex items-center gap-4 p-4">
					<ProfileImage
						bgColor={patient?.colorCode ?? '#ccc'}
						name={name}
						textClassName="text-black"
						url={patient?.img ?? ''}
					/>
					<div>
						<h3 className="uppercase">{name}</h3>
						<span className="text-sm capitalize">{patient?.gender ?? 'Unknown'}</span>
					</div>
				</td>

				<td className="hidden md:table-cell">
					{item.created_at ? format(item.created_at, 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
				</td>

				<td className="hidden 2xl:table-cell">{item.doctor_id}</td>

				<td className="hidden lg:table-cell">
					{item.diagnosis?.length > 0 ? (
						<span>{item.diagnosis.length}</span>
					) : (
						<span className="text-gray-400 italic">No diagnosis</span>
					)}
				</td>

				<td className="hidden xl:table-cell">
					{item.lab_test?.length > 0 ? (
						<span>{item.lab_test.length}</span>
					) : (
						<span className="text-gray-400 italic">No lab test</span>
					)}
				</td>

				<td>
					<ViewAction href={`/appointments/${item.appointment_id}`} />
				</td>
			</tr>
		)
	}

	return (
		<div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
			<div className="flex items-center justify-between">
				<div className="hidden lg:flex items-center gap-1">
					<BriefcaseBusiness
						className="text-gray-500"
						size={20}
					/>
					<p className="text-2xl font-semibold">{totalRecords}</p>
					<span className="text-gray-600 text-sm xl:text-base">total records</span>
				</div>

				<div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
					<SearchInput />
				</div>
			</div>

			<div className="mt-4">
				<Table
					columns={columns}
					data={data}
					renderRow={renderRow}
				/>
				<Pagination
					currentPage={currentPage}
					limit={DATA_LIMIT}
					totalPages={totalPages}
					totalRecords={totalRecords}
				/>
			</div>
		</div>
	)
}

export default MedicalRecordsPage
