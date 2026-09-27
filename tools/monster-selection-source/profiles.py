"""Run the original twelve constructors using 237's proven constructor harness.
Only the radius/profile loop runs; no 237 motion output is changed or regenerated.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-239'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-239/profiles'
spec=importlib.util.spec_from_file_location('profile237',ROOT/'tools/monster-knockback-profile-source/capture.py')
profile=importlib.util.module_from_spec(spec);spec.loader.exec_module(profile)


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    profile.WORK=WORK;profile.OUT=OUT
    profile.prepare(None)
    # Preserve the original declaration initializer too; constructor assignments
    # overwrite it. This avoids silently assuming all twelve override a zero stub.
    src=profile.old.source.SRC
    original=(src/'base/BaseMonster.as').read_text(encoding='utf-8')
    initial=re.search(r'protected var alertRange:int = ([^;]+);',original)[1]
    p=WORK/'BaseMonster.as';s=p.read_text(encoding='utf-8').replace('alertRange:Number,','alertRange:Number='+initial+',');p.write_text(s,encoding='utf-8')
    p=WORK/'Probe.as';s=p.read_text(encoding='utf-8')
    s=s.replace('run();runEnvironments();','trace("ENV "+Capabilities.version);runRadii();')
    extra='''
private function runRadii():void {
 for(var k:int=0;k<ids.length;k++) for each(var ctx:Array in [[1,1],[1,2],[1,3],[2,1],[2,2]]) for each(var fps:int in [20,24,30]) {
 var w:Sprite=new Sprite();addChild(w);var p:BaseMonster=body(w,k,ctx,fps);
 profiles.push({monsterId:ids[k],stage:ctx[0],level:ctx[1],fps:fps,alertRange:p.alertRange});removeChild(w);
 }
}
'''
    s=s.replace('private function run():void {',extra+'private function run():void {')
    p.write_text(s,encoding='utf-8')
    commands=[['java','-Dflexlib='+str(profile.old.source.SDK/'frameworks'),'-jar',str(profile.old.source.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],
              [str(profile.old.source.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]]
    for label,cmd in zip(['compile','run'],commands):
        r=subprocess.run(cmd,cwd=WORK,capture_output=True,timeout=60)
        (WORK/(label+'.log')).write_bytes(r.stdout+r.stderr)
        assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')[-3000:]
    assert b'COMPLETE' in r.stdout+r.stderr and b'51,1,1,5' in r.stdout+r.stderr
    rows=json.loads((WORK/'rows.json').read_text(encoding='utf-8'))['profiles']
    assert len(rows)==180
    assert {(r['monsterId'],r['stage'],r['level'],r['fps']) for r in rows}=={(m,s,l,f) for m in profile.IDS for s,l in [(1,1),(1,2),(1,3),(2,1),(2,2)] for f in [20,24,30]}
    for row in rows:assert row['alertRange']==(600 if row['monsterId']==19 else 1000),row
    OUT.mkdir(parents=True,exist_ok=True)
    report=dict(status='passed',profiles=rows,methods=profile.old.records,commands=commands,runtime='AIR 51.1.1.5',
                swfSha256=sha(WORK/'Probe.swf'),generatedHashes={p.relative_to(WORK).as_posix():sha(p) for p in WORK.rglob('*.as')},
                inputs=[dict(path=p.relative_to(ROOT).as_posix(),sha256=sha(p)) for p in [ROOT/'tools/monster-knockback-profile-source/capture.py',ROOT/'tools/monster-knockback-source/capture.py',ROOT/'tools/monkey-horse-source/run.py',ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf',ROOT/'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf']],
                limits='Full BaseMonster and derived constructors/newColipse through unchanged 237 service stubs. Five formal stage/level inputs and three host rates; no EndlessModeCreate, full old scene, HP/UI/AI execution. Geometry output not republished.')
    (OUT/'profiles.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('239 constructor radii:',len(rows),'passed')


if __name__=='__main__':main()
