import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@uora.com";
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const user = await prisma.users.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE"
    },
    create: {
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  console.log("Admin password updated successfully for:", user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
