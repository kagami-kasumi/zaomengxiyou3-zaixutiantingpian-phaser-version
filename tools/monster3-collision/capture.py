"""248: native restored MovieClip and original HitTest, frozen bounded fixtures."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import sys
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
ATTACK = int(sys.argv[sys.argv.index('--attack')+1]) if '--attack' in sys.argv else 1
assert ATTACK in (1, 2)
FRAMES = 5 if ATTACK == 1 else 10
WORK = ROOT / f'local-resources/regima/task-outputs/TASK-SETTINGS-248/attack{ATTACK}/air'
OUT = ROOT / f'docs/tasks/evidence/TASK-SETTINGS-248/attack{ATTACK}'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def method(path, name):
    text = path.read_text(encoding='utf-8')
    match = re.search(r'public static function ' + name + r'\(', text)
    assert match, (path, name)
    start = text.index('{', match.end())
    depth, end = 1, start + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[match.start():end]


def main():
    previous = json.loads((OUT/'native.json').read_text(encoding='utf-8')) if '--repeat' in sys.argv else None
    previous_fields = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (WORK/'fields').glob('*.deflate')} if previous else {}
    previous_pngs = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (WORK/'baselines').glob('*.png')} if previous else {}
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    # Fixtures are fixed before measurement. Targets are supplied by source-profile audit.
    profiles_path = ROOT/'tools/monster30-collision/profiles.json'
    profiles = json.loads(profiles_path.read_text(encoding='utf-8'))
    cases = [dict(id='center', anchor='center', x=0, y=0),
             dict(id='disjoint', anchor='absolute', x=2000, y=900)]
    for edge in ['left', 'right', 'top', 'bottom']:
        for overlap in [-1, 0, .05, .25, .5, .95, 1, 1.05, 2, 4, 8, 16, 32]:
            for along in [-30, 0, 30]:
                cases.append(dict(id=f'{edge}-{overlap}-{along}', anchor=edge,
                                  overlap=overlap, along=along))
    for phase in range(20):
        cases.append(dict(id=f'phase-{phase}', anchor='root', x=phase/20,
                          y=-20 + ((phase*7) % 20)/20))
    for owner, x, y in [('P1', 123.25, 345.75), ('P2', 731.75, 412.25)]:
        for dx in [-140, 0, 140]:
            cases.append(dict(id=f'{owner}-{dx}', anchor='translated-root', x=dx, y=-20,
                              sourceX=x, sourceY=y))
    for gx in range(-220, 121, 20):
        for gy in range(-100, 101, 20):
            for phase in [0, .05, .25, .5, .95]:
                cases.append(dict(id=f'grid-{gx}-{gy}-{phase}', anchor='root', x=gx+phase, y=gy+phase))
    fixtures = dict(fixtureVersion=2, task='TASK-SETTINGS-248', symbol=f'Monster3Bullet{ATTACK}', frames=FRAMES, signs=[1, -1],
                    profiles=profiles, cases=cases,
                    expectedCases=FRAMES*2*len(profiles)*len(cases),
                    sampling='20x20 twip phases; all pixels; original HitTest oracle',
                    limitations='Isolated spatial predicates; no HP, AI or full game Scene claim')
    diagnostic_path = OUT/'sampling-diagnostic.json'
    if diagnostic_path.exists():
        diagnostics = json.loads(diagnostic_path.read_text(encoding='utf-8'))
        fixtures['diagnostics'] = [r['id'] for r in diagnostics['reports'][-1]['mismatches']]
    save(OUT/'fixtures.json', fixtures)
    save(WORK/'fixtures.json', fixtures)
    sources = []
    for source, target in [(ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf', 'source.swf'),
                           (ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf', 'common.swf'),
                           (SRC/'my/HitTest.as', 'my/HitTest.as')]:
        (WORK/target).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, WORK/target)
        sources.append(dict(path=source.relative_to(ROOT).as_posix(),
                            sha256=hashlib.sha256(source.read_bytes()).hexdigest()))
    broad = method(SRC/'AUtils.as', 'testIntersects')
    (WORK/'AUtils.as').write_text('package {import flash.display.DisplayObjectContainer; public class AUtils {' + broad + '}}', encoding='utf-8')
    sources.append(dict(path=(SRC/'AUtils.as').relative_to(ROOT).as_posix(),
                        method='testIntersects', sha256=hashlib.sha256(broad.encode()).hexdigest()))
    shutil.copyfile(Path(__file__).with_name('Probe.as'), WORK/'Probe.as')
    (WORK/'application.xml').write_text(f'<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task248.collision.attack{ATTACK}</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>', encoding='utf-8')
    commands = [['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'),
                 '+configname=air', '-debug=true', '-default-size=940,590', '-default-frame-rate=24',
                 '-output=Probe.swf', 'Probe.as'],
                [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'),
                 str(WORK/'application.xml'), str(WORK)]]
    for label, command in zip(['compile', 'run'], commands):
        result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=600)
        log = (result.stdout+b'\n'+result.stderr).decode(errors='replace')
        (OUT/(label+'.log')).write_text(log, encoding='utf-8')
        assert result.returncode == 0, log[-5000:]
    assert 'COMPLETE' in log and '51,1,1,5' in log, log[-3000:]
    rows = [json.loads(line[5:]) for line in log.splitlines() if line.startswith('CASE ')]
    trees = [json.loads(line[5:]) for line in log.splitlines() if line.startswith('TREE ')]
    masks = [json.loads(line[5:]) for line in log.splitlines() if line.startswith('MASK ')]
    assert len(rows) == fixtures['expectedCases'] and len(trees) == FRAMES and len(masks) == FRAMES*2 + len(profiles)
    if previous:
        assert previous['cases'] == rows, 'Native cases changed on repeat'
        assert previous['trees'] == trees, 'Native display trees changed on repeat'
        assert previous_pngs == {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (WORK/'baselines').glob('*.png')}, 'Native baseline PNG changed on repeat'
        assert previous_fields == {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (WORK/'fields').glob('*.deflate')}, 'Native phase fields changed on repeat'
        save(OUT/'repeat.json', dict(status='passed', cases=len(rows), phaseFields=len(masks), sourceCasesEqual=True, fieldBytesEqual=True, displayTreesEqual=True, baselinePngBytesEqual=True))
    save(OUT/'native.json', dict(probeSha256=hashlib.sha256((WORK/'Probe.as').read_bytes()).hexdigest(), fixtureSha256=hashlib.sha256((WORK/'fixtures.json').read_bytes()).hexdigest(), bufferSha256=hashlib.sha256((WORK/'buffers.deflate').read_bytes()).hexdigest(), fieldHashes={p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (WORK/'fields').glob('*.deflate')}, status='captured-not-yet-verified', runtime='AIR 51.1.1.5',
                               sources=sources, commands=commands, projections=[json.loads(line[8:]) for line in log.splitlines() if line.startswith('PROJECT ')], cases=rows, trees=trees, masks=masks, targets=[json.loads(line[7:]) for line in log.splitlines() if line.startswith('TARGET ')]))
    print(f'248 native capture: {len(rows)} cases, {len(trees)} recursive trees, {len(masks)} phase fields')


if __name__ == '__main__':
    main()
