import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.upsert({
    where: { email: "admin@carconnect.com" },
    update: {},
    create: {
      email: "admin@carconnect.com",
      password: "123", // (you said hashing not needed)
    },
  });

  console.log("Admin created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
