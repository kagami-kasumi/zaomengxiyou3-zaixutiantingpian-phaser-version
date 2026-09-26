"""Reject actual monkey effect implementation errors; restore original bytes in finally."""
import hashlib
import json
from pathlib import Path
import subprocess
from mutation_io import write_source
import sys

ROOT = Path(__file__).resolve().parents[2]
path = ROOT/'src/systems/PetMonkeyHorseProjectileSystem.ts'
original = path.read_bytes()
backup = ROOT/'.tmp/pet226-skill-original.ts'
backup.parent.mkdir(parents=True, exist_ok=True)
backup.write_bytes(original)
source = original.decode()
mutants = [
    ('disabled-rolls', 'const cache = effect.disabled ?', 'const cache = false ?', 'pet-monkey-aoyi-target-tests'),
    ('disabled-attacks', 'for (const target of p.visualOnly ? [] : context.targets)',
     'for (const target of context.targets)', 'pet-monkey-effect-follow-tests'),
    ('ignore-hurt-cut', "if (p.destroyWhenSourceHurt && context.animation?.action === 'hurt')",
     "if (false && context.animation?.action === 'hurt')", 'pet-monkey-effect-follow-tests'),
    ('ttl-late-hit', 'if (entry.timed && age === entry.lastTick) p.isExpired = true;',
     'if (false) p.isExpired = true;', 'pet-monkey-effect-follow-tests'),
    ('fixed-ttl', 'effect.lifetime * context.hostFps', 'effect.lifetime * 24', 'pet-monkey-skill-projectile-tests'),
    ('no-id-renewal', 'p.hitSerial++;', 'p.hitSerial += 0;', 'pet-monkey-skill-projectile-tests'),
    ('flip-attack-direction', 'p.petRenderDirection = matrixA;',
     'p.petRenderDirection = matrixA; p.facingX = -p.facingX as -1 | 1;', 'pet-monkey-effect-follow-tests'),
]
start = source.index('      // FollowBaseObjectBullet applies displacement')
end = source.index('      context.emit({ type: entry.action', start)
follow = source[start:end]
reordered = source[:start] + source[end:]
anchor = '      const direction = p.petRenderDirection'
reordered = reordered.replace(anchor, follow + anchor, 1)
family = 'horse' if '--horse' in sys.argv else 'monkey'
if family == 'horse':
    mutants = [
        ('follow-all', 'follows: effect.follows,', 'follows: true,', 'pet-horse-effect-follow-tests'),
        ('cut-all', 'projectile.destroyWhenSourceHurt = effect.cut;',
         'projectile.destroyWhenSourceHurt = true;', 'pet-horse-effect-follow-tests'),
        ('ignore-hurt-cut', "if (p.destroyWhenSourceHurt && context.animation?.action === 'hurt')",
         "if (false && context.animation?.action === 'hurt')", 'pet-horse-effect-follow-tests'),
        ('no-id-renewal', 'p.hitSerial++;', 'p.hitSerial += 0;', 'pet-horse-skill-projectile-tests'),
        ('flip-attack-direction', 'p.petRenderDirection = matrixA;',
         'p.petRenderDirection = matrixA; p.facingX = -p.facingX as -1 | 1;', 'pet-horse-effect-follow-tests'),
    ]
results = []
try:
    for name, before, after, test in mutants + [('follow-before-hit', source, reordered, f'pet-{family}-effect-follow-tests')]:
        assert source.count(before) == 1, name
        write_source(path, source.replace(before, after).encode('utf-8'))
        result = subprocess.run(['node', 'tools/run-system-tests.mjs', test], cwd=ROOT,
                                capture_output=True, timeout=90)
        output = (result.stdout + result.stderr).decode(errors='replace')
        assert result.returncode != 0 and 'AssertionError' in output, (name, output[-2000:])
        results.append(dict(name=name, status='rejected', test=test))
        print(name, 'rejected', flush=True)
finally:
    write_source(path, original)
assert path.read_bytes() == original
(ROOT/f'docs/tasks/evidence/TASK-SLICE-226/{"horse-" if family == "horse" else ""}skill-mutations.json').write_text(json.dumps(
    dict(sourceSha256=hashlib.sha256(original).hexdigest(), results=results), indent=2), encoding='utf-8')
