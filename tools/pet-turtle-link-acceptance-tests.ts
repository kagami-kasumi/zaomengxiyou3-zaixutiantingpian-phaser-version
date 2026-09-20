import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, ['tools/turtle-runtime/link-mutations.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['tools/turtle-runtime/run-combat-browser.mjs', '--links'], { stdio: 'inherit' });
