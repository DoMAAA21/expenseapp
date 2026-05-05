const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  const users = [
    {
      name: "User One",
      email: "user1@budgetly.local",
      passwordHash: hashPassword("password"),
      isActive: true,
    },
    {
      name: "Demo User",
      email: "user@financeapp.local",
      passwordHash: hashPassword("password"),
      isActive: true,
    },
    {
      name: "Viewer User",
      email: "viewer@financeapp.local",
      passwordHash: hashPassword("password"),
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
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
