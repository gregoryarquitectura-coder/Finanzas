import { PrismaClient } from "@prisma/client";
import { DEFAULT_ACCOUNTS } from "../config/finance.config";

const prisma = new PrismaClient();

async function main() {
  for (const a of DEFAULT_ACCOUNTS) {
    await prisma.account.upsert({
      where: { key: a.key },
      update: {
        name: a.name,
        function: a.function,
        sortOrder: a.sortOrder,
      },
      create: {
        key: a.key,
        name: a.name,
        function: a.function,
        initialBalance: a.initialBalance,
        sortOrder: a.sortOrder,
      },
    });
  }
  console.log(`Seed OK: ${DEFAULT_ACCOUNTS.length} cuentas sembradas/actualizadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
