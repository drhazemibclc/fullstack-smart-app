export const GENDER = [
	{ label: 'Male', value: 'MALE' },
	{ label: 'Female', value: 'FEMALE' },
]

export const MARITAL_STATUS = [
	{ label: 'Single', value: 'SINGLE' },
	{ label: 'Married', value: 'MARRIED' },
	{ label: 'Divorced', value: 'DIVORCED' },
	{ label: 'Widowed', value: 'WIDOWED' },
	{ label: 'Separated', value: 'SEPARATED' },
]

export const RELATION = [
	{ value: 'mother', label: 'Mother' },
	{ value: 'father', label: 'Father' },
	{ value: 'husband', label: 'Husband' },
	{ value: 'wife', label: 'Wife' },
	{ value: 'other', label: 'Other' },
]

export const USER_ROLES = {
	ADMIN: 'ADMIN' as string,
	DOCTOR: 'DOCTOR',
	NURSE: 'NURSE',
	PATIENT: 'PATIENT',
}

export const ADMIN_ROLES = new Set<string>(['ADMIN', 'DOCTOR'])

import { z } from 'zod';

export const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).min(2).max(50),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password must be at most 50 characters long' }),
});

export const loginSchema = formSchema.pick({
  email: true,
  password: true,
});

export const signUpSchema = formSchema.pick({
  email: true,
  name: true,
  password: true,
});
