"""Run the bounded source target-fire projection on original native display classes."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/fire-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def main():
    probe=ROOT/'tools/monkey-spatial/FireProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    sources=json.loads((OUT/'source-definitions.json').read_text())['sources']
    fixtures=dict(sources=[dict(path=str(ROOT/s['path']),sha256=s['sha256']) for s in sources])
    (WORK/'fixtures.json').write_text(json.dumps(fixtures))
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.fire</id>
<versionNumber>1.0.0</versionNumber><filename>FireProbe</filename><supportedProfiles>desktop</supportedProfiles>
<initialWindow><content>FireProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),
          '+configname=air','-debug=true','-output=FireProbe.swf','FireProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result=subprocess.run(command,cwd=WORK,capture_output=True,timeout=60)
    output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-2000:]
    rows=[json.loads(line[6:]) for line in output.splitlines() if line.startswith('STATE ')]
    report=dict(status='measured-not-promoted',rows=rows,command=command,probeSha256=hashlib.sha256(probe.read_bytes()).hexdigest(),
                methodsSha256=hashlib.sha256((OUT/'fire-methods.json').read_bytes()).hexdigest())
    (WORK/'measurement.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('228 target fire:',len(rows),'states')


if __name__=='__main__':main()
