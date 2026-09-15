"""Compile real mutated source slices and require semantic rejection, not hash rejection."""
import json
from run import run, OUT
from verify import verify

MUTATIONS=[
 ('range','export/pet/PetTurtle1.as','PetTurtle1','this.attackRange = 40','this.attackRange = 41'),
 ('owner','export/pet/PetTurtle2.as','enterFrameFunc','gc.isSingleGame() || gc.sid == this.sourceRole.sid','true'),
 ('timing','export/pet/PetTurtle3.as','enterFrameFunc','getCurFrameCount() == 10','getCurFrameCount() == 9'),
 ('mana','export/pet/PetTurtle4.as','releSkill1','findPetUsedMagic("sld")','findPetUsedMagic("xwaoyi")'),
 ('gate','export/pet/PetTurtle1.as','beforeSkill1Start','_loc1_ >= 50','_loc1_ > 50'),
 ('free-chain','export/pet/PetTurtle4.as','releSkill4','param1.releSkill1WithoutMana();','param1.releSkill1();'),
 ('delay','export/pet/PetTurtle4.as','releSkill4','delayedCall(2,','delayedCall(3,'),
 ('dead-callback','export/pet/PetTurtle4.as','releSkill4','!param1.isDead()','true'),
 ('counter','base/BasePet.as','reduceHp','gc.random() <= _loc4_','gc.random() > _loc4_'),
 ('hurt-suppression','export/pet/PetTurtle4.as','reduceHp','param2 = false','param2 = true'),
 ('magic-flower','export/pet/PetTurtle4.as','getRealPower','Number(this.hurtBaseEffectRate())','1'),
 ('cooldown','base/BasePet.as','myIntelligence','this.skillCD1[0] = this.skillCD1[1]','this.skillCD1[0] = 1'),
]
def main():
    results=[]
    for mid,path,name,old,new in MUTATIONS:
        matches=[]
        def mutate(p,n,s):
            if p==path and n==name:
                # RNG seam is substituted after source extraction.
                a=old.replace('gc.random()','Math.random()');b=new.replace('gc.random()','Math.random()')
                assert a in s;matches.append(True);return s.replace(a,b)
            return s
        data=run(mutate);assert matches
        try:verify(data)
        except AssertionError:results.append({'id':mid,'rejected':True});print(mid,'rejected',flush=True)
        else:raise AssertionError('Survived '+mid)
    (OUT/'mutations.json').write_text(json.dumps(results,indent=2)+'\n')
if __name__=='__main__':main()
