"""Verify a source display-list state closure and project canonical observed phase ticks."""
import hashlib
import json
from pathlib import Path
import sys
from native_phase_model import NativePhaseModel

ROOT = Path(__file__).resolve().parents[2]
def read(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
family = 'monkey' if '--monkey' in sys.argv else 'horse'
task = 228 if family == 'monkey' else 229
definitions = read(f'docs/tasks/evidence/TASK-SETTINGS-{task}/source-definitions.json')
geometry = read(f'docs/tasks/evidence/TASK-SETTINGS-{task}/geometry-inputs.json')
assert not definitions['unresolved']
for source in definitions['sources']:
    assert sha(source['path']) == source['sha256']
    assert sha(source['xmlPath']) == source['xmlSha256']
for script in definitions['scripts']:
    assert script['trivialConstructorOnly'] and sha(script['path']) == script['sha256']
# Re-run the existing narrow SWF timeline parser: unexpected actions/clip actions
# are hard failures, so the finite model has no unmodeled script-driven state.
sys.path.insert(0, str(ROOT/'tools'))
import runpy
import xml.etree.ElementTree as ET
parser = runpy.run_path(str(ROOT/'tools/dragon23-collision-source.py'))['timelines']
for source in definitions['sources']:
    ids = set(source['definitions'])
    nodes = {int(n.get('spriteId')): n for n in ET.parse(ROOT/source['xmlPath']).getroot().find('tags') if n.get('spriteId') in ids}
    parsed = parser(nodes, allow_clip_depth=True)
    original = next(s for s in geometry['sources'] if s['id'] == source['id'])
    assert original['sourceSha256'] == source['sha256']
    # Geometry projection preserves the timing/placement identities consumed here.
    for cid, frames in parsed.items():
        actual = original['timelines'][str(cid)]
        assert [[(p['depth'], p['characterId'], p['placedAt']) for p in f] for f in frames] == [[(p['depth'], p['characterId'], p['placedAt']) for p in f] for f in actual]
        # Rewind reconstruction also distinguishes unchanged from changed shapes.
        before = {p['depth']: p for p in frames[-1]}
        projected_before = {p['depth']: p for p in actual[-1]}
        assert [before.get(p['depth']) == p for p in frames[0]] == [projected_before.get(p['depth']) == p for p in actual[0]]

oracle_path = f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}/natural-collision-air/measurement.json'
assert sha(oracle_path) == read(f'docs/tasks/evidence/TASK-SETTINGS-{task}/natural-collision-verification.json')['measurementSha256']
oracle = read(oracle_path)
observed = {(r['symbol'], r['tick']): json.loads(r['phaseKey'].split('|', 1)[1]) for r in oracle['cases']}
clips, models = {}, {}
checked = 0
for source in geometry['sources']:
    for symbol, cid in source['roots'].items():
        if not symbol.startswith('Pet'+family.title()) or symbol == 'PetHorseIceEffect':
            continue
        cycle = NativePhaseModel(source, cid).cycle()
        assert len(cycle['phases']) <= 121, symbol
        for tick in range(122):
            age = max(1, tick)
            canonical = age if age < cycle['start'] else cycle['start'] + (age-cycle['start']) % cycle['period']
            assert cycle['phases'][canonical-1] == observed[symbol, tick], (symbol, tick)
            checked += 1
        clips[symbol] = dict(rootFrames=len(source['timelines'][str(cid)]), cycleStart=cycle['start'], cycleTicks=cycle['period'])
        models[symbol] = cycle

def frames(phase):
    return ([phase['frame']] if phase.get('frame') else []) + [f for c in phase.get('children', []) for f in frames(c)]
pause_checked = 0
for suffix, fps in [(suffix, fps) for suffix in ([''] if family == 'monkey' else ['', '-long']) for fps in [20, 24, 30]]:
    report = read(f'docs/tasks/evidence/TASK-SLICE-226/{family}-world-pause-native{suffix}.json')
    data_path = f'local-resources/regima/task-outputs/TASK-SLICE-226/{family}-world-pause-air{suffix}/measurement-{fps}.json'
    assert sha(data_path) == next(r for r in report['reports'] if r['fps'] == fps)['sha256']
    data = read(data_path)
    for row in data['rows']:
        symbol = row['before']['symbol']
        if symbol not in clips or row['before']['dead']:
            continue
        c = clips[symbol]; age = row['tick']
        canonical = age if age < c['cycleStart'] else c['cycleStart'] + (age-c['cycleStart']) % c['cycleTicks']
        assert frames(models[symbol]['phases'][canonical-1]) == row['before']['phaseFrames'], (fps, row['id'], age)
        pause_checked += 1
data = dict(sourceTask=f'TASK-SETTINGS-{task}', sourceHashes={s['id']:s['sha256'] for s in definitions['sources']},
            clips=clips, scope='Script-free source timeline state closure; canonical ticks index existing independently verified native collision fields. Render rasters are a separate contract.')
target = ROOT/f'src/assets/pet-{family}-native-clocks.json'
payload = json.dumps(data, indent=2)+'\n'
if '--check' in sys.argv:
    assert target.read_text(encoding='utf-8') == payload
else:
    target.write_text(payload, encoding='utf-8', newline='\n')
report = dict(status='verified-source-timeline-closure', nativeCollisionPhases=checked, livePrivatePauseStates=pause_checked,
              modelSha256=sha('tools/pet226-body/native_phase_model.py'), generatorSha256=sha('tools/pet226-body/generate_horse_clocks.py'),
              outputSha256=hashlib.sha256(payload.encode()).hexdigest(), clips=clips, scope=data['scope'])
(ROOT/f'docs/tasks/evidence/TASK-SLICE-226/{family}-native-clocks-verification.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(f'{checked} native recursive collision phases and {pause_checked} live private pause states match source finite timeline closure.')
