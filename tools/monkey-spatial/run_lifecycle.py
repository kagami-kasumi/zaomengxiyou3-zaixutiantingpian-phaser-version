"""Run original bullet classes on native timelines at the requested stage frame rate."""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/lifecycle-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    probe=ROOT/'tools/monkey-spatial/LifecycleProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',WORK/'NativeTree.as')
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    extracted=json.loads((OUT/'source-definitions.json').read_text())
    sources=[dict(path=str(ROOT/s['path']),sha256=s['sha256']) for s in extracted['sources']]
    effects=[dict(symbol=n,follow=n in ['PetMonkey1Bullet2','PetMonkey2Bullet2_1','PetMonkey2Bullet2_2','PetMonkey3Bullet3_1','PetMonkey3Bullet3_2'],
                  disabled=n in ['PetMonkey2Bullet2_1','PetMonkey3Bullet3_1'],xj=n=='PetMonkey1Bullet2')
             for n in extracted['sources'][0]['roots']]
    fixture=dict(fps=fps,sources=sources,effects=effects)
    (WORK/'fixtures.json').write_text(json.dumps(fixture),encoding='utf-8')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task228.lifecycle</id><versionNumber>1.0.0</versionNumber><filename>LifecycleProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>LifecycleProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
          '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=LifecycleProbe.swf','LifecycleProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
    lines=((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    assert result.returncode==0 and any(line.startswith('COMPLETE ') for line in lines),'\n'.join(lines[-12:])
    rows=json.loads((WORK/'rows.json').read_text())
    assert len(rows)==len(effects)*16*(1+2*(fps*4+8))
    report=dict(status='measured-not-promoted',fixtures=fixture,rows=rows,command=command,compileCommand=args,
                environment=[json.loads(line[4:]) for line in lines if line.startswith('ENV ')],
                probeSha256=sha(probe),methodsSha256=sha(OUT/'lifecycle-methods.json'),
                scope='Original bullet lifecycle on actual native timelines; collision and settlement are explicit sinks.')
    phases=json.loads((WORK/'native-phases.json').read_text())
    for phase in phases.values():
        phase['sha256']=sha(WORK/phase['path'])
    report['nativePhases']=phases
    (WORK/f'measurement-{fps}.json').write_text(json.dumps(report,separators=(',',':'))+'\n',encoding='utf-8')
    print('228 native lifecycle:',fps,'fps;',len(rows),'rows')




if __name__=='__main__':main()
