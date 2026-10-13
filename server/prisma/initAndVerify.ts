// ============================================================
// ALL-IN-ONE PRODUCTION DATABASE INITIALIZATION & VERIFICATION
// Sequence:
// 1. Synchronize PostgreSQL schema non-destructively: prisma db push
// 2. Populate essential reference data idempotently: seed
// 3. Perform comprehensive schema & record diagnostic: checkDb
//
// SAFETY:
// - Non-destructive (no database drop, no reset, no truncate).
// - Never logs credentials, passwords, or connection strings.
// - Returns exit code 0 only after successful verification.
// ============================================================

import { runInitAndVerifyPipeline } from '../src/services/initDb.service';

async function main() {
  const result = await runInitAndVerifyPipeline();
  if (result.success) {
    console.log('[CLI] Process completed with success code 0.');
    process.exit(0);
  } else {
    console.error(`[CLI] Process failed: ${result.message}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('[CLI] Unhandled error:', e);
  process.exit(1);
});
