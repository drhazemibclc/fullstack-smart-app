import Image from 'next/image'

import { cn } from '@/lib/utils'
import { getInitials } from '@/utils'

export const ProfileImage = ({
	url,
	name,
	className,
	textClassName,
	bgColor,
}: {
	url?: string
	name: string
	className?: string
	textClassName?: string
	bgColor?: string
}) => {
	if (url)
		return (
			<Image
				alt={name}
				className={cn('flex md:hidden lg:block w-10 h-10 rounded-full object-cover', className)}
				height={40}
				src={url}
				width={40}
			/>
		)

	if (name) {
		return (
			<div
				className={cn(
					'flex md:hidden lg:flex w-10 h-10 rounded-full text-white text-base items-center justify-center font-light',
					className,
				)}
				style={{ backgroundColor: bgColor || '#2563eb' }}
			>
				<p className={textClassName}>{getInitials(name)}</p>
			</div>
		)
	}
}
