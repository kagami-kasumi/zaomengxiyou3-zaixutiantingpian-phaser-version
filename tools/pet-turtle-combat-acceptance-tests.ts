import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, ['tools/turtle-runtime/combat-mutations.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['tools/turtle-runtime/run-combat-browser.mjs'], { stdio: 'inherit' });
