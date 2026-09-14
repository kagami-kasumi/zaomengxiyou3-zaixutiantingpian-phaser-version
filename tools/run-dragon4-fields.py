"""Original AIR field measurements, separate from the original HitTest oracle."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LOCAL=ROOT/'local-resources/regima/task-outputs/task-settings-220'
WORK=LOCAL/'fields-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-220/source-fields'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(LOCAL/'source.swf',WORK/'source.swf')
    probe=ROOT/'tools/air-collision/Dragon4FieldsProbe.as'
    shutil.copyfile(probe,WORK/probe.name);shutil.copyfile(probe,OUT/'probe.as.txt')
    xml=(LOCAL/'air/application.xml').read_text().replace('Dragon23Probe','Dragon4FieldsProbe').replace('collisionprobe','fieldprobe')
    (WORK/'application.xml').write_text(xml)
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
          '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=Dragon4FieldsProbe.swf','Dragon4FieldsProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (OUT/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result=subprocess.run(command,cwd=WORK,capture_output=True,timeout=180)
    (OUT/'stdout.log').write_bytes(result.stdout);(OUT/'stderr.log').write_bytes(result.stderr)
    lines=(result.stdout+b'\n'+result.stderr).decode('utf-8',errors='replace').splitlines()
    assert result.returncode==0 and 'COMPLETE 30 15' in lines,'\n'.join(lines[-10:])
    fields=[json.loads(l[6:]) for l in lines if l.startswith('FIELD ')]
    assert len(fields)==30
    for field in fields:
        name=field['id']+'.deflate';shutil.copyfile(WORK/'fields'/name,OUT/name);field['sha256']=sha(OUT/name)
    report=dict(status='measured-not-promoted',fields=fields,command=command,compileCommand=args,exitCode=0,
                probeSha256=sha(probe),probeSwfSha256=sha(WORK/'Dragon4FieldsProbe.swf'),sourceSubsetSha256=sha(LOCAL/'source.swf'),
                runtimeDllSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
                independence='No oracle cases/buffers or expected hit booleans are read. Original source display bytes only.')
    (OUT/'measurement.json').write_text(json.dumps(report,indent=2)+'\n')
    print('220 fields: 30 original masked source fields, 16 quarter phases each; equivalence not yet verified.')


if __name__=='__main__': main()
