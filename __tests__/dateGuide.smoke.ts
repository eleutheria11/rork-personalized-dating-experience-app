import { runGuideSmokeTest } from '@/lib/dateGuide';

async function main() {
  const ok = await runGuideSmokeTest();
  if (!ok) {
    console.error('Date Guide smoke test failed: tip was empty');
    process.exit(1);
  }
  console.log('Date Guide smoke test passed');
}

main().catch((e) => {
  console.error('Date Guide smoke test crashed', e);
  process.exit(1);
});
