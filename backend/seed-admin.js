/**
 * Standalone admin-account seed — plain Node.js, no tsx needed.
 *
 * Idempotent: skips if the admin email already exists. Uses the same
 * ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME env vars as the TypeScript seed.
 *
 * Run: node seed-admin.js   (from the backend/ directory)
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@uora.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.ADMIN_NAME || "System Administrator";
const BCRYPT_ROUNDS = 12;

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.users.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log("Admin already exists (" + ADMIN_EMAIL + "). Skipping.");
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

  console.log("Admin created: " + ADMIN_EMAIL);
}

main()
  .catch(function (err) {
    console.error("Seed error:", err.message || err);
    process.exit(1);
  })
  .finally(function () {
    prisma.$disconnect();
  });
