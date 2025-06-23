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

export const ADMIN_ROLES = new Set<string>(['ADMIN', 'DOCTOR']);
