"""Run original pet action callbacks on original BBDC with explicit output sinks."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/callback-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    probe=ROOT/'tools/monkey-spatial/CallbackProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    shutil.copyfile(OUT/'body-inputs.json',WORK/'inputs.json')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task228.callbacks</id><versionNumber>1.0.0</versionNumber><filename>CallbackProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>CallbackProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
          '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=CallbackProbe.swf','CallbackProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
    lines=((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    inputs=json.loads((OUT/'body-inputs.json').read_text())
    expected=sum(len(f['actions']) for f in inputs['forms'])*12+72
    assert result.returncode==0 and f'COMPLETE {expected}' in lines,'\n'.join(lines[-12:])
    cases=[json.loads(line[5:]) for line in lines if line.startswith('CASE ')]
    assert len(cases)==expected
    report=dict(status='measured-not-promoted',cases=cases,command=command,compileCommand=args,
                probeSha256=sha(probe),methodsSha256=sha(OUT/'callback-methods.json'),
                scope='Original action/body callbacks with explicit output sinks; see callback-methods.json boundaries.')
    (WORK/'measurement.json').write_text(json.dumps(report,separators=(',',':'))+'\n',encoding='utf-8')
    print('228 callback cases:',len(cases))



if __name__=='__main__':main()
