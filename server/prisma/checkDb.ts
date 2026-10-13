// ============================================================
// COST CALCULATOR & HUTTY PLATFORM – DATABASE HEALTH CHECK CLI
// CLI entrypoint delegating to checkDb.service.ts
// ============================================================

import { PrismaClient } from '@prisma/client';
import { checkDatabase } from '../src/services/checkDb.service';

export { checkDatabase };

const defaultPrisma = new PrismaClient();

if (require.main === module) {
  checkDatabase(defaultPrisma)
    .then((healthy) => {
      process.exit(healthy ? 0 : 1);
    })
    .catch((e) => {
      console.error('Diagnostic error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await defaultPrisma.$disconnect();
    });
}
