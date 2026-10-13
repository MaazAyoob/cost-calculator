// ============================================================
// COST CALCULATOR & HUTTY PLATFORM – DATABASE SEED SCRIPT
// CLI entrypoint delegating to seed.service.ts
// ============================================================

import { PrismaClient } from '@prisma/client';
import { runSeed } from '../src/services/seed.service';

export { runSeed };

const defaultPrisma = new PrismaClient();

if (require.main === module) {
  runSeed(defaultPrisma)
    .catch((e) => {
      console.error('[Seed Error]', e);
      process.exit(1);
    })
    .finally(async () => {
      await defaultPrisma.$disconnect();
    });
}
