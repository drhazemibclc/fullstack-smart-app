import type { SubArray } from 'better-auth/plugins/access'
import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access'

export type Role = keyof typeof allRoles

export type Permissions = {
	[k in keyof typeof statement]?: SubArray<(typeof statement)[k]>
}

export const statement = {
	task: ['create', 'read', 'update', 'delete'],
	session: defaultStatements.session,
	user: Array.from(new Set(['read', 'unban', 'update', ...defaultStatements.user])),
} as const

export const ac = createAccessControl(statement)

const adminRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	...adminAc.statements,
	session: adminAc.statements.session,
	user: [
		'create',
		'read',
		'update',
		'delete',
		'list',
		'ban',
		'unban',
		'impersonate',
		'set-password',
		'set-role',
	],
})

const doctorRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	...userAc.statements,
})
const nurseRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],

	...userAc.statements,
})
const patientRole = ac.newRole({
	task: ['create', 'read', 'update', 'delete'],
	...userAc.statements,
})

export const allRoles = {
	admin: adminRole,
	doctor: doctorRole,
	nurse: nurseRole,
	patient: patientRole,
} as const

export const rolesData = Object.keys(allRoles) as Array<Role>

export type rolesEnumData = (typeof rolesData)[number]
