"""Run original pet action callbacks on original BBDC with explicit output sinks."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/cleanup-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    probe=ROOT/'tools/monkey-spatial/CleanupProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    source=json.loads((OUT/'source-definitions.json').read_text())
    fixtures=dict(sources=[dict(path=str(ROOT/s['path']),sha256=s['sha256']) for s in source['sources']])
    (WORK/'fixtures.json').write_text(json.dumps(fixtures),encoding='utf-8')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task228.cleanup</id><versionNumber>1.0.0</versionNumber><filename>CleanupProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>CleanupProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
          '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=CleanupProbe.swf','CleanupProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
    lines=((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    assert result.returncode==0 and 'COMPLETE' in lines,'\n'.join(lines[-20:])
    states=[json.loads(line[6:]) for line in lines if line.startswith('STATE ')]
    fire=[json.loads(line[5:]) for line in lines if line.startswith('FIRE ')]
    for row in fire:row['sha256']=sha(WORK/row['path'])
    report=dict(status='measured-not-promoted',states=states,fire=fire,
                removed=[json.loads(line[8:]) for line in lines if line.startswith('REMOVED ')],
                command=command,probeSha256=sha(probe),methodsSha256=sha(OUT/'cleanup-methods.json'))
    (WORK/'measurement.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('228 cleanup:',len(states),'destruction states;',len(fire),'target FireBuff frames')




if __name__=='__main__':main()
