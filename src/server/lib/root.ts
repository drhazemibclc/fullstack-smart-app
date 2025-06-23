import { adminRouter } from '../routers/admin'
import { appointmentRouter } from '../routers/appointment'
import { authRouter } from '../routers/auth'
import { doctorRouter } from '../routers/doctor'
import { reviewRouter } from '../routers/general'
import { growthRouter } from '../routers/growth'
import { medicalRouter } from '../routers/medical'
import { medicalRecordRouter } from '../routers/medicalRecord'
import { patientRouter } from '../routers/patient'
import { paymentRouter } from '../routers/payment'
import { postRouter } from '../routers/post'
import { staffRouter } from '../routers/staff'
import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	check: publicProcedure.query(() => {
		return {
			ok: true,
			message: 'API is healthy',
			timestamp: new Date().toISOString(),
		}
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: 'This is private',
			user: ctx.session.user,
		}
	}),
	admin: adminRouter,
	appointment: appointmentRouter,
	auth: authRouter,
	doctor: doctorRouter,
	growth: growthRouter,
	medical: medicalRouter,
	medicalRecord: medicalRecordRouter,
	patient: patientRouter,
	payment: paymentRouter,
	post: postRouter,
	review: reviewRouter,
	staff: staffRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
