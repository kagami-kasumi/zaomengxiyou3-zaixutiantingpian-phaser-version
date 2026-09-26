import { execFileSync } from 'node:child_process';
execFileSync('python', ['tools/pet226-body/horse_aoyi_mutations.py', '--monkey'], { stdio: 'inherit' });
