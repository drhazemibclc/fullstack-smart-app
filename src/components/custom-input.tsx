import type React from 'react'
import type { Control } from 'react-hook-form'

import { Checkbox } from './ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'

interface InputProps {
	type: 'input' | 'select' | 'checkbox' | 'switch' | 'radio' | 'textarea'
	control: Control<any>
	name: string
	label?: string
	placeholder?: string
	inputType?: 'text' | 'email' | 'password' | 'date'
	selectList?: { label: string; value: string }[]
	defaultValue?: string
}

const RenderInput = ({ field, props }: { field: any; props: InputProps }) => {
	switch (props.type) {
		case 'input':
			return (
				<FormControl>
					<Input
						placeholder={props.placeholder}
						type={props.inputType}
						{...field}
					/>
				</FormControl>
			)

		case 'select':
			return (
				<Select
					onValueChange={field.onChange}
					value={field?.value}
				>
					<FormControl>
						<SelectTrigger>
							<SelectValue placeholder={props.placeholder} />
						</SelectTrigger>
					</FormControl>
					<SelectContent>
						{props.selectList?.map((i, id) => (
							<SelectItem
								key={id}
								value={i.value}
							>
								{i.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)

		case 'checkbox':
			return (
				<div className="items-top flex space-x-2">
					<Checkbox
						id={props.name}
						onCheckedChange={e => field.onChange(e === true || null)}
					/>
					<div className="grid gap-1.5 leading-none">
						<label
							className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							htmlFor={props.name}
						>
							{props.label}
						</label>
						<p className="text-sm text-muted-foreground">{props.placeholder}</p>
					</div>
				</div>
			)

		case 'radio':
			return (
				<div className="w-full">
					<FormLabel>{props.label}</FormLabel>
					<RadioGroup
						className="flex gap-4"
						defaultValue={props.defaultValue}
						onChange={field.onChange}
					>
						{props?.selectList?.map((i, id) => (
							<div
								className="flex items-center w-full"
								key={id}
							>
								<RadioGroupItem
									className="peer sr-only"
									id={i.value}
									value={i.value}
								/>
								<Label
									className="flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600"
									htmlFor={i.value}
								>
									{i.label}
								</Label>
							</div>
						))}
					</RadioGroup>
				</div>
			)

		case 'textarea':
			return (
				<FormControl>
					<Textarea
						placeholder={props.placeholder}
						type={props.inputType}
						{...field}
					/>
				</FormControl>
			)
	}
}
export const CustomInput = (props: InputProps) => {
	const { name, label, control, type } = props

	return (
		// <div className="w-full pt-6">
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="w-full">
					{type !== 'radio' && type !== 'checkbox' && <FormLabel>{label}</FormLabel>}
					<RenderInput
						field={field}
						props={props}
					/>
					<FormMessage />
				</FormItem>
			)}
		/>
		// </div>
	)
}

type Day = {
	day: string
	start_time?: string
	close_time?: string
}
interface SwitchProps {
	data: { label: string; value: string }[]
	setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>
}

export const SwitchInput = ({ data, setWorkSchedule }: SwitchProps) => {
	const handleChange = (day: string, field: any, value: string) => {
		setWorkSchedule(prevDays => {
			const dayExist = prevDays.find(d => d.day === day)

			if (dayExist) {
				return prevDays.map(d => (d.day === day ? { ...d, [field]: value } : d))
			}
			if (field === true) {
				return [...prevDays, { day, start_time: '09:00', close_time: '17:00' }]
			}
			return [...prevDays, { day, [field]: value }]
		})
	}

	return (
		<div className="">
			{data?.map((el, id) => (
				<div
					className="w-full  flex items-center space-y-3 border-t border-t-gray-200  py-3"
					key={id}
				>
					<Switch
						className="data-[state=checked]:bg-blue-600 peer"
						id={el.value}
						onCheckedChange={_e => handleChange(el.value, true, '09:00')}
					/>
					<Label
						className="w-20 capitalize"
						htmlFor={el.value}
					>
						{el.value}
					</Label>

					<Label className="text-gray-400 font-normal italic peer-data-[state=checked]:hidden pl-10">
						Not working on this day
					</Label>

					<div className="hidden peer-data-[state=checked]:flex items-center gap-2 pl-6:">
						<Input
							defaultValue="09:00"
							name={`${el.label}.start_time`}
							onChange={e => handleChange(el.value, 'start_time', e.target.value)}
							type="time"
						/>
						<Input
							defaultValue="17:00"
							name={`${el.label}.close_time`}
							onChange={e => handleChange(el.value, 'close_time', e.target.value)}
							type="time"
						/>
					</div>
				</div>
			))}
		</div>
	)
}
