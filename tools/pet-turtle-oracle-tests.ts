import { execFileSync } from 'node:child_process';
execFileSync('python', ['tools/turtle-runtime/generate-decoded-hashes.py', '--check'], { stdio: 'inherit' });
execFileSync('python', ['tools/turtle-runtime/prepare_oracle.py'], { stdio: 'inherit' });
