"""Run original bitmap clip methods with native source JPEG3 atlas decoding."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/body-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    probe=ROOT/'tools/turtle-visual/BodyProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    shutil.copyfile(OUT/'body-inputs.json',WORK/'inputs.json')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task222a.body</id><versionNumber>1.0.0</versionNumber><filename>BodyProbe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>BodyProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
          '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=BodyProbe.swf','BodyProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
    lines=((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    assert result.returncode==0 and 'COMPLETE 372' in lines,'\n'.join(lines[-12:])
    cells=[json.loads(line[5:]) for line in lines if line.startswith('CELL ')]
    clocks=[json.loads(line[6:]) for line in lines if line.startswith('CLOCK ')]
    for cell in cells:
        path=WORK/cell['file'];cell['file']=path.relative_to(ROOT).as_posix();cell['sha256']=sha(path)
    report=dict(status='measured-not-promoted',cells=cells,clocks=clocks,command=command,compileCommand=args,
                probeSha256=sha(probe),probeSwfSha256=sha(WORK/'BodyProbe.swf'),bodyClipSha256=sha(WORK/'BodyClip.as'),
                inputsSha256=sha(OUT/'body-inputs.json'),sourceWrapperSha256=sha(WORK/'body-source.swf'),
                runtimeDllSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
                scope='Native original BBDC bitmap-mode methods; row completion callback resets column for observation. Not original PetTurtle action completion/lifecycle.')
    (WORK/'measurement.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('222A body:',len(cells),'P1/P2 cell baselines,',len(clocks),'source-clock steps')


if __name__=='__main__':main()
