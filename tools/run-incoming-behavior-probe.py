"""Run extracted original damage/display-dispatch slices with external service fixtures."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys
import importlib.util
sys.dont_write_bytecode=True

ROOT = Path(__file__).resolve().parents[1]
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
RUNTIME = ROOT / 'local-resources/regima/source/unpacked'
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT / 'local-resources/regima/task-outputs/task-settings-215/air-behavior'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-215/behavior-native'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    WORK.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT/'tools/incoming-number/BehaviorProbe.as', WORK/'BehaviorProbe.as')
    spec=importlib.util.spec_from_file_location('prepare_behavior',ROOT/'tools/incoming-number/prepare_behavior.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    slices=module.prepare(WORK,SRC)
    descriptor = '''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task215.behaviorprobe</id><versionNumber>1.0.0</versionNumber><filename>BehaviorProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>BehaviorProbe.swf</content><visible>false</visible><width>940</width><height>590</height><systemChrome>none</systemChrome></initialWindow></application>'''
    (WORK/'application.xml').write_text(descriptor, encoding='utf-8')
    compile_cmd = ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-default-frame-rate=24', '-default-size=940,590', '-output=BehaviorProbe.swf', 'BehaviorProbe.as']
    cr = subprocess.run(compile_cmd, cwd=WORK, capture_output=True, timeout=60)
    (OUT/'compile.log').write_bytes(cr.stdout+cr.stderr)
    if cr.returncode: raise RuntimeError((cr.stdout+cr.stderr).decode(errors='replace'))
    cmd = [str(SDK/'bin/adl.exe'), '-runtime', str(RUNTIME), '-profile', 'desktop', str(WORK/'application.xml'), str(WORK)]
    rr = subprocess.run(cmd, cwd=WORK, capture_output=True, timeout=60)
    (OUT/'stdout.log').write_bytes(rr.stdout); (OUT/'stderr.log').write_bytes(rr.stderr)
    lines = (rr.stdout+b'\n'+rr.stderr).decode(errors='replace').splitlines()
    measurements = [json.loads(x[5:]) for x in lines if x.startswith('CASE ')]
    if rr.returncode or 'COMPLETE' not in lines: raise RuntimeError('ADL failed: '+ '\n'.join(lines[-20:]))
    assert len(measurements)==22,len(measurements)
    report = {'status':'measured-not-promoted','runtime':'original AIR runtime 51.1.1.5','sdk':'AIRSDK_51.3.4','compileCommand':compile_cmd,'runCommand':cmd,'exitCode':rr.returncode,'sourceSlices':slices,'measurements':measurements,
        'probeSha256':sha(ROOT/'tools/incoming-number/BehaviorProbe.as'),'prepareSha256':sha(ROOT/'tools/incoming-number/prepare_behavior.py'),
        'compiledSha256':sha(WORK/'BehaviorProbe.swf'),'runtimeSha256':sha(RUNTIME/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
        'generatedSources':{p.relative_to(WORK).as_posix():sha(p) for p in sorted(WORK.rglob('*.as'))},
        'coveredFixtureIds':[m['id'] for m in measurements],
        'scope':'Original computational prefixes through pnum production and HP clamp, full shield residual methods and remote refresh. External scene/player/network services are fixture adapters; ANumber is an argument capture sink.',
        'excluded':'Death/respawn actions and MP, full role damage overrides, upstream hit geometry/effect scheduling/network transport. No handwritten damage algorithm.'}
    (OUT/'measurement.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'status':report['status'],'measurements':len(measurements),'sourceSlices':len(slices)}))
if __name__ == '__main__': main()
