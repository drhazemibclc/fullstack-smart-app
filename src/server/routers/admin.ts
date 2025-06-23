import { TRPCError } from '@trpc/server';

import {
  PatientCreateCombinedInputSchema,
  PatientUpdateCombinedInputSchema,
  SuccessOutputSchema,
} from '@/lib/schema';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/lib/trpc';
import { processAppointments } from '@/types/helper'; // Ensure this path is correct
import { daysOfWeek } from '@/utils'; // Ensure this path is correct

export const adminRouter = createTRPCRouter({
  createNewStaff: publicProcedure // Consider making this protected or adminProcedure if only authorized users can create
    .input(PatientCreateCombinedInputSchema)
    .output(SuccessOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: patientData, pid } = input;
      let patientId: string = pid; // Initialize patientId with pid

      try {
        if (pid === 'new-patient') {
          // Create a new user account if pid is "new-patient"
          const user = await ctx.auth.api.createUser({
            body: {
              email: patientData.email ?? '', // Ensure email is always a string
              name: `${patientData.firstName} ${patientData.lastName}`, // Use firstName/last_name from schema
              password: patientData.phone, // WARNING: Using phone as password is highly insecure. Consider a proper password generation/reset flow.
              role: 'patient', // This `role` property seems to be accepted by `createUser`
            },
          });
          patientId = user.user.id; // Get the new user's ID
        } else {
          // If pid is an existing ID, update the user's role to "patient"
          // ERROR FIX: `updateUser` body likely doesn't accept 'role' directly.
          // You need to check your `better-auth` docs for how to update roles.
          // For now, removing the 'role' field as it's causing the TS error.
          // If `id` is part of `body` for update, ensure it's passed.
          // If the role update is critical, you might need a separate call or a different `auth.api` method.
          await ctx.auth.api.updateUser({
            body: {
              // Only include properties accepted by AdditionalUserFieldsInput
              // If `role` update is needed for existing user, find the proper method in your auth lib
            },
          });
        }

        // Create the patient record in the database
        await ctx.db.patient.create({
          data: {
            // Required fields mapped from patientData (from Zod PatientFormSchema)
            id: patientId, // Link the patient record to the user ID
            address: patientData.address, // Assuming address is always required based on the model
            allergies: patientData.allergies ?? null,
            bloodGroup: patientData.bloodGroup ?? null,
            colorCode: patientData.colorCode ?? null,

            // Handle dateOfBirth: Convert string from Zod to Date for Prisma
            // Your Prisma model shows dateOfBirth as `DateTime`, which is not nullable.
            // This means `dateOfBirth` MUST be provided by the Zod schema.
            // If it's truly optional in the form but required in DB, you need a default or pre-fill.
            dateOfBirth: patientData.dateOfBirth // Assuming PatientFormSchema makes this required
              ? new Date(patientData.dateOfBirth)
              : new Date(), // Fallback: provide a default date if not present (adjust as needed)

            // Optional fields - provide them if they exist in patientData, otherwise they'll be undefined (Prisma will set to null)
            email: patientData.email, // email is String? in Prisma, so can be null/undefined
            firstName: patientData.firstName,
            gender: patientData.gender, // gender is GENDER, ensure it's a valid enum value

            img: patientData.img ?? null,
            lastName: patientData.lastName,
            medicalConditions: patientData.medicalConditions ?? null,
            medicalHistory: patientData.medicalHistory ?? null,

            // Other optional fields from your Patient model.
            // Ensure these are either made optional in your Zod schema (z.string().optional())
            // or are given default values if they are omitted from the form.
            parentGuardianEmail: patientData.parentGuardianEmail ?? null,
            // Required fields from your Prisma model that MUST be provided
            // These were not in your original PatientFormSchema snippet,
            // so you'll need to ensure they are added to your Zod schema and form.
            parentGuardianName: patientData.parentGuardianName, // You'll need to add this to PatientFormSchema
            parentGuardianPhone: patientData.parentGuardianPhone, // You'll need to add this to PatientFormSchema
            phone: patientData.phone,
            relationToPatient: patientData.relationToPatient, // You'll need to add this to PatientFormSchema
            // Do NOT include relationships (like emergencyContacts, appointments) directly in `create.data` unless you are creating them simultaneously using nested writes.
            // The `createdAt` and `updatedAt` fields are handled by `@default(now())` and `@updatedAt` in Prisma.
          },
        });
        return {
          msg: 'Patient created successfully',
        };
      } catch (error: unknown) {
        console.error('tRPC - Create patient error:', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to create patient',
        });
      }
    }),
  // --- getAdminDashboardStats ---
  // Protected procedure as it should only be accessible by authenticated admins
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Prisma transactions are handled differently.
      // You perform operations and then if needed, wrap them in a Prisma.$transaction block
      // if you need atomicity for multiple write operations.
      // For reads, sequential awaits are often fine unless you need specific isolation levels.

      const [
        totalPatientCount,
        totalDoctorsCount,
        allAppointments,
        availableDoctorsData,
      ] = await ctx.db.$transaction(async (prisma) => {
        // Use 'prisma' as the client within transaction
        // Prisma count for patients
        const patientsCount = await prisma.patient.count();

        // Prisma count for doctors
        const doctorsCount = await prisma.doctor.count();

        // Fetch all appointments with related patient and doctor info
        const appointmentsResult = await prisma.appointment.findMany({
          include: {
            doctor: {
              select: {
                colorCode: true,
                img: true,
                // Use 'select' for specific columns in Prisma
                name: true,
                specialization: true,
              },
            },
            patient: {
              select: {
                // Use 'select' for specific columns in Prisma
                id: true,
                colorCode: true,
                dateOfBirth: true,
                firstName: true,
                gender: true,
                img: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            // Prisma orderBy syntax
            appointmentDate: 'desc',
          },
        });

        // Fetch available doctors
        const todayDate = new Date().getDay(); // getDay() returns 0 for Sunday, 1 for Monday, etc.
        const today = daysOfWeek[todayDate] ?? 'Sunday'; // Make sure daysOfWeek maps 0 to 'Sunday', etc.

        const doctorsResult = await prisma.doctor.findMany({
          select: {
            // Use 'select' for specific columns in Prisma
            id: true,
            colorCode: true,
            img: true,
            name: true,
            specialization: true,
            // If you need workingDays data, you'd include it here
            // workingDays: {
            //     select: {
            //         day: true,
            //     },
            //     where: {
            //         day: today, // Only include the matched working day
            //     },
            // },
          },
          take: 5, // Prisma equivalent of Drizzle's limit
          where: {
            workingDays: {
              some: {
                // 'some' for checking if at least one related record matches
                day: today,
              },
            },
          },
        });
        return [patientsCount, doctorsCount, appointmentsResult, doctorsResult];
      });

      // Process appointments (assuming `processAppointments` is compatible with Prisma results)
      // Ensure your `Appointment` interface in `types/helper.ts` matches Prisma's Appointment type.
      // Prisma's Appointment type will have `appointmentDate: Date` and `status: string`.
      const { appointmentCounts, monthlyData } =
        await processAppointments(allAppointments);

      const last5Records = allAppointments.slice(0, 5);

      return {
        appointmentCounts,
        availableDoctors: availableDoctorsData,
        last5Records,
        monthlyData,
        totalAppointments: allAppointments.length,
        totalDoctors: totalDoctorsCount,
        totalPatient: totalPatientCount,
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw new Error(
        'Something went wrong while fetching dashboard statistics.'
      );
    }
  }),

  // --- getServices ---
  // Publicly accessible as services might be needed by various roles, but keep it in admin if it's primarily an admin function
  getServices: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.service.findMany({
        orderBy: {
          // Prisma orderBy syntax
          serviceName: 'asc',
        },
      });

      if (!data || data.length === 0) {
        return {
          data: [],
          message: 'No services found.',
        };
      }

      return {
        data,
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('Internal Server Error: Failed to fetch services.');
    }
  }),

  update: publicProcedure // Consider if this should be 'protectedProcedure' or 'adminProcedure'
    .input(PatientUpdateCombinedInputSchema) // This schema should be defined as per previous discussions
    .output(SuccessOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: patientData, pid } = input;

      try {
        // --- Update user's name via auth service ---
        // IMPORTANT: Confirm if ctx.auth.api.updateUser can update first/last name,
        // and if it requires the user's ID (`pid`) directly in the 'body' or as a separate argument.
        // Assuming it's `id: pid` and fields are camelCase for auth system.
        if (
          patientData.firstName !== undefined ||
          patientData.lastName !== undefined
        ) {
          await ctx.auth.api.updateUser({
            body: {
              firstName: patientData.firstName, // Map from Zod's snakeCase to auth system's camelCase
              lastName: patientData.lastName, // Map from Zod's snakeCase to auth system's camelCase
              // Do NOT include `role` here unless your `auth.api.updateUser` specifically accepts it in `body`.
              // As per previous discussion, `role` usually isn't part of `AdditionalUserFieldsInput`.
            },
          });
        }

        // --- Update patient record in the database ---
        // Only update fields that are explicitly provided in patientData.
        await ctx.db.patient.update({
          data: {
            // Map fields from `patientData` (from Zod schema) to Prisma model fields
            // Ensure `patientData.propertyName` (from Zod) maps to `prismaModelPropertyName` (Prisma)

            // Address
            address: patientData.address,
            allergies: patientData.allergies,
            // Medical/Other Optional fields (ensure these are z.string().optional() in your Zod schema if not always sent)
            bloodGroup: patientData.bloodGroup,

            colorCode: patientData.colorCode,
            // Personal details
            // Handle dateOfBirth: Convert string from Zod to Date for Prisma
            // Make sure dateOfBirth in Prisma model is nullable (DateTime?) if it can be optional here.
            // If it's NOT nullable in Prisma, and `patientData.dateOfBirth` can be undefined,
            // you *must* provide a valid Date, or change Prisma schema to `DateTime?`.
            dateOfBirth: patientData.dateOfBirth // From Zod: string | undefined
              ? new Date(patientData.dateOfBirth)
              : undefined, // If undefined/null from input, leave as undefined so Prisma doesn't try to update it.

            email: patientData.email, // Can be null as per Prisma schema
            // Basic contact info
            firstName: patientData.firstName,
            // If Prisma field is non-nullable, this needs to be a Date or removed if not updated.
            gender: patientData.gender, // Ensure GENDER enum values are correctly handled
            img: patientData.img,

            lastName: patientData.lastName,
            medicalConditions: patientData.medicalConditions,
            medicalHistory: patientData.medicalHistory,
            parentGuardianEmail: patientData.parentGuardianEmail,

            // Parent/Guardian (required in Prisma Patient model, ensure they're in PatientFormSchema.partial())
            parentGuardianName: patientData.parentGuardianName,
            parentGuardianPhone: patientData.parentGuardianPhone,
            phone: patientData.phone,
            relationToPatient: patientData.relationToPatient,
            // Prisma handles createdAt and updatedAt automatically.
            // Do NOT include relation fields here unless you're doing nested updates.
          },
          where: { id: pid },
        });

        return {
          msg: 'Patient info updated successfully',
        };
      } catch (error: unknown) {
        // Use 'unknown' for safer error handling
        console.error('tRPC - Update patient error:', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update patient info',
        });
      }
    }),
});
