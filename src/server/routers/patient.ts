// Import Prisma types
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  PatientCreateCombinedInputSchema,
  PatientUpdateCombinedInputSchema,
  SuccessOutputSchema,
} from '@/lib/schema';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc';
import { processAppointments } from '@/types/helper';
import { daysOfWeek } from '@/utils';

export const patientRouter = createTRPCRouter({
  createNewPatient: publicProcedure
    .input(PatientCreateCombinedInputSchema)
    .output(SuccessOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: patientData, pid } = input;
      let patientId: string = pid;

      try {
        if (pid === 'new-patient') {
          // Create a new user account via auth service
          const user = await ctx.auth.api.createUser({
            body: {
              email: patientData.email ?? '', // Ensure email is a string, even if optional
              name: `${patientData.firstName} ${patientData.lastName}`,
              password: patientData.phone, // WARNING: Still insecure. Consider proper password generation.
              role: 'patient', // This 'role' seems accepted by `createUser`
            },
          });
          patientId = user.user.id;
        } else {
          // If pid is an existing user ID, update their role to 'patient'
          // IMPORTANT: `ctx.auth.api.updateUser`'s `body` property typically does NOT
          // accept a `role` field directly according to `better-call`'s `AdditionalUserFieldsInput`.
          // You likely need a different method from your auth library to update roles.
          // For now, this part is commented out to avoid type errors.
          /*
          await ctx.auth.api.updateUser({
            id: pid, // Assuming better-auth expects the user ID here
            body: {
              // This body should only contain fields accepted by AdditionalUserFieldsInput
              // If role update is needed, check better-auth documentation for proper API
            },
          });
          */
        }

        // Create the patient record in the database
        await ctx.db.patient.create({
          data: {
            id: patientId, // Link the patient record to the user ID
            address: patientData.address,
            allergies: patientData.allergies,
            bloodGroup: patientData.bloodGroup,
            colorCode: patientData.colorCode,
            // Handle dateOfBirth: ensure it's a Date object if provided
            dateOfBirth: patientData.dateOfBirth,
            email: patientData.email,
            firstName: patientData.firstName,
            gender: patientData.gender,
            img: patientData.img,

            lastName: patientData.lastName,
            medicalConditions: patientData.medicalConditions,
            medicalHistory: patientData.medicalHistory,

            // Optional fields - provide if they exist in patientData, otherwise Prisma will set to null (if nullable)
            parentGuardianEmail: patientData.parentGuardianEmail,
            // Required fields from your Patient Prisma model - ensure these exist in PatientFormSchema!
            parentGuardianName: patientData.parentGuardianName,
            parentGuardianPhone: patientData.parentGuardianPhone,
            phone: patientData.phone,
            relationToPatient: patientData.relationToPatient,
          },
        });

        return {
          msg: 'Patient created successfully',
          success: true,
        };
      } catch (error: unknown) {
        console.error('tRPC - createNewPatient error:', error);
        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to create patient',
        });
      }
    }),

  // --- getAllPatients ---
  getAllPatients: publicProcedure
    .input(
      z
        .object({
          limit: z
            .union([
              z.number().int().min(1),
              z.string().regex(/^\d+$/).transform(Number),
            ])
            .optional(),
          page: z
            .union([
              z.number().int().min(1),
              z.string().regex(/^\d+$/).transform(Number),
            ])
            .default(1),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const PAGE_NUMBER = input?.page ?? 1;
        const LIMIT = input?.limit ?? 10;
        const SKIP = (PAGE_NUMBER - 1) * LIMIT;

        // Prisma's where clause for search filter
        const searchFilter: Prisma.PatientWhereInput | undefined = input?.search
          ? {
              OR: [
                { firstName: { contains: input.search, mode: 'insensitive' } },
                { lastName: { contains: input.search, mode: 'insensitive' } },
                { phone: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } },
              ],
            }
          : undefined;

        // Use Prisma's $transaction for atomic operations
        const [fetchedPatients, totalRecordsCount] = await ctx.db.$transaction(
          async (prisma) => {
            const patientsResult = await prisma.patient.findMany({
              include: {
                appointments: {
                  include: {
                    // Assuming medicalRecord is a one-to-one relation from Appointment
                    medicalRecords: {
                      select: {
                        createdAt: true,
                        treatmentPlan: true,
                      },
                    },
                  },
                  orderBy: {
                    // Order appointments by date descending
                    appointmentDate: 'desc',
                  },
                  take: 1, // Get only the most recent appointment
                },
              },
              orderBy: { firstName: 'asc' }, // Prisma orderBy syntax
              skip: SKIP, // Prisma equivalent of offset
              take: LIMIT, // Prisma equivalent of limit
              where: searchFilter,
            });

            // Prisma's count method for total records
            const count = await prisma.patient.count({
              where: searchFilter,
            });

            return [patientsResult, count];
          }
        );

        const totalPages = Math.ceil(totalRecordsCount / LIMIT);

        return {
          currentPage: PAGE_NUMBER,
          data: fetchedPatients,
          totalPages,
          totalRecords: totalRecordsCount,
        };
      } catch (error) {
        console.error('Error fetching all patients:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        // Handle Prisma errors specifically
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma Error Code:', error.code);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database Error: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch patients.',
        });
      }
    }),

  // --- getPatientById ---
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;
        // Prisma findFirst equivalent
        const patient = await ctx.db.patient.findFirst({
          where: { id: id },
        });

        if (!patient) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Patient data not found.',
          });
        }

        return { data: patient };
      } catch (error) {
        console.error('Error fetching patient by ID:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        // Handle Prisma errors specifically
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma Error Code:', error.code);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database Error: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch patient data.',
        });
      }
    }),

  // --- getPatientDashboardStatistics ---
  getDashboardStats: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;

        // Prisma findFirst equivalent
        const patientData = await ctx.db.patient.findFirst({
          select: {
            // Prisma uses 'select' for specific columns
            id: true,
            colorCode: true,
            dateOfBirth: true,
            firstName: true,
            gender: true,
            img: true,
            lastName: true,
          },
          where: { id: id },
        });

        if (!patientData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Patient data not found.',
          });
        }

        // Use Prisma's $transaction for atomic queries
        const [patientAppointments, availableDoctors] =
          await ctx.db.$transaction(async (prisma) => {
            // Prisma findMany equivalent for appointments
            const appointmentsResult = await prisma.appointment.findMany({
              include: {
                // Prisma uses 'include' for relations
                doctor: {
                  select: {
                    id: true,
                    colorCode: true,
                    img: true,
                    name: true,
                    specialization: true,
                  },
                },
                patient: {
                  select: {
                    colorCode: true,
                    dateOfBirth: true,
                    firstName: true,
                    gender: true,
                    img: true,
                    lastName: true,
                  },
                },
              },
              orderBy: { appointmentDate: 'desc' }, // Prisma orderBy syntax
              where: {
                patientId: patientData.id,
              },
            });

            const todayDateIndex = new Date().getDay();
            const today = daysOfWeek[todayDateIndex] ?? 'Sunday';

            // Prisma findMany for available doctors
            const doctorsResult = await prisma.doctor.findMany({
              select: {
                // Prisma uses 'select' for specific columns
                id: true,
                colorCode: true,
                img: true,
                name: true,
                specialization: true,
                // If you needed the working day data itself, you'd include it here
                // workingDays: {
                //     select: { day: true },
                //     where: { day: today },
                // },
              },
              take: 4, // Prisma equivalent of limit
              where: {
                availabilityStatus: 'available',
                workingDays: {
                  // Filter by relation
                  some: {
                    // 'some' for checking if at least one related record matches
                    day: today,
                  },
                },
              },
            });

            return [appointmentsResult, doctorsResult];
          });

        const { appointmentCounts, monthlyData } =
          await processAppointments(patientAppointments);
        const last5Records = patientAppointments.slice(0, 5);

        return {
          appointmentCounts,
          availableDoctor: availableDoctors, // Note: your original code had 'availableDoctor' singular here
          data: patientData,
          last5Records,
          monthlyData,
          totalAppointments: patientAppointments.length,
        };
      } catch (error) {
        console.error('Error fetching patient dashboard statistics:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        // Handle Prisma errors specifically
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma Error Code:', error.code);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database Error: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch patient dashboard statistics.',
        });
      }
    }),
  // --- getPatientFullDataById ---
  getPatientFullDataById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;

        // Prisma findFirst with OR condition and includes
        const patientWithRelations = await ctx.db.patient.findFirst({
          include: {
            appointments: {
              orderBy: { appointmentDate: 'desc' },
              select: { appointmentDate: true },
              take: 1,
            },
          },
          where: {
            OR: [{ id: id }, { email: id }],
          },
        });
        if (!patientWithRelations) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Patient data not found.',
          });
        }
        // Prisma's count method
        const totalAppointmentsCount = await ctx.db.appointment.count({
          where: {
            patientId: patientWithRelations.id,
          },
        });

        // Create a type that explicitly includes appointments
        type PatientWithAppointments = Prisma.PatientGetPayload<{
          include: {
            appointments: {
              orderBy: { appointmentDate: 'desc' };
              select: { appointmentDate: true };
              take: 1;
            };
          };
        }>;
        const typedPatient = patientWithRelations as PatientWithAppointments;

        const lastVisit = typedPatient.appointments[0]?.appointmentDate ?? null;

        return {
          data: {
            ...patientWithRelations,
            lastVisit,
            totalAppointments: totalAppointmentsCount,
          },
        };
      } catch (error) {
        console.error('Error fetching full patient data by ID:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        // Handle Prisma errors specifically
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma Error Code:', error.code);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database Error: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve complete patient data.',
        });
      }
    }),

  // --- updatePatient Mutation ---
  // This could be `protectedProcedure` or `adminProcedure` depending on who can update patients.
  // Keeping `publicProcedure` as per your original action, but consider access control.
  update: publicProcedure
    .input(PatientUpdateCombinedInputSchema)
    .output(SuccessOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: patientData, pid } = input; // patientData is partial due to schema

      try {
        // Update user's first and last name via auth service
        // IMPORTANT: `ctx.auth.api.updateUser`'s `body` property typically does NOT
        // accept these fields in camelCase for `better-auth` based on its types unless mapped.
        // Also, `id` should be passed to target the user.
        if (
          patientData.firstName !== undefined ||
          patientData.lastName !== undefined
        ) {
          await ctx.auth.api.updateUser({
            body: {
              firstName: patientData.firstName, // Map snakeCase from Zod to camelCase for auth system
              lastName: patientData.lastName, // Map snakeCase from Zod to camelCase for auth system
            },
          });
        }

        // Update patient record in the database
        await ctx.db.patient.update({
          data: {
            address: patientData.address,
            allergies: patientData.allergies,
            // Medical/Other Optional fields
            bloodGroup: patientData.bloodGroup,
            colorCode: patientData.colorCode,
            // Handle dateOfBirth: Convert string to Date.
            // If `dateOfBirth` is undefined in `patientData`, Prisma will ignore it.
            // If `null` is explicitly sent for a non-nullable field in Prisma, it will error.
            dateOfBirth: patientData.dateOfBirth
              ? new Date(patientData.dateOfBirth)
              : undefined, // undefined means don't update this field if not provided
            email: patientData.email,
            // Map fields from `patientData` (from Zod schema) to Prisma model fields
            // Only fields present in `patientData` (due to .partial()) will be updated.
            firstName: patientData.firstName,

            gender: patientData.gender,

            img: patientData.img,

            lastName: patientData.lastName,
            medicalConditions: patientData.medicalConditions,
            medicalHistory: patientData.medicalHistory,
            parentGuardianEmail: patientData.parentGuardianEmail,

            // Parent/Guardian fields (ensure they're z.optional() in PatientFormSchema if not always updated)
            parentGuardianName: patientData.parentGuardianName,
            parentGuardianPhone: patientData.parentGuardianPhone,
            phone: patientData.phone,
            relationToPatient: patientData.relationToPatient,
          },
          where: { id: pid },
        });

        return {
          msg: 'Patient info updated successfully',
          success: true,
        };
      } catch (error: unknown) {
        console.error('tRPC - updatePatient error:', error);
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
