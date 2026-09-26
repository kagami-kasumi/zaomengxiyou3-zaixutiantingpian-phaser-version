"""228 full restored-source native playback; no modern atlas/renderer input."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-229/ice-display-air'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-229'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    extracted = json.loads((OUT/'source-definitions.json').read_text())
    extracted['sources']=[s for s in extracted['sources'] if s['id']=='StageCommon']
    sources = [dict(id=Path(s['path']).stem, path=str(ROOT / s['closurePath']), sha256=s['closureSha256'],
                    originalPath=s['path'], originalSha256=s['sha256']) for s in extracted['sources']]
    for source in sources:
        assert sha(Path(source['path'])) == source['sha256']
    assert not extracted['unresolved'], 'Source display scripts must be resolved before playback'
    effects = [dict(symbol=symbol, owner=source['id'], characterId=cid, sourceIndex=i, scales=[1])
               for source in extracted['sources'] for i,(symbol,cid) in enumerate(source['roots'].items())
               if symbol == 'PetHorseIceEffect']
    fixtures = dict(taskId='TASK-SETTINGS-229', status='frozen-before-measurement', sources=sources,
                    effects=effects, ticks=1, stage=[940, 590],
                    scope='Native MovieClip playback after explicit recursive gotoAndStop(1), synchronous baseline then recursive play(). Single-frame ice display only; actual attachment/expiry are independently sampled by IceProbe.')
    (WORK / 'fixtures.json').write_text(json.dumps(fixtures, indent=2), encoding='utf-8')
    (OUT / 'ice-display-fixtures.json').write_text(json.dumps(fixtures, indent=2)+'\n', encoding='utf-8', newline='\n')
    probe = ROOT / 'tools/turtle-visual/VisualProbe.as'
    shutil.copyfile(probe, WORK / probe.name)
    (WORK / 'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task229.icedisplay</id><versionNumber>1.0.0</versionNumber><filename>VisualProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>VisualProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''', encoding='utf-8')
    compile_args = ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air',
                    '-debug=true', '-default-frame-rate=24', '-default-size=940,590', '-output=VisualProbe.swf', 'VisualProbe.as']
    compile_result = subprocess.run(compile_args, cwd=WORK, capture_output=True, timeout=60)
    (WORK / 'compile.log').write_bytes(compile_result.stdout+compile_result.stderr)
    assert compile_result.returncode == 0, (compile_result.stdout+compile_result.stderr).decode(errors='replace')
    runtime = ROOT / 'local-resources/regima/source/unpacked'
    command = [str(SDK/'bin/adl.exe'), '-runtime', str(runtime), '-profile', 'desktop', str(WORK/'application.xml'), str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout, (WORK/'stderr.log').open('wb') as stderr:
        result = subprocess.run(command, cwd=WORK, stdout=stdout, stderr=stderr, timeout=240)
    lines = ((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode('utf-8', errors='replace').splitlines()
    assert result.returncode == 0 and f'COMPLETE 1 {len(effects)}' in lines, '\n'.join(lines[-15:])
    states = [json.loads(line[6:]) for line in lines if line.startswith('STATE ')]
    assert len(states) == len(effects)*2
    for state in states:
        for baseline in [*state['baselines'],state['localImage']]:
            path = WORK / baseline['path']
            baseline['sha256'] = sha(path)
            baseline['path'] = path.relative_to(ROOT).as_posix()
    report = dict(status='measured-not-promoted', command=command, compileCommand=compile_args,
                  environment=[json.loads(line[4:]) for line in lines if line.startswith('ENV ')],
                  probeSha256=sha(probe), probeSwfSha256=sha(WORK/'VisualProbe.swf'),
                  runtimeDllSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
                  fixturesSha256=sha(OUT/'ice-display-fixtures.json'), states=states)
    (WORK/'measurement.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print('229 static ice display states:',len(states),'; measurement:',WORK/'measurement.json')


if __name__ == '__main__':
    main()
