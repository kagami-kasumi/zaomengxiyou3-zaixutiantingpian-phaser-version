"""Project only the verified monkey/horse source attack dictionaries' target effects."""
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
rows = []
for family, task in [('monkey', 228), ('horse', 229)]:
    manifest = json.loads((ROOT/f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family}-collision-phase.json').read_text(encoding='utf-8'))
    assert manifest['status'] == 'verified'
    for form in manifest['body']['forms']:
        path = ROOT/form['sourcePath']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == form['sourceSha256']
        source = path.read_text(encoding='utf-8')
        for action, dictionary in re.findall(r'attackBackInfoDict\["([^"]+)"\]\s*=\s*(\{.*?\n\s*\});', source, re.S):
            if '"addEffect"' not in dictionary:
                continue
            name = re.search(r'"name":BaseAddEffect\.(\w+)', dictionary)[1]
            duration = re.search(r'"time":([^,\n]+)', dictionary)[1]
            assert 'gc.frameClips' in duration
            seconds = float(duration.replace('gc.frameClips', '').replace('*', '').strip())
            hurt = re.search(r'"hurt":Number\(this\._petInfo\.getAtk\(\)\)\s*([*/])\s*([\d.]+)', dictionary)
            assert name in ('PETMONKEY_FIRE', 'PETHORSE_ICE')
            rows.append(dict(family=family, form=form['form'], action=action, name=name.lower(),
                seconds=seconds, hurtOperation=hurt[1] if hurt else None, hurtOperand=float(hurt[2]) if hurt else None,
                requiresBd=action == 'hit5_1',
                sourceSha256=form['sourceSha256']))
assert len(rows) == 9 and len({(r['family'],r['form'],r['action']) for r in rows}) == 9
payload = json.dumps(dict(effects=rows), indent=2)+'\n'
path = ROOT/'src/assets/pet-target-effects.json'
if '--check' in sys.argv:
    assert path.read_text(encoding='utf-8') == payload
else:
    path.write_text(payload, encoding='utf-8', newline='\n')
print('Nine verified source target-effect dictionaries projected.')
