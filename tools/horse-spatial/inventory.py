"""Freeze direct creation sites independently of the modern implementation."""
import hashlib
import json
from prepare_lifecycle import ROOT,SRC,OUT,take
from run_lifecycle import specs

def main():
    rows=[]
    mappings={1:[('normal','PetHorse1Bullet1','special'),('sp','PetHorse1Bullet2','follow')],
      2:[('normal','PetHorse2Bullet1','special'),('bd','PetHorse2Bullet2','follow'),('sp','PetHorse1Bullet2','special')],
      3:[('normal','PetHorse3Bullet1','special'),('bd','PetHorse3Bullet2','follow'),('sp','PetHorse3Bullet3','special'),('bz','PetHorse3Bullet4','special')],
      4:[('normal','PetHorse3Bullet1','special'),('bd','PetHorse3Bullet2','follow'),('sp','PetHorse3Bullet3','special'),('bz','PetHorse3Bullet4','special'),('tmaoyi','PetHorse4Bullet5','enemy')]}
    classes=dict(special='SpecialEffectBullet',follow='FollowBaseObjectBullet',enemy='EnemyMoveBullet')
    def record(path,name,**fields):
        code=take(path,name);text=path.read_text(encoding='utf-8')
        return dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:text.index(code)].count('\n')+1,
            sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(code.encode()).hexdigest(),**fields)
    for form,mapping in mappings.items():
        path=SRC/f'export/pet/PetHorse{form}.as'
        for index,(skill,symbol,kind) in enumerate(mapping,1):
            code=take(path,'doHit'+str(index))
            assert f'new {classes[kind]}("{symbol}")' in code
            if skill=='bd':assert '.setHurtCanCutDownEffect(false)' in code
            rows.append(record(path,'doHit'+str(index),form=form,skill=skill,symbol=symbol,kind=kind,lifecycleSpec=symbol+'_'+kind))
    rows.append(record(SRC/'export/pet/PetHorse4.as','hit5Hit',form=4,skill='tmaoyi-explosion',symbol='PetHorse4Bullet5Explode',kind='special',lifecycleSpec='PetHorse4Bullet5Explode_special'))
    rows.append(record(SRC/'base/BasePet.as','addAoyiBuff',form=4,skill='tmaoyi-prelude',symbol='AoyiBuff',kind='follow',lifecycleSpec='AoyiBuff_follow'))
    support=[record(SRC/'export/pet/PetHorse4.as','releSkill4'),record(SRC/'base/BaseAddEffect.as','show_pethorse_ice'),record(SRC/'base/BaseAddEffect.as','hide_pethorse_ice')]
    assert {r['lifecycleSpec'] for r in rows}|{'PetHorse4Bullet5_tracking'}=={s['id'] for s in specs()}
    report=dict(status='frozen-source-inventory',creationSites=rows,attachments=support,
        expectedPrimarySymbols=sorted({r['symbol'] for r in rows if r['symbol']!='AoyiBuff'}),
        remaining=['Actual body-to-bullet callback integration','Ice attachment and target cleanup','Delayed explosion callback and owner cleanup','Independent geometry and reconstructed collision','Recursive UI Schema and complete 43-contract handoff'])
    assert len(report['expectedPrimarySymbols'])==10
    (OUT/'family-inventory.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('229 inventory:',len(rows),'creation sites;',len(report['expectedPrimarySymbols']),'primary symbols')

if __name__=='__main__':main()
