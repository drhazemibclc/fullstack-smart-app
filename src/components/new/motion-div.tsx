'use client'

import { type HTMLMotionProps, motion, type Transition, type Variants } from 'framer-motion'
import React from 'react'

interface MotionDivProps extends HTMLMotionProps<'div'> {
	delay?: number
	variants: Variants
	transition?: Transition
}

export const MotionDiv = React.forwardRef<HTMLDivElement, MotionDivProps>(
	(
		{
			delay,
			initial = 'hidden',
			animate = 'visible',
			variants,
			transition,
			className,
			children,
			...rest
		},
		ref,
	) => {
		const mergedTransition: Transition = {
			...transition,
			...(delay !== undefined && { delay }),
		}

		return (
			<motion.div
				animate={animate}
				className={className}
				initial={initial}
				ref={ref}
				transition={mergedTransition}
				variants={variants}
				{...rest}
			>
				{children}
			</motion.div>
		)
	},
)

MotionDiv.displayName = 'MotionDiv'
