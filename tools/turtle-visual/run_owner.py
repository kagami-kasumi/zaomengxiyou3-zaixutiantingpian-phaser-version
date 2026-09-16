"""Native currentDomain/getDefinitionByName check with original restored packages."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/owner-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    located=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json').read_text())
    sources=[dict(id=Path(s['path']).stem,path=str(ROOT/s['path']),sha256=s['sha256'],symbols=list(s['symbols'])) for s in reversed(located['sources'])]
    for source in sources:assert sha(Path(source['path']))==source['sha256']
    fixture=dict(sources=sources,scope='StageCommon preload then pet1 on stage entry; same currentDomain registration and getDefinitionByName as source. Other preload assets excluded.')
    (WORK/'fixtures.json').write_text(json.dumps(fixture,indent=2),encoding='utf-8')
    probe=ROOT/'tools/turtle-visual/OwnerProbe.as';shutil.copyfile(probe,WORK/probe.name)
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task222a.owner</id><versionNumber>1.0.0</versionNumber><filename>OwnerProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>OwnerProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=OwnerProbe.swf','OwnerProbe.as']
    compiled=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(compiled.stdout+compiled.stderr)
    assert compiled.returncode==0,(compiled.stdout+compiled.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=90)
    lines=((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    assert result.returncode==0 and 'COMPLETE' in lines,'\n'.join(lines[-20:])
    objects=[json.loads(line[7:]) for line in lines if line.startswith('OBJECT ')]
    assert len(objects)==13
    definitions=[json.loads(line[12:]) for line in lines if line.startswith('DEFINITIONS ')]
    assert len(definitions)==3 and not any(definitions[0]['values'].values())
    acquired=set()
    for phase,source in zip(definitions[1:],sources):
        acquired.update(source['symbols'])
        assert {key for key,value in phase['values'].items() if value}==acquired
    report=dict(status='measured-not-promoted',fixtures=fixture,objects=objects,
                definitions=definitions,
                loaded=[line[7:] for line in lines if line.startswith('LOADED ')],command=command,compileCommand=args,
                probeSha256=sha(probe),probeSwfSha256=sha(WORK/'OwnerProbe.swf'),runtimeDllSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'))
    (OUT/'owner-native.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A native owner lookup:',len(objects),'objects',report['loaded'])


if __name__=='__main__':main()
