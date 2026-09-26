import { execFileSync } from 'node:child_process';
execFileSync('python', ['tools/pet226-body/skill_mutations.py'], { stdio: 'inherit' });
