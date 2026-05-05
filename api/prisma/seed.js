const { PrismaClient } = require("@prisma/client");
const crypto = require("node:crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  const users = [
    {
      name: "Admin User",
      email: "admin@financeapp.local",
      passwordHash: hashPassword("Admin123!"),
      role: "ADMIN",
      isActive: true,
    },
    {
      name: "Demo User",
      email: "user@financeapp.local",
      passwordHash: hashPassword("User123!"),
      role: "USER",
      isActive: true,
    },
    {
      name: "Viewer User",
      email: "viewer@financeapp.local",
      passwordHash: hashPassword("Viewer123!"),
      role: "USER",
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
      },
      create: user,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
