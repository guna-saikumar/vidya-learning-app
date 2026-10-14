import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Local/demo provisioned accounts (students do not self-register).
 * In production, admins will create/reset student credentials.
 */
const STUDENT_EMAIL = "student@vidya.test";
const STUDENT_PASSWORD = "StudentDemo1!";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "AdminDemo1!";

async function main() {
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: STUDENT_EMAIL },
    update: {
      name: "Demo Student",
      role: "STUDENT",
      passwordHash: studentHash,
      emailVerifiedAt: new Date(),
      emailOtpHash: null,
      emailOtpExpiresAt: null,
      emailOtpPurpose: null,
    },
    create: {
      email: STUDENT_EMAIL,
      name: "Demo Student",
      role: "STUDENT",
      passwordHash: studentHash,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Admin",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
  });

  const VIDYA_ADMIN_EMAIL = "admin@vidya.edu.in";
  await prisma.user.upsert({
    where: { email: VIDYA_ADMIN_EMAIL },
    update: {
      name: "Dr. Ramesh Sharma",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: VIDYA_ADMIN_EMAIL,
      name: "Dr. Ramesh Sharma",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Seeded users:");
  console.log(`  student: ${STUDENT_EMAIL} / ${STUDENT_PASSWORD} (verified)`);
  console.log(`  admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (verified)`);
  console.log(`  admin:   ${VIDYA_ADMIN_EMAIL} / ${ADMIN_PASSWORD} (verified)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
