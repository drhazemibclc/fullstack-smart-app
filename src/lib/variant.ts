import type { Variants } from 'framer-motion'

export const fadeInVariant: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: [0.42, 0, 0.58, 1], // easeInOut alternative
		},
	},
}

export const scaleUp: Variants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: [0.42, 0, 0.58, 1],
		},
	},
}
