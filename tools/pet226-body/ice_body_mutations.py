"""Exercise actual body/view regressions; restore every original byte even on failure."""
import hashlib
import json
from pathlib import Path
import subprocess
from mutation_io import write_source

ROOT = Path(__file__).resolve().parents[2]
clock = ROOT / 'src/systems/MonsterPetTargetEffectSystem.ts'
view = ROOT / 'src/scenes/stage11/Stage11MonsterVisualBridge.ts'
original = {path: path.read_bytes() for path in [clock, view]}
backup = ROOT/'.tmp/pet226-ice-body-originals'
backup.mkdir(parents=True, exist_ok=True)
for path, content in original.items(): (backup/path.name).write_bytes(content)
mutants = [
    ('post-effect-freeze', clock,
     'if (!state.iceVisible) state.pendingBodyTicks++;\n    state.effects.step(hostFps);',
     'state.effects.step(hostFps);\n    if (!state.iceVisible) state.pendingBodyTicks++;'),
    ('replay-consumed-body', clock, 'state.pendingBodyTicks = 0;', 'state.pendingBodyTicks += 0;'),
    ('ignore-body-freeze', clock, 'if (!state.iceVisible) state.pendingBodyTicks++;', 'state.pendingBodyTicks++;'),
    ('freeze-emitted-attacks', view, 'updateAttackViews(view.attacks, deltaMs);',
     'updateAttackViews(view.attacks, combat.petTargetEffectState?.iceVisible ? 0 : deltaMs);'),
]
rows = []
try:
    for name, path, before, after in mutants:
        for source, content in original.items():
            write_source(source, content)
        code = original[path].decode('utf-8')
        assert code.count(before) == 1, name
        write_source(path, code.replace(before, after).encode('utf-8'))
        result = subprocess.run(['node', 'tools/run-system-tests.mjs', 'pet-target-ice-body-tests'],
                                cwd=ROOT, capture_output=True, timeout=90)
        output = (result.stdout + result.stderr).decode(errors='replace')
        assert result.returncode != 0 and 'AssertionError' in output, (name, output[-1800:])
        rows.append(dict(name=name, status='rejected'))
        print(name, 'rejected', flush=True)
finally:
    for path, content in original.items():
        write_source(path, content)
for path, content in original.items():
    assert path.read_bytes() == content
out = ROOT / 'docs/tasks/evidence/TASK-SLICE-226/ice-body-mutations.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(dict(results=rows, sources={str(path.relative_to(ROOT)): hashlib.sha256(content).hexdigest()
                                                   for path, content in original.items()}), indent=2), encoding='utf-8')
