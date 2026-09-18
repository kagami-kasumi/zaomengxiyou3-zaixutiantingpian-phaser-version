import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, ['tools/turtle-runtime/mutations.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['tools/turtle-runtime/run-browser.mjs'], { stdio: 'inherit' });
execFileSync('python', ['tools/turtle-runtime/verify_browser_pixels.py'], { stdio: 'inherit' });
