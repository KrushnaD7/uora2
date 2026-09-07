import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Bootstrap the initial ADMIN account.
 *
 * Uses environment variables so real credentials are never committed. A
 * development-friendly default is provided so a fresh checkout can bootstrap
 * out of the box; be sure to override ADMIN_PASSWORD in production.
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@uora.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.ADMIN_NAME || "System Administrator";
const BCRYPT_ROUNDS = 12;

async function main() {
  const existing = await prisma.users.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    // Idempotent: never overwrite an existing admin or reset its password.
    console.log(`Admin already exists (${ADMIN_EMAIL}). Skipping.`);
    // Still ensure the role is ADMIN in case it was created with another role.
    if (existing.role !== "ADMIN") {
      await prisma.users.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
      });
      console.log("Promoted existing user to ADMIN.");
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  await prisma.users.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  console.log(`Admin created in Users table (${ADMIN_EMAIL}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
