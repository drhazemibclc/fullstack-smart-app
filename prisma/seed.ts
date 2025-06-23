import { generateRandomColor } from "@/utils";
import { NutritionalStatus, ROLE } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
import { fakerDE as faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding data...");

  // Create 3 staff
 
    const mobile = faker.phone.number();

    await prisma.staff.create({
      data: {
        id: faker.string?.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone: mobile,
        address: faker.location.streetAddress(),
        department: faker.company.name(),
        role: ROLE.NURSE,
        status: "ACTIVE",
        colorCode: generateRandomColor(),
      },
    });


  // Create 10 doctors
  const doctors = [];
  for (let i = 0; i < 10; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        specialization: faker.person.jobType(),
        licenseNumber: faker.string.uuid(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        department: faker.company.name(),
        availabilityStatus: "ACTIVE",
        colorCode: generateRandomColor(),
        jobType: i % 2 === 0 ? "FULL" : "PART",
        workingDays: {
          create: [
            {
              day: "Monday",
              startTime: "08:00",
              closeTime: "17:00",
            },
            {
              day: "Wednesday",
              startTime: "08:00",
              closeTime: "17:00",
            },
          ],
        },
      },
    });
    doctors.push(doctor);
  }

  // Create 20 patients
  const patients = [];
  for (let i = 0; i < 20; i++) {
    const patient = await prisma.patient.create({
      data: {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.birthdate(),
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        phone: faker.phone.number(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        parentGuardianName:faker.phone.number(),
parentGuardianPhone:  faker.phone.number(),
parentGuardianEmail:faker.internet.email(),
        nutritionalStatus: NutritionalStatus.NORMAL,
        relationToPatient: "father",
        bloodGroup: i % 4 === 0 ? "O+" : "A+",
        allergies: faker.lorem.words(2),
        medicalConditions: faker.lorem.words(3),
        medicalHistory: faker.lorem.words(3),
        colorCode: generateRandomColor(),
      },
    });

    patients.push(patient);
  }

  // Create Appointments
  for (let i = 0; i < 20; i++) {
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const patient = patients[Math.floor(Math.random() * patients.length)];

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: faker.date.soon(),
        time: "10:00",
        status: i % 4 === 0 ? "PENDING" : "SCHEDULED",
        type: "Checkup",
        reason: faker.lorem.sentence(),
      },
    });
  }

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
