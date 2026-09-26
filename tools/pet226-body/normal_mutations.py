"""Real production mutations, rejected by native-phase and formal-damage runtime checks."""
import hashlib
import json
from pathlib import Path
import subprocess
from mutation_io import write_source

ROOT=Path(__file__).resolve().parents[2]
path=ROOT/'src/systems/PetMonkeyHorseProjectileSystem.ts'
original=path.read_bytes();source=original.decode()
backup=ROOT/'.tmp/pet226-normal-original.ts'
backup.parent.mkdir(parents=True,exist_ok=True)
backup.write_bytes(original)
mutants=[
 ('collision-bypass', 'shape: { kind: \'runtime\', index: targetIndex } }).hit) continue;', 'shape: { kind: \'runtime\', index: targetIndex } }).hit && false) continue;'),
 ('birth-already-stepped', 'projectile.petHostTick = 0;', 'projectile.petHostTick = 1;'),
 ('phase-ahead', 'const age = p.petHostTick! + 1;', 'const age = p.petHostTick! + 2;'),
 ('expire-before-last', 'if ((p.petNativeFrame?.() ?? age) === entry.lastTick) p.isExpired = true;', 'if ((p.petNativeFrame?.() ?? age) === entry.lastTick - 1) p.isExpired = true;'),
 ('no-cache-refresh', 'refresh: () => refreshMonkeyHorseContextDamage(context, entry.action)', 'refresh: () => entry.cache'),
 ('wrong-flip', 'const direction = p.petRenderDirection ?? -p.facingX as -1 | 1;', 'const direction = p.facingX;'),
]
results=[]
try:
 for name,before,after in mutants:
  assert source.count(before)==(2 if name=='birth-already-stepped' else 1),name
  write_source(path, source.replace(before,after,1).encode('utf-8'))
  result=subprocess.run(['node','tools/run-system-tests.mjs','pet-monkey-horse-normal-runtime-tests'],cwd=ROOT,capture_output=True,timeout=90)
  output=(result.stdout+result.stderr).decode(errors='replace')
  assert result.returncode!=0 and 'AssertionError' in output,(name,output[-2000:])
  results.append(dict(name=name,status='rejected',exitCode=result.returncode))
  print(name,'rejected',flush=True)
finally:
 write_source(path, original)
assert path.read_bytes()==original
out=ROOT/'docs/tasks/evidence/TASK-SLICE-226/normal-mutations.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(dict(sourceSha256=hashlib.sha256(original).hexdigest(),results=results),indent=2),encoding='utf-8')
