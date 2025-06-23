import { PrismaClient, Gender, NutritionalStatus, Role, AppointmentStatus, JobType, Status } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { customAlphabet } from 'nanoid'; // For generating unique IDs similar to cuid

// Assuming '@/lib/auth' is the path to your better-auth client.
// This client is used to create users in the authentication system,
// which in turn might create entries in your 'User' table if better-auth manages it.
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12); // For generating unique string IDs

// Helper to generate a simple placeholder password hash
// IMPORTANT: In a real application, use a strong, secure hashing library like `bcrypt`
// for production passwords. This is just for seeding dummy data.
const generatePlaceholderHash = (password: string) => {
  return `hashed_${password}_${nanoid()}`;
};

async function seed() {
  console.log('Starting Prisma database seeding process...');

  // --- Step 1: Clear existing data ---
  // Deletion order is crucial to respect foreign key constraints.
  // Delete from child tables first, then parent tables.
  console.log('Clearing existing data...');
  try {
    await prisma.service.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.vaccination.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.workingDay.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.staff.deleteMany({});
    // Note: We typically don't delete `User` records created by an auth system directly
    // in a seed script unless it's a full reset, as the auth system might manage them.
    // If you have a separate User model in Prisma linked to auth, you might delete it here.
    // For this example, we only delete records directly managed by this schema.
    console.log('Existing data cleared.');
  } catch (error) {
    console.error('Error clearing data:', error);
    // Continue seeding even if clearing fails, as some tables might be empty.
  }


  // --- Step 2: Create Superadmin User via auth client ---
  // This step assumes your '@/lib/auth' client manages user creation in a separate 'User' table
  // and provides an ID that can be linked to Doctor/Patient/Staff models.
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'hazem032012@gmail.com';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Health24';
  const superadminName = process.env.SUPERADMIN_NAME || 'Hazem Ali';

  let superadminAuthUser: { id: string; email: string };

  console.log(`Attempting to create superadmin user: ${superadminEmail}...`);
  try {
    const authSignUpData = await auth.api.signUpEmail({
      body: {
        email: superadminEmail,
        password: superadminPassword,
        name: superadminName,
      },
    });

    if (!authSignUpData || !authSignUpData.user) {
      throw new Error('Failed to create superadmin user via auth.api.signUpEmail.');
    }
    superadminAuthUser = authSignUpData.user;
    console.log(`Superadmin user created successfully: ID - ${superadminAuthUser.id}, Email - ${superadminAuthUser.email}`);

    // If your `User` model in schema.prisma has a `role` field, update it here.
    // Example (assuming a 'User' model exists in your Prisma schema):
    // await prisma.user.update({
    //   where: { id: superadminAuthUser.id },
    //   data: { role: Role.ADMIN }, // Make sure Role.ADMIN matches your enum
    // });
    // console.log(`Superadmin user role updated to ADMIN in Prisma User model.`);

  } catch (error: any) {
    // If the user already exists (e.g., from a previous seed or manual creation),
    // better-auth might throw an error. We'll try to fetch the existing user.
    if (error.message && error.message.includes('already exists')) {
      console.warn(`Superadmin user ${superadminEmail} already exists. Attempting to fetch existing user...`);
      // This part requires your 'User' model (if you have one) to be directly queryable by email.
      // If `auth.api.findUserByEmail` or similar exists in your auth, use that.
      // Otherwise, you might need to query the Prisma 'User' model directly if it exists.
      const existingPrismaUser = await prisma.user.findUnique({ where: { email: superadminEmail } });
      if (existingPrismaUser) {
        superadminAuthUser = existingPrismaUser;
        console.log(`Fetched existing superadmin user: ID - ${superadminAuthUser.id}`);
      } else {
        console.error(`Could not find existing user ${superadminEmail} in Prisma DB. Seeding may fail if userId is needed.`);
        // As a last resort fallback for demonstration, generate a placeholder ID
        superadminAuthUser = { id: `pre_existing_user_${nanoid()}`, email: superadminEmail };
      }
    } else {
      console.error('Critical error creating/fetching superadmin user:', error);
      throw error;
    }
  }


  // --- Step 3: Create Sample Doctors ---
  console.log('Creating sample doctors...');
  const doctorsData = [];
  for (let i = 0; i < 3; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        name: faker.person.fullName(),
        userId: i === 0 ? superadminAuthUser.id : nanoid(), // Link first doctor to superadmin user
        licenseNumber: `MD-${faker.string.alphanumeric(8).toUpperCase()}`,
        specialization: faker.helpers.arrayElement(['Pediatrics', 'General Practice', 'Cardiology', 'Dermatology', 'Orthopedics']),
        email: faker.internet.email(),
        role: Role.DOCTOR,
        address: faker.location.streetAddress(),
        profileImage: faker.image.avatar(),
        colorCode: faker.color.rgb(),
        availabilityStatus: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']),
        type: faker.helpers.arrayElement([JobType.FULL, JobType.PART]),
        phoneNumber: faker.phone.number('###-###-####'),
        isActive: true,
      },
    });
    doctorsData.push(doctor);
  }
  const [doctor1, doctor2, doctor3] = doctorsData;
  console.log(`Created ${doctorsData.length} doctors.`);


  // --- Step 4: Create Sample Patients ---
  console.log('Creating sample patients...');
  const patientsData = [];
  for (let i = 0; i < 5; i++) {
    const isMale = faker.datatype.boolean();
    const patient = await prisma.patient.create({
      data: {
        firstName: isMale ? faker.person.firstName('male') : faker.person.firstName('female'),
        lastName: faker.person.lastName(),
        gender: isMale ? Gender.MALE : Gender.FEMALE,
        nutritionalStatus: faker.helpers.arrayElement([
          NutritionalStatus.NORMAL,
          NutritionalStatus.WASTED,
          NutritionalStatus.STUNTED,
          NutritionalStatus.MALNOURISHED,
          NutritionalStatus.OBESCE,
        ]),
        address: faker.location.streetAddress(),
        relation: 'Self', // Or faker.helpers.arrayElement(['Self', 'Child', 'Sibling'])
        bloodGroup: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
        medicalHistory: faker.lorem.sentence(),
        role: Role.PATIENT,
        passwordHash: generatePlaceholderHash(faker.internet.password()),
        userId: nanoid(), // Each patient gets a unique user ID
        dateOfBirth: faker.date.past({ years: 15, refDate: '2020-01-01' }), // Patients up to 15 years old
        guardianName: faker.person.fullName(),
        phone: faker.phone.number('###-###-####'),
        email: faker.internet.email(),
        emergencyContact: faker.phone.number('###-###-####'),
        allergies: faker.lorem.words(3),
        medicalConditions: faker.lorem.sentence(),
        profileImage: faker.image.avatar(),
        colorCode: faker.color.rgb(),
      },
    });
    patientsData.push(patient);
  }
  const [patient1, patient2, patient3, patient4, patient5] = patientsData;
  console.log(`Created ${patientsData.length} patients.`);


  // --- Step 5: Create Sample Staff ---
  console.log('Creating sample staff...');
  const staffData = [];
  for (let i = 0; i < 2; i++) {
    const staffMember = await prisma.staff.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: generatePlaceholderHash(faker.internet.password()),
        phone: faker.phone.number('###-###-####'),
        address: faker.location.streetAddress(),
        department: faker.helpers.arrayElement(['Nursing', 'Administration', 'Pharmacy']),
        img: faker.image.avatar(),
        status: faker.helpers.arrayElement([Status.ACTIVE, Status.INACTIVE]),
        colorCode: faker.color.rgb(),
        role: faker.helpers.arrayElement([Role.NURSE, Role.ADMIN]),
        idNumber: `STF-${faker.string.alphanumeric(6).toUpperCase()}`,
      },
    });
    staffData.push(staffMember);
  }
  const [staff1, staff2] = staffData;
  console.log(`Created ${staffData.length} staff members.`);


  // --- Step 6: Create Sample Working Days for Doctors ---
  console.log('Creating sample working days...');
  const workingDaysData = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (const doctor of doctorsData) {
    for (let i = 0; i < faker.number.int({ min: 2, max: 4 }); i++) { // 2-4 working days per doctor
      const day = faker.helpers.arrayElement(daysOfWeek);
      const startTime = `${faker.number.int({ min: 8, max: 10 }).toString().padStart(2, '0')}:00`;
      const closeTime = `${faker.number.int({ min: 16, max: 18 }).toString().padStart(2, '0')}:00`;
      workingDaysData.push({
        doctorId: doctor.id,
        day: day,
        startTime: startTime,
        closeTime: closeTime,
      });
    }
  }
  await prisma.workingDay.createMany({ data: workingDaysData });
  console.log(`Created ${workingDaysData.length} working days.`);


  // --- Step 7: Create Sample Appointments ---
  console.log('Creating sample appointments...');
  const appointmentsData = [];
  for (let i = 0; i < 10; i++) { // Create 10 sample appointments
    const randomPatient = faker.helpers.arrayElement(patientsData);
    const randomDoctor = faker.helpers.arrayElement(doctorsData);
    const randomStaff = faker.helpers.arrayElement([staff1, staff2, null]); // Staff can be optional
    const appointmentDate = faker.date.soon({ days: 30 }); // Appointments within the next 30 days
    const appointmentTime = `${faker.number.int({ min: 9, max: 17 }).toString().padStart(2, '0')}:00`;

    appointmentsData.push(
      await prisma.appointment.create({
        data: {
          patientId: randomPatient.id,
          doctorId: randomDoctor.id,
          staffId: randomStaff?.id, // Nullable staffId
          appointmentDate: appointmentDate,
          appointmentType: faker.helpers.arrayElement(['Check-up', 'Follow-up', 'Consultation', 'Emergency']),
          notes: faker.lorem.sentence(),
          duration: faker.helpers.arrayElement([15, 30, 45, 60]),
          time: appointmentTime,
          status: faker.helpers.arrayElement([
            AppointmentStatus.PENDING,
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
          ]),
        },
      })
    );
  }
  const [appt1, appt2, appt3] = appointmentsData; // Get a few for direct linking later
  console.log(`Created ${appointmentsData.length} appointments.`);


  // --- Step 8: Create Sample Medical Records ---
  console.log('Creating sample medical records...');
  const medicalRecordsData = [];
  for (let i = 0; i < 5; i++) { // Create 5 medical records
    const randomPatient = faker.helpers.arrayElement(patientsData);
    const randomDoctor = faker.helpers.arrayElement(doctorsData);
    // Link to an appointment, but only if it's a COMPLETED appointment and not already linked
    const linkedAppt = faker.helpers.arrayElement(appointmentsData.filter(a => a.status === AppointmentStatus.COMPLETED && a.id !== medicalRecordsData.find(mr => mr.appointmentId === a.id)?.appointmentId));

    medicalRecordsData.push(
      await prisma.medicalRecord.create({
        data: {
          patientId: randomPatient.id,
          doctorId: randomDoctor.id,
          appointmentId: linkedAppt ? linkedAppt.id : null, // Ensure uniqueness for appointmentId
          visitDate: faker.date.recent({ days: 90 }),
          diagnosis: faker.lorem.sentence(3),
          symptoms: faker.lorem.sentence(5),
          treatment: faker.lorem.paragraph(),
          notes: faker.lorem.sentences(2),
          height: faker.number.float({ min: 0.5, max: 2.0, precision: 0.01 }).toFixed(2) + 'm',
          weight: faker.number.float({ min: 10, max: 100, precision: 0.1 }).toFixed(1) + 'kg',
          temperature: faker.number.float({ min: 36.0, max: 37.5, precision: 0.1 }).toFixed(1) + 'C',
          bloodPressure: `${faker.number.int({ min: 90, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`,
          weightForAgeZ: faker.number.float({ min: -2, max: 2, precision: 0.1 }),
          heightForAgeZ: faker.number.float({ min: -2, max: 2, precision: 0.1 }),
        },
      })
    );
  }
  const [medRecord1] = medicalRecordsData; // Get one for linking services
  console.log(`Created ${medicalRecordsData.length} medical records.`);


  // --- Step 9: Create Sample Prescriptions ---
  console.log('Creating sample prescriptions...');
  const prescriptionsData = [];
  for (let i = 0; i < 5; i++) {
    const randomPatient = faker.helpers.arrayElement(patientsData);
    const randomDoctor = faker.helpers.arrayElement(doctorsData);
    const linkedAppt = faker.helpers.arrayElement(appointmentsData.filter(a => a.status === AppointmentStatus.COMPLETED && a.id !== prescriptionsData.find(p => p.appointmentId === a.id)?.appointmentId));

    prescriptionsData.push(
      await prisma.prescription.create({
        data: {
          patientId: randomPatient.id,
          doctorId: randomDoctor.id,
          appointmentId: linkedAppt ? linkedAppt.id : null,
          medicationName: faker.commerce.productName(),
          dosage: `${faker.number.int({ min: 1, max: 5 })} ${faker.helpers.arrayElement(['mg', 'ml', 'tabs'])}`,
          frequency: faker.helpers.arrayElement(['Once daily', 'Twice daily', 'Three times a day', 'As needed']),
          duration: `${faker.number.int({ min: 7, max: 30 })} days`,
          instructions: faker.lorem.sentence(),
          issuedDate: faker.date.recent({ days: 30 }),
          status: faker.helpers.arrayElement(['active', 'completed', 'refilled']), // Assuming string statuses
        },
      })
    );
  }
  console.log(`Created ${prescriptionsData.length} prescriptions.`);


  // --- Step 10: Create Sample Vaccinations ---
  console.log('Creating sample vaccinations...');
  const vaccinationsData = [];
  for (let i = 0; i < 5; i++) {
    const randomPatient = faker.helpers.arrayElement(patientsData);
    vaccinationsData.push(
      await prisma.vaccination.create({
        data: {
          patientId: randomPatient.id,
          vaccineName: faker.helpers.arrayElement(['MMR', 'Polio', 'DTaP', 'Flu Vaccine']),
          administeredDate: faker.date.past({ years: faker.number.int({ min: 1, max: 10 }) }),
          administeredBy: faker.person.fullName(),
          nextDueDate: faker.datatype.boolean() ? faker.date.future({ years: 1 }) : null,
          notes: faker.lorem.sentence(faker.number.int({ min: 3, max: 10 })),
        },
      })
    );
  }
  console.log(`Created ${vaccinationsData.length} vaccinations.`);


  // --- Step 11: Create Sample Services (linked to Medical Record) ---
  console.log('Creating sample services...');
  const servicesData = [];
  for (const medicalRecord of medicalRecordsData) {
    if (faker.datatype.boolean()) { // Randomly add services to some medical records
      servicesData.push(
        await prisma.service.create({
          data: {
            serviceName: faker.helpers.arrayElement(['Consultation Fee', 'Lab Test', 'X-Ray', 'Immunization']),
            description: faker.lorem.sentence(),
            price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
            recordId: medicalRecord.id, // Link to existing medical record
          },
        })
      );
    }
  }
  console.log(`Created ${servicesData.length} services.`);


  console.log('Database seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seed process finished. Disconnected Prisma Client.');
    process.exit(0);
  });
