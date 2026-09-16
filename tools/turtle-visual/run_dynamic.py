"""Compile and run source-method/native-symbol dynamic visual sampling."""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/dynamic-air'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def main():
    global WORK
    buff='--buff' in sys.argv
    if buff:
        source_work=WORK;WORK=WORK.parent/'buff-air';WORK.mkdir(parents=True,exist_ok=True)
        for path in source_work.rglob('*.as'):
            target=WORK/path.relative_to(source_work);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    fixture=json.loads((WORK.parent/'owner-air/fixtures.json').read_text(encoding='utf-8'))
    fixture['mode']='buff' if buff else 'dynamic'
    for source in fixture['sources']:
        assert hashlib.sha256(Path(source['path']).read_bytes()).hexdigest()==source['sha256']
    fixture['bodies']=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/body-inputs.json').read_text(encoding='utf-8'))
    (WORK/'fixtures.json').write_text(json.dumps(fixture),encoding='utf-8')
    shutil.copyfile(ROOT/'tools/turtle-visual/DynamicProbe.as',WORK/'DynamicProbe.as')
    shutil.copyfile(ROOT/'tools/turtle-visual/NativeTree.as',WORK/'NativeTree.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task222a.dynamic</id><versionNumber>1.0.0</versionNumber><filename>DynamicProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>DynamicProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    command=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-size=940,590','-output=DynamicProbe.swf','DynamicProbe.as']
    result=subprocess.run(command,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,stdout=stdout,stderr=stderr,timeout=600)
    log=(WORK/'stdout.log').read_text(encoding='utf-8',errors='replace')+(WORK/'stderr.log').read_text(encoding='utf-8',errors='replace')
    assert result.returncode==0 and 'COMPLETE' in log,log[-4000:]
    measured=json.loads((WORK/'measurement.json').read_text(encoding='utf-8'))
    print('222A dynamic native sampling:',len(measured['rows']),'states;',len({r['id'] for r in measured['rows']}),'cases;',measured['errors'])


if __name__=='__main__':main()
