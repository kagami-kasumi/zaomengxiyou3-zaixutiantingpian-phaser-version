"""232 bounded static caller inventory; not a dynamic/visual verification."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-232/source-caller-map.json'
IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 30]


def scan():
    rows = []
    for number in IDS:
        path = SRC / f'export/monster/Monster{number}.as'
        source = path.read_text(encoding='utf-8')
        calls = []
        for line, text in enumerate(source.splitlines(), 1):
            if any(token in text for token in [
                'new SpecialEffectBullet(', 'new FollowBaseObjectBullet(',
                'AUtils.getNewObj(', 'magicBulletArray.push(',
                '.setDisable()', '.setDestroyWhenLastFrame(',
                '.setDestroyInCount(', '.setHurtCanCutDownEffect(',
                'super.destroy()', 'function destroy(',
            ]):
                calls.append({'line': line, 'source': text.strip()})
        rows.append({'monster': number, 'path': path.relative_to(ROOT).as_posix(),
                     'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                     'calls': calls,
                     'destroyOverride': bool(re.search(r'function destroy\(', source)),
                     'callsBaseDestroy': 'super.destroy();' in source})
    # These assertions only guard completeness of the finite static inventory.
    assert all(not row['destroyOverride'] or row['callsBaseDestroy'] for row in rows)
    assert len(rows) == 12
    report = {'status': 'static-source-inventory', 'task': 'TASK-SETTINGS-232',
              'limitations': 'No runtime, collision, timing or visual acceptance implied.',
              'levels': {'1-1': [30, 3], '1-2': [7, 8, 4, 2],
                         '1-3': [8, 7, 3, 5, 30], '2-1': [6, 9, 10, 19],
                         '2-2': [9, 10, 19, 16]}, 'monsters': rows}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'232 static caller inventory: {len(rows)} types, {sum(len(r["calls"]) for r in rows)} source locations')


if __name__ == '__main__':
    scan()
