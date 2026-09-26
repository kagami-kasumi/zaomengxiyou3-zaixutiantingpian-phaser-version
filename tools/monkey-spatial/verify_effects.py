"""Independent source-placement/native-tree and PNG integrity checks, not promotion."""
import copy
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/effects-air'


def compare(node, cid, source, failures, state_id):
    timeline = source['timelines'].get(str(cid))
    if timeline is None:
        if node['children']:
            failures.append((state_id, node['path'], 'unexpected-terminal-children'))
        return
    frame = node.get('frame')
    if not isinstance(frame, int) or not 1 <= frame <= len(timeline):
        failures.append((state_id, node['path'], 'frame'))
        return
    expected = timeline[frame-1]
    if len(expected) != len(node['children']):
        failures.append((state_id, node['path'], 'child-count', len(expected), len(node['children'])))
        return
    for placement, child in zip(expected, node['children']):
        for key, value in placement['matrix'].items():
            if abs(child['matrix'][key]-value) > 1e-7:
                failures.append((state_id, child['path'], 'matrix.'+key, value, child['matrix'][key]))
        if abs(child['alpha']-placement['alpha']) > 1e-7:
            failures.append((state_id, child['path'], 'alpha'))
        compare(child, placement['characterId'], source, failures, state_id)


def main():
    sources = json.loads((OUT/'source-definitions.json').read_text())['sources']
    owners = {Path(s['path']).stem: s for s in sources}
    measurement = json.loads((WORK/'measurement.json').read_text())
    assert hashlib.sha256((ROOT/'tools/turtle-visual/VisualProbe.as').read_bytes()).hexdigest()==measurement['probeSha256']
    assert hashlib.sha256((OUT/'effects-fixtures.json').read_bytes()).hexdigest()==measurement['fixturesSha256']
    failures, pngs, count = [], set(), 0
    for state in measurement['states']:
        owner = owners[state['owner']]
        compare(state['tree'], owner['roots'][state['symbol']], owner, failures, f"{state['symbol']}:{state['tick']}")
        count += 1
        for baseline in [*state['baselines'],state['localImage']]:
            path = ROOT/baseline['path']
            assert hashlib.sha256(path.read_bytes()).hexdigest() == baseline['sha256']
            image = Image.open(path).convert('RGBA')
            assert image.size == ((baseline['width'],baseline['height']) if baseline is state['localImage'] else (940,590))
            box = image.getchannel('A').getbbox()
            expected = dict(x=box[0], y=box[1], width=box[2]-box[0], height=box[3]-box[1]) if box else dict(x=0,y=0,width=0,height=0)
            assert expected == baseline['visibleBounds']
            pngs.add(baseline['sha256'])
    # These mutants alter actual observations, not the source-side expected placements.
    mutations = {}
    for name in ['state', 'matrix', 'child-count', 'alpha']:
        changed = copy.deepcopy(next(s for s in measurement['states'] if s['tree']['children']))
        if name == 'state': changed['tree']['frame'] = 0
        if name == 'matrix': changed['tree']['children'][0]['matrix']['tx'] += 1
        if name == 'child-count': changed['tree']['children'].pop()
        if name == 'alpha': changed['tree']['children'][0]['alpha'] -= .25
        detected = []
        owner = owners[changed['owner']]
        compare(changed['tree'], owner['roots'][changed['symbol']], owner, detected, name)
        mutations[name] = bool(detected)
    report = dict(status='passed-bounded-check' if not failures else 'failed', states=count,
                  uniquePngs=len(pngs), failures=failures, mutationRejected=mutations,
                  measurementSha256=hashlib.sha256((WORK/'measurement.json').read_bytes()).hexdigest(),
                  scope='Only recursive placement count/order/matrices/alpha at observed native frames and stage PNG alpha bounds. Not host AS3 timing, masks/filters equivalence, full local pixels or family closure.')
    (OUT/'effects-placement-verification.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='\n')
    print({k: v for k,v in report.items() if k not in ('failures', 'scope')})
    if failures:
        print('First failures:', failures[:12])
    assert not failures and all(mutations.values())


if __name__ == '__main__':
    main()
