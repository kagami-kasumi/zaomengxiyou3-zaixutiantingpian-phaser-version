"""Run finite 221 AS3 behavior cases in the original bundled AIR runtime."""
import json
import shutil
import subprocess
from pathlib import Path
from prepare import ROOT, prepare

SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-221/air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-221'

def run(mutation=None, settlement=False, hit=False):
    global WORK
    WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-221/air'/('hit' if hit else 'settlement' if settlement else 'family')
    WORK.mkdir(parents=True,exist_ok=True)
    if hit:
        from hit import prepare as prepare_hit
        records=prepare_hit(WORK)
        (WORK/'Probe.as').write_text(Path(__file__).with_name('HitProbe.as').read_text().replace('HitProbe','Probe'))
    elif settlement:
        from settlement import prepare as prepare_settlement
        records=prepare_settlement(WORK)
        # The class name remains Probe to reuse the bounded launcher.
        (WORK/'Probe.as').write_text(Path(__file__).with_name('SettlementProbe.as').read_text().replace('SettlementProbe','Probe'))
    else:
        records=prepare(WORK,mutation)
        shutil.copyfile(Path(__file__).with_name('Probe.as'),WORK/'Probe.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.0"><id>turtle.source.probe</id><versionNumber>1.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>''')
    result=subprocess.run([str(SDK/'bin/mxmlc.bat'),'+configname=air','-debug=true','-source-path='+str(WORK),'-output='+str(WORK/'Probe.swf'),str(WORK/'Probe.as')],capture_output=True,timeout=60)
    if result.returncode:
        raise RuntimeError((result.stdout+result.stderr).decode(errors='replace'))
    result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)],capture_output=True,timeout=60)
    log=(result.stdout+result.stderr).decode(errors='replace')
    if result.returncode or 'COMPLETE' not in log:
        raise RuntimeError(str(result.returncode)+': '+log)
    cases=[json.loads(line[5:]) for line in log.splitlines() if line.startswith('CASE ')]
    return dict(runtime=next(line[4:] for line in log.splitlines() if line.startswith('ENV ')),sources=records,cases=cases)

if __name__=='__main__':
    import sys
    settlement='--settlement' in sys.argv
    hit='--hit' in sys.argv
    result=run(settlement=settlement,hit=hit);OUT.mkdir(parents=True,exist_ok=True)
    (OUT/('hit-trace.json' if hit else 'settlement-trace.json' if settlement else 'source-trace.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('AS3 source cases:',len(result['cases']))
