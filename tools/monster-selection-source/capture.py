"""239 original methods through the existing 231 explicit service stubs."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
from fixtures import cases, verify

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-239'
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-239/selection'
spec=importlib.util.spec_from_file_location('reward231',ROOT/'tools/monster-reward-source/capture.py')
source=importlib.util.module_from_spec(spec);spec.loader.exec_module(source)
MUTATIONS=['numeric','one-dimensional','prefilter','reverse-tie','reverse-candidates','always-reselect','strict-range','dead-candidates','no-cleanup']


def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()


def prepare(mutation=None):
    work=BASE/(mutation or 'baseline');source.WORK=work;source.OUT=OUT
    records=source.prepare(None)
    def change(file, old, new):
        p=work/file;s=p.read_text(encoding='utf-8');assert old in s,(file,old);p.write_text(s.replace(old,new),encoding='utf-8')
    if mutation=='numeric':change('AUtils.as','sort(Array.RETURNINDEXEDARRAY)','sort(Array.RETURNINDEXEDARRAY | Array.NUMERIC)')
    if mutation=='one-dimensional':change('AUtils.as','AUtils.GetDisBetweenTwoObj(_loc4_,param2)','Math.abs(_loc4_.x - param2.x)')
    if mutation=='prefilter':
        change('BaseMonster.as','gc.getPlayerArray());','gc.getPlayerArray().filter(function(o:BaseObject,...rest):Boolean{return AUtils.GetDisBetweenTwoObj(o,self) <= self.alertRange;}));')
        change('BaseMonster.as','protected function selectTarget() : void\n      {','protected function selectTarget() : void\n      { var self:BaseMonster=this;')
    if mutation=='reverse-tie':change('AUtils.as','var _loc5_:Array = new Array();','if(param3.length==2 && AUtils.GetDisBetweenTwoObj(param3[0],param2)==AUtils.GetDisBetweenTwoObj(param3[1],param2))return param3[1]; var _loc5_:Array = new Array();')
    if mutation=='reverse-candidates':change('Config.as','return _loc1_;','return _loc1_.reverse();')
    if mutation=='always-reselect':change('BaseMonster.as','this.hasAttackTarget();','this.selectTarget();')
    if mutation=='strict-range':change('BaseMonster.as','<= this.alertRange','< this.alertRange')
    if mutation=='dead-candidates':
        change('Config.as',' && !this.hero1.isDead()','')
        change('Config.as',' && !this.hero2.isDead()','')
    if mutation=='no-cleanup':change('BaseMonster.as','Boolean(this.curAttackTarget.isReadyToDestroy)','false')
    probe=(HERE/'Probe.as').read_text(encoding='utf-8-sig').replace('FIXTURES',json.dumps(cases(),separators=(',',':')))
    (work/'Probe.as').write_text(probe,encoding='utf-8')
    return work, records


def capture(mutation=None):
    work, records = prepare(mutation)
    cmds=[['java','-Dflexlib='+str(source.SDK/'frameworks'),'-jar',str(source.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],
          [str(source.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)]]
    for label,cmd in zip(['compile','run'],cmds):
        r=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60)
        (work/(label+'.log')).write_bytes(r.stdout+r.stderr)
        assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')[-3000:]
    assert b'COMPLETE' in r.stdout+r.stderr and b'51,1,1,5' in r.stdout+r.stderr
    report=dict(mutation=mutation,sources=records,commands=cmds,runtime='AIR 51.1.1.5',
                rows=json.loads((work/'rows.json').read_text(encoding='utf-8')),
                generatedHashes={p.name:sha(p) for p in work.glob('*.as')},swfSha256=sha(work/'Probe.swf'),
                limitations='Original AUtils, Config, BaseMonster select/AI/cleanup and Monster30 AI gate. 231 stubs omit actual movement/attacks/graphics/leveling. Input states/roots injected; not whole-game playback.')
    OUT.mkdir(parents=True,exist_ok=True)
    path=OUT/((mutation or 'selection')+'.json');path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return report


def main():
    if len(sys.argv)>1 and sys.argv[1]=='--mutations':
        baseline=json.loads((OUT/'selection.json').read_text(encoding='utf-8'));verify(baseline)
        results=[]
        for name in MUTATIONS:
            mutated=capture(name)
            try:verify(mutated)
            except AssertionError as e:
                changed=sum(a!=b for a,b in zip(mutated['rows'],baseline['rows']))
                assert changed>0
                results.append(dict(name=name,changed=changed,rejected=str(e),sha256=sha(OUT/(name+'.json'))))
                print(name,changed,flush=True)
            else:raise AssertionError('Mutation survived: '+name)
        (OUT/'selection-verification.json').write_text(json.dumps(dict(status='passed',cases=verify(baseline),mutations=results,baselineSha256=sha(OUT/'selection.json')),indent=2)+'\n',encoding='utf-8')
    else:
        report=capture();print('239 selection cases:',verify(report))


if __name__=='__main__':main()
