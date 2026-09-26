"""Source-only native HitTest samples; this is measurement, not a promoted contract."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/collision-air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    extracted = json.loads((OUT/'source-definitions.json').read_text())
    assert not extracted['unresolved']
    sources = [dict(id=s['id'], path=str(ROOT/s['closurePath']), sha256=s['closureSha256']) for s in extracted['sources']]
    for source in sources:
        assert sha(Path(source['path'])) == source['sha256']
    objects = [dict(symbol=symbol, owner=s['id'], sourceIndex=i, characterId=cid)
               for s in extracted['sources'] for i,(symbol,cid) in enumerate(s['roots'].items())]
    effects = [o for o in objects if o['symbol'].startswith('PetMonkey')]
    targets = [o for o in objects if o['symbol'] in ('ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7')]
    positions = [[x,y] for x in (-400,-150,-50,0,50,150,400) for y in (-100,-30,0,30)] + [[100000,100000]]
    fixture = dict(status='frozen-before-measurement', sources=sources, effects=effects, targets=targets,
                   positions=positions, ticks=121,
                   scope='Native timeline shape intersections only; target identities, lifecycle, follow and damage settlement are separate host fixtures.')
    (WORK/'fixtures.json').write_text(json.dumps(fixture,indent=2),encoding='utf-8')
    (OUT/'collision-fixtures.json').write_text(json.dumps(fixture,indent=2)+'\n',encoding='utf-8')
    hit = ROOT/'local-resources/regima/task-outputs/task-settings-218/source/scripts/my/HitTest.as'
    (WORK/'my').mkdir(exist_ok=True)
    shutil.copyfile(hit,WORK/'my/HitTest.as')
    probe = ROOT/'tools/monkey-spatial/CollisionProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task228.collision</id><versionNumber>1.0.0</versionNumber><filename>CollisionProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>CollisionProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    compile_args = ['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
                    '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=CollisionProbe.swf','CollisionProbe.as']
    result = subprocess.run(compile_args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode == 0,(result.stdout+result.stderr).decode(errors='replace')
    runtime = ROOT/'local-resources/regima/source/unpacked'
    command = [str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result = subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=240)
    lines = ((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    expected = len(effects)*2*len(targets)*len(positions)*122
    assert result.returncode == 0 and f'COMPLETE {expected}' in lines,'\n'.join(lines[-15:])
    cases = [json.loads(line[5:]) for line in lines if line.startswith('CASE ')]
    assert len(cases) == expected
    assert all(not c['hit'] for c in cases if c['x'] == 100000)
    assert any(c['hit'] for c in cases), 'No positive source hits'
    report = dict(status='measured-not-promoted',cases=cases,command=command,compileCommand=compile_args,
                  environment=[json.loads(line[4:]) for line in lines if line.startswith('ENV ')],
                  hitTestPath=hit.relative_to(ROOT).as_posix(),hitTestSha256=sha(hit),probeSha256=sha(probe),
                  fixturesSha256=sha(OUT/'collision-fixtures.json'),runtimeDllSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'))
    (WORK/'measurement.json').write_text(json.dumps(report,separators=(',',':'))+'\n',encoding='utf-8')
    print('228 native collision cases:',len(cases),'; hits:',sum(c['hit'] for c in cases))


if __name__ == '__main__':
    main()
