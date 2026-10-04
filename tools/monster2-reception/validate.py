"""258 independent direct/world verification and actual compiled mutations."""
import importlib.util
import json
import runpy
import sys
sys.dont_write_bytecode = True
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-258'

def module(name,file):
    spec=importlib.util.spec_from_file_location(name,HERE/file)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

fixtures=module('inputs258','fixtures.py')
oracle=module('oracle258','verify.py')
world=module('world258','verify_world.py')

def validate(data):
    inputs=fixtures.generate()
    assert len(data['rows'])==len(inputs)==8480
    for f,row in zip(inputs,data['rows']):
        want=oracle.expected(f)
        assert row==want,(f['id'],{k:(want[k],row.get(k)) for k in want if want[k]!=row.get(k)})
    world.verify(data['world'])

def edit(file,old,new):
    def apply(work):
        p=work/file;s=p.read_text(encoding='utf-8');assert old in s,(file,old)
        p.write_text(s.replace(old,new,1),encoding='utf-8')
    return apply

MUTATIONS={
 'power':edit('Monster2.as','"power":29','"power":28'),
 'critical':edit('BaseMonster.as','_loc4_ = 2;','_loc4_ = 1;'),
 'hit':edit('BaseMonster.as','this.protectedParamsObject.Hit + 6','this.protectedParamsObject.Hit + 0'),
 'hero-threshold':edit('BaseHero.as','Config.random() <= (this.roleProperies.getTotalMiss() - Number(BaseMonster(param2).Hit)) / 100','Config.random() < (this.roleProperies.getTotalMiss() - Number(BaseMonster(param2).Hit)) / 100'),
 'guard-register':edit('BaseHero.as','return false;','this.beAttackIdArray.push(param1.getAttackId());return false;'),
 'missing-pet':edit('BaseBullet.as','if(this.maxAttackCount > 0)','if(false)'),
 'keep-retired-pet':edit('BaseHero.as','this.getPet().destroy();','/* mutant: retain pet */'),
 'countdown':edit('BaseObject.as','--this.fatherCount;','this.fatherCount-=2;'),
 'same-object-id':edit('WorldProbe.as',"b.name=b.symbol+'-';", "b.name='Monster2Bullet1_1-';"),
 'source-dead-reject':edit('BaseBullet.as','if(!this.sourceRole)','if(!this.sourceRole || this.sourceRole.curAction=="dead")'),
 'ready-reject':edit('BaseHero.as','if(Boolean(gc.protectedPerproty.getProperty(this,"isYourFather"))','if(this.isReadyToDestroy || Boolean(gc.protectedPerproty.getProperty(this,"isYourFather"))'),
 'random-order':edit('BaseHero.as','_loc4_ = (Config.random() - 0.5) * 10;\n            _loc5_ = int(param2.getRealPower(param1.curAction).hurt);','_loc5_ = int(param2.getRealPower(param1.curAction).hurt);\n            _loc4_ = (Config.random() - 0.5) * 10;'),
}

def main():
    existing='--existing' in sys.argv
    api=None if existing else runpy.run_path(str(HERE/'capture.py'))
    def get(label,mutation=None):
        if existing or ('--resume' in sys.argv and (OUT/(label+'.json')).exists()):
            return json.loads((OUT/(label+'.json')).read_text(encoding='utf-8'))
        return api['run'](label,mutation)
    baseline=get('baseline');validate(baseline)
    repeat=get('repeat');validate(repeat)
    for key in ['rows','world','sources','fixtureSha256','generatedSources']:assert baseline[key]==repeat[key],key
    results=[]
    for name,mutate in MUTATIONS.items():
        data=get('mutation-'+name,mutate)
        changed=[k for k in baseline['generatedSources'] if baseline['generatedSources'][k]!=data['generatedSources'][k]]
        assert changed,name
        try:validate(data)
        except AssertionError as e:witness=str(e)[:2500]
        else:raise AssertionError('survived '+name)
        results.append(dict(name=name,changedSources=changed,witness=witness,status='compiled-ran-rejected'))
        (OUT/'mutations.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
        print('REJECTED',name,flush=True)
    print('PASS',len(results),flush=True)

if __name__=='__main__':main()
