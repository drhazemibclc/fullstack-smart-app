import type { Patient, Payment } from '@prisma/client'
import { format } from 'date-fns'
import { ReceiptText } from 'lucide-react'

import { ActionDialog } from '@/components/action-dialog'
import { ViewAction } from '@/components/action-options'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { cn } from '@/lib/utils'
import type { SearchParamsProps } from '@/types'
import { checkRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'
import { getPaymentRecords } from '@/utils/services/payments'

const columns = [
	{ header: 'RNO', key: 'id' },
	{ header: 'Patient', key: 'info' },
	{ header: 'Contact', key: 'phone', className: 'hidden md:table-cell' },
	{ header: 'Bill Date', key: 'bill_date', className: 'hidden md:table-cell' },
	{ header: 'Total', key: 'total', className: 'hidden xl:table-cell' },
	{ header: 'Discount', key: 'discount', className: 'hidden xl:table-cell' },
	{ header: 'Payable', key: 'payable', className: 'hidden xl:table-cell' },
	{ header: 'Paid', key: 'paid', className: 'hidden xl:table-cell' },
	{ header: 'Status', key: 'status', className: 'hidden xl:table-cell' },
	{ header: 'Actions', key: 'action' },
]

interface ExtendedProps extends Payment {
	patient: Patient
}

const BillingPage = async (props: SearchParamsProps) => {
	const searchParams = await props.searchParams
	const page = (searchParams?.p || '1') as string
	const searchQuery = (searchParams?.q || '') as string

	const { data, totalPages, totalRecords, currentPage } = await getPaymentRecords({
		page,
		search: searchQuery,
	})

	const isAdmin = await checkRole('ADMIN')

	if (!data || data.length === 0) return null

	const renderRow = (item: ExtendedProps) => {
		const patient = item.patient
		const name = `${patient.first_name} ${patient.last_name}`
		const payable = item.total_amount - item.discount

		return (
			<tr
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
				key={item.id}
			>
				<td># {item.id}</td>
				<td className="flex items-center gap-4 p-4">
					<ProfileImage
						bgColor={patient.colorCode ?? undefined}
						name={name}
						textClassName="text-black"
						url={patient.img ?? undefined}
					/>
					<div>
						<h3 className="uppercase">{name}</h3>
						<span className="text-sm capitalize">{patient.gender}</span>
					</div>
				</td>
				<td className="hidden md:table-cell">{patient.phone}</td>
				<td className="hidden md:table-cell">{format(item.bill_date, 'yyyy-MM-dd')}</td>
				<td className="hidden xl:table-cell">{item.total_amount.toFixed(2)}</td>
				<td className="hidden xl:table-cell">{item.discount.toFixed(2)}</td>
				<td className="hidden xl:table-cell">{payable.toFixed(2)}</td>
				<td className="hidden xl:table-cell">{item.amount_paid.toFixed(2)}</td>
				<td className="hidden xl:table-cell">
					<span
						className={cn(
							item.status === 'UNPAID'
								? 'text-red-600'
								: item.status === 'PAID'
									? 'text-emerald-600'
									: 'text-gray-600',
						)}
					>
						{item.status}
					</span>
				</td>
				<td>
					<ViewAction href={`/appointments/${item.appointment_id}?cat=bills`} />
					{isAdmin && (
						<ActionDialog
							deleteType="payment"
							id={item.id.toString()}
							type="delete"
						/>
					)}
				</td>
			</tr>
		)
	}

	return (
		<div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
			<div className="flex items-center justify-between">
				<div className="hidden lg:flex items-center gap-1">
					<ReceiptText
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

export default BillingPage
