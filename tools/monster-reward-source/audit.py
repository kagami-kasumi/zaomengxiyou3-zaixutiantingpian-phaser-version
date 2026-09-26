"""Static producer/lifecycle/inheritance cross-check for the bounded 231 probe."""
import hashlib
import json
from pathlib import Path
import re
from capture import ROOT, SRC, OUT, method

records = []
def read(path, name):
    file = SRC/path
    full = file.read_text(encoding='utf-8')
    code = method(full, name)
    records.append(dict(path=file.relative_to(ROOT).as_posix(), method=name,
                        line=full[:full.index(code)].count('\n')+1,
                        sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
    return code

attack = read('base/BaseMonster.as','beMagicAttack')
assert attack.index('this.curAttackTarget = param2;') < attack.index('this.reduceHp(_loc15_')
assert attack.index('this.curAttackTarget = param2;') > attack.index('this.addMissMc();')
assert 'this.sourceRole' in read('base/BaseBullet.as','checkAttack')
assert '_loc2_.beMagicAttack(this,this.sourceRole)' in read('base/BaseBullet.as','checkAttack')
step = read('base/BaseMonster.as','step')
assert step.index('super.step();') < step.index('this.IntelligenceTime();') < step.index('this.curAttackTarget = null;')
obj_step = read('base/BaseObject.as','step')
assert obj_step.index('this.bbdc.step();') < obj_step.index('this.curAddEffect.step();')
world = read('World/PhysicsWorld.as','step')
assert world.index('this.monsterArray.length') < world.index('this.heroArray.length')
assert 'this._petInfo' not in read('base/BasePet.as','destroy')
assert 'this.sourceRole = null;' in read('base/BasePet.as','destroy')
assert 'this._petInfo = param1;' in (SRC/'base/BasePet.as').read_text(encoding='utf-8')
assert 'this.getPlayer().findCurrentPet()' in read('base/BaseHero.as','initPet')
assert 'return this.petsAry[_loc2_];' in read('user/User.as','findCurrentPet')
assert 'PetInfo(this.petsAry[_loc3_]).getSaveString()' in read('user/User.as','getPetSaveString')
assert 'this.petUpdate();' in read('petInfo/PetInfo.as','setCurExper')
assert 'this.who.getPlayer().setCurExp(this.getExper())' in read('base/BaseRoleProperies.as','setExper')
# Scope is exactly the actual twelve monster classes already used by 237/236.
profiles = json.loads((ROOT/'src/assets/monster-knockback-profiles.json').read_text(encoding='utf-8'))['profiles']
ids = sorted({row['monsterId'] for row in profiles})
assert ids == [2,3,4,5,6,7,8,9,10,16,19,30], ids
inheritance=[]
for ident in ids:
    path=f'export/monster/Monster{ident}.as'
    full=(SRC/path).read_text(encoding='utf-8')
    assert not re.search(r'curAttackTarget\s*=(?!=)',full), path
    assert not re.search(r'function (?:selectTarget|beMagicAttack)\(',full), path
    ai=read(path,'myIntelligence')
    assert 'if(!this.isBeAttacking())' in ai and ai.count('super.myIntelligence();')==1
    override=bool(re.search(r'function reduceHp\(',full))
    if override:
        hp=read(path,'reduceHp')
        assert hp.count('super.reduceHp(param1,param2);')==1
        assert 'Exper' not in hp
    inheritance.append(dict(monsterId=ident,aiGate='not-isBeAttacking',reward='BaseMonster.reduceHp',reduceHpOverride=override,
                            damageModifier='none in reduceHp override'))
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'source-audit.json').write_text(json.dumps(dict(status='passed',sources=records,inheritance=inheritance),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('231 source producer/lifecycle and 12 monster inheritance checks passed')
