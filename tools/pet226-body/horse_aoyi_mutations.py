"""Reject real aoyi implementation mutations, restoring every source byte in finally."""
import hashlib
import json
from pathlib import Path
import subprocess
from mutation_io import write_source
import sys

ROOT = Path(__file__).resolve().parents[2]
motion = 'src/systems/PetHorseAoyiMotion.ts'
emitter = 'src/systems/PetHorseAoyiProjectiles.ts'
owner = 'src/systems/PetMonkeyHorseProjectileSystem.ts'
context = 'src/systems/PetCombatContext.ts'
clock = 'src/systems/PetMonkeyHorseNativeClipClock.ts'
view = 'src/scenes/FormalPetHorseBodyBridge.ts'
world = 'src/scenes/PetProjectileCombatBridge.ts'
monkey = '--monkey' in sys.argv
if monkey: view = 'src/scenes/FormalPetMonkeyBodyBridge.ts'
mutants = [
    ('texture-center-flip', view,
     'effect.image.setFlipX(false).setScale(projectile.petRenderDirection ?? -projectile.facingX, 1);',
     'effect.image.setFlipX((projectile.petRenderDirection ?? -projectile.facingX) < 0).setScale(1, 1);', 'pet-horse-sp-display-tests'),
    ('root-only-paused-display', view, 'projectile.petNativePhaseTick?.() ?? projectile.petHostTick ?? 0',
     'projectile.petNativeFrame!()', 'pet-horse-sp-display-tests'),
    ('skip-paused-birth-view', view, 'const syncNativeFrames = () => syncEffects(latestProjectiles, latestSceneTime);',
     'const syncNativeFrames = () => {};', 'pet-horse-paused-birth-display-tests'),
    ('timer-before-native-phase', world,
     "const display = createPetWorldDisplayBridge(scene);\n  // Timer-born native clips start at this frame's display tick, like body-born clips.\n  const delayed = createPetWorldDelayBridge(scene);",
     'const delayed = createPetWorldDelayBridge(scene);\n  const display = createPetWorldDisplayBridge(scene);',
     'pet-horse-paused-birth-display-tests'),
    ('paused-combat-collision-phase', owner, 'const phaseTick = p.petNativePhaseTick?.() ?? age;',
     'const phaseTick = age;', 'pet-horse-world-pause-tests'),
    ('root-only-collision-cycle', clock,
     'return tick < clip.cycleStart ? tick : clip.cycleStart + (tick - clip.cycleStart) % clip.cycleTicks;',
     'return (tick - 1) % clip.rootFrames + 1;', 'pet-horse-world-pause-tests'),
    ('frozen-root-cleanup', clock, 'projectile.petNativeFrame = () => (age() - 1) % clip.rootFrames + 1;',
     'projectile.petNativeFrame = () => 1;', 'pet-horse-world-pause-tests'),
    ('frozen-gxp-at-hit', context, 'get isGxp() { return session.currentGxp(frame); },',
     'isGxp: frame.gxpRuntimeKeys?.includes(session.runtimeKey) ?? false,', 'pet-horse-aoyi-runtime-tests'),
    ('horizontal-homing', motion, 'projectile.x > target.x ? -truth.horizontalTrackingSpeed : truth.horizontalTrackingSpeed',
     'projectile.x > target.x ? -10.6 : 10.6', 'pet-horse-aoyi-motion-tests'),
    ('pre-acceleration-distance', motion, 'Math.hypot(motion.speedX, motion.speedY)',
     'Math.hypot(motion.speedX - truth.acceleration[0]!, motion.speedY - truth.acceleration[1]!)', 'pet-horse-aoyi-motion-tests'),
    ('skip-destroyed-final-move', motion, '  if (motion.targetId) {',
     '  if (projectile.isExpired) return;\n  if (motion.targetId) {', 'pet-horse-aoyi-motion-tests'),
    ('forward-array', emitter, 'monsters[monsters.length - index - 1]!', 'monsters[index]!', 'pet-horse-aoyi-birth-tests'),
    ('filter-dead', emitter, 'const monsters = context.projectileCombat?.monstersInParentSpace?.() ?? context.targets;',
     'const monsters = (context.projectileCombat?.monstersInParentSpace?.() ?? context.targets).filter(m => m.isAlive);', 'pet-horse-aoyi-birth-tests'),
    ('early-explosion', emitter, 'current.projectileCombat.delay(1000, explode);',
     'explode(); current.projectileCombat.delay(1000, () => {});', 'pet-horse-aoyi-runtime-tests'),
    ('cancel-live-released-parent', emitter, 'if (current.pet.hp <= 0) return;',
     'if (current.pet.hp <= 0 || !current.pet.isActive) return;', 'pet-horse-aoyi-callback-tests'),
    ('falling-max99', emitter, 'maxHits: config.maxHits,', 'maxHits: explosion ? config.maxHits : 99,', 'pet-horse-aoyi-runtime-tests'),
    ('no-hit-callback', owner, 'entry.onAccepted?.(context); recordProjectileHit(p);',
     'recordProjectileHit(p);', 'pet-horse-aoyi-runtime-tests'),
    ('lookup-target-by-id', owner,
     '(entry.retainedTarget ? entry.retainedTarget() : combat.target(entry.motion.targetId))',
     'combat.target(entry.motion.targetId)', 'pet-horse-aoyi-runtime-tests'),
]
originals = {file: (ROOT/file).read_bytes() for file in [motion, emitter, owner, context, clock, view, world]}

