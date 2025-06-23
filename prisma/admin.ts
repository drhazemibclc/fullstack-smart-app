
// prisma/seed.ts or scripts/seed.ts

import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
	const email = process.env.ADMIN_EMAIL || 'hazem032012@gmail.com';
	const password = process.env.ADMIN_PASSWORD || 'Health24';
	const name = process.env.ADMIN_NAME || 'Hazem Ali';

	console.log('Attempting to create admin user...');

	const data = await auth.api.signUpEmail({
		body: {
			email,
			password,
			name,
		},
	});

	if (!data || !data.user) {
		console.error('Failed to receive user data after sign-up attempt.');
		throw new Error('Failed to create user');
	}

	console.log(
		`User created successfully: ID - ${data.user.id}, Email - ${data.user.email}`,
	);

	// Prisma update
	await prisma.user.update({
		where: {
			id: data.user.id,
		},
		data: {
			role: 'admin',
		},
	});

	console.log(`User ${data.user.id} role updated to admin.`);
}

seed()
	.catch((error) => {
		console.error('Seed process failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		console.log('Seed process finished. Exiting...');
		process.exit(0);
	});
