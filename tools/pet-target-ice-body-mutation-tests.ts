import { execFileSync } from 'node:child_process';
execFileSync('python', ['tools/pet226-body/ice_body_mutations.py'], { stdio: 'inherit' });
