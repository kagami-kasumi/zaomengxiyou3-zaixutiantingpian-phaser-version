"""Same independent geometry builder as pixel gate, evaluated against all original collision inputs."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
WORK=BASE/'rebuilt-collision-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-229'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    input_path=OUT/'geometry-inputs.json';data=json.loads(input_path.read_text())
    oracle_path=BASE/'natural-collision-air/measurement.json';oracle=json.loads(oracle_path.read_text())
    phases={p['key']:p for p in oracle['phases']};groups={}
    for s in data['sources']:
        for bitmap in s['bitmaps'].values():
            if 'argbPath' in bitmap:bitmap['absolutePath']=str(ROOT/bitmap['argbPath'])
    for i,row in enumerate(oracle['cases']):
        key=(row['phaseKey'],row['direction'],row['target'])
        if key not in groups:
            si=next(i for i,s in enumerate(data['sources']) if row['symbol'] in s['roots'])
            ti=next(i for i,s in enumerate(data['sources']) if row['target'] in s['roots'])
            groups[key]=dict(sourceIndex=si,cid=data['sources'][si]['roots'][row['symbol']],phase=phases[row['phaseKey']]['phase'],
                             targetSourceIndex=ti,targetCid=data['sources'][ti]['roots'][row['target']],targetScaleX=.5 if row['target']=='ObjectBaseSprite7' else 1,
                             direction=row['direction'],cases=[])
        groups[key]['cases'].append(dict(index=i,x=row['x'],y=row['y']))
    fixture=dict(sources=data['sources'],groups=list(groups.values()),suppressPending=False)
    fixture_path=WORK/'fixtures.json';fixture_path.write_text(json.dumps(fixture,separators=(',',':')))
    builder=BASE/'geometry-air/GeometryProbe.as';hook=ROOT/'tools/monkey-spatial/CollisionGeometryRun.as.inc'
    text=builder.read_text();assert text.count('private function run():void {')==1
    # Reuse the exact validated loader/builder prefix, replacing only the observation driver.
    text=text.split('private function run():void {')[0]+hook.read_text()+'}}'
    text=text.replace('GeometryProbe','RebuiltCollisionProbe').replace('package {','package {import my.HitTest;',1)
    probe=WORK/'RebuiltCollisionProbe.as';probe.write_text(text)
    (WORK/'my').mkdir(exist_ok=True);hit=ROOT/oracle['hitTestPath'];assert sha(hit)==oracle['hitTestSha256']
    shutil.copyfile(hit,WORK/'my/HitTest.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.rebuiltcollision</id>
<versionNumber>1.0.0</versionNumber><filename>RebuiltCollisionProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow>
<content>RebuiltCollisionProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-size=940,590','-output=RebuiltCollisionProbe.swf','RebuiltCollisionProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=240)
    output=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace')
    assert result.returncode==0 and f'COMPLETE {len(oracle["cases"])}' in output,output[-2000:]
    rows=[json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
    assert len(rows)==387960 and {r['index'] for r in rows}==set(range(387960))
    failures=[dict(index=r['index'],actual=r['hit'],expected=oracle['cases'][r['index']]) for r in rows if r['hit']!=oracle['cases'][r['index']]['hit']]
    report=dict(status='failed' if failures else 'passed-bounded',cases=len(rows),groups=len(groups),failures=failures,
                hits=sum(r['hit'] for r in rows),oracleSha256=sha(oracle_path),geometryInputsSha256=sha(input_path),builderSha256=sha(builder),
                driverSha256=sha(hook),compiledSourceSha256=sha(probe),fixturesSha256=sha(fixture_path),hitTestSha256=sha(hit),
                scope='Independent decoded geometry under original HitTest; finite original coordinates/directions/phase selectors, not arbitrary-space or full settlement proof.')
    (WORK/'actual.json').write_text(json.dumps(rows,separators=(',',':'))+'\n')
    (OUT/'rebuilt-collision-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 rebuilt collision:',len(rows),'cases;',len(groups),'phase/target groups;',len(failures),'differences')
    if failures:print(failures[:3]);raise SystemExit(1)


if __name__=='__main__':main()