backup = ROOT / '.tmp/pet226-horse-aoyi-originals'
backup.mkdir(parents=True, exist_ok=True)
for file, content in originals.items():
    (backup / Path(file).name).write_bytes(content)

source = originals[emitter].decode()
frozen = source.replace('const explode = () => {', 'const point = { x: p.x, y: p.y };\n        const explode = () => {')
frozen = frozen.replace('create(current, projectiles, true, p.x, p.y)', 'create(current, projectiles, true, point.x, point.y)')
mutants.append(('frozen-delayed-reference', emitter, source, frozen, 'pet-horse-aoyi-runtime-tests'))
if monkey:
    mutants = [
        ('paused-combat-collision-phase', owner, 'const phaseTick = p.petNativePhaseTick?.() ?? age;',
         'const phaseTick = age;', 'pet-monkey-world-pause-tests'),
        ('paused-combat-cleanup', owner, '(p.petNativeFrame?.() ?? age) === entry.lastTick',
         'age === entry.lastTick', 'pet-monkey-world-pause-tests'),
        ('root-only-collision-cycle', clock,
         'return tick < clip.cycleStart ? tick : clip.cycleStart + (tick - clip.cycleStart) % clip.cycleTicks;',
         'return (tick - 1) % clip.rootFrames + 1;', 'pet-monkey-world-pause-tests'),
        ('paused-combat-display', view,
         'effect.projectile.petNativePhaseTick?.() ?? effect.projectile.petHostTick ?? 0',
         'effect.projectile.petHostTick ?? 0', 'pet-monkey-pause-display-tests'),
        ('texture-center-flip', view,
         'image.setFlipX(false).setScale(projectile.petRenderDirection ?? -projectile.facingX, 1);',
         'image.setFlipX((projectile.petRenderDirection ?? -projectile.facingX) < 0).setScale(1, 1);',
         'pet-monkey-pause-display-tests'),
    ]
results = []
try:
    for name, file, before, after, test in mutants:
        path = ROOT/file; source = originals[file].decode()
        assert source.count(before) == 1, name
        write_source(path, source.replace(before, after).encode('utf-8'))
        result = subprocess.run(['node', 'tools/run-system-tests.mjs', test], cwd=ROOT, capture_output=True, timeout=90)
        output = (result.stdout + result.stderr).decode(errors='replace')
        assert result.returncode != 0 and 'AssertionError' in output, (name, output[-2000:])
        write_source(path, originals[file])
        results.append(dict(name=name, status='rejected', test=test)); print(name, 'rejected', flush=True)
finally:
    for file, content in originals.items():
        write_source(ROOT/file, content)
assert all((ROOT/file).read_bytes() == content for file, content in originals.items())
(ROOT/f'docs/tasks/evidence/TASK-SLICE-226/{"monkey-pause" if monkey else "horse-aoyi"}-mutations.json').write_text(json.dumps(dict(
    sourceSha256={file: hashlib.sha256(content).hexdigest() for file, content in originals.items()},
    results=results), indent=2)+'\n', encoding='utf-8')
