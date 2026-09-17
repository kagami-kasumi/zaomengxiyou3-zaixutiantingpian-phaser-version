"""Independent full-family join gate; compares embedded evidence with authoritative inputs."""
import argparse
import copy
import json
import jsonschema
from run import ROOT,OUT,WORK,sha,save

def load(path):
    return json.loads(path.read_text(encoding='utf-8'))

def verify(document,visual,behavior,native):
    errors=[]
    def check(condition,name):
        if not condition:errors.append(name)
    check(document['visualTruth']['manifest']==visual,'visual-evidence')
    check(document['forms']==behavior['forms'],'forms')
    check(document['sharedRuntime']['behaviorContract']==behavior,'behavior')
    target_path=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json'
    check(document['sharedRuntime']['targetContract']==load(target_path),'target-contract')
    check(document['sharedRuntime']['targetContractSha256']==sha(target_path),'target-source-hash')
    check(document['sharedRuntime']['targetApplicability']==load(OUT/'coverage-verification.json'),'target-applicability')
    expected={c['id']:c for c in behavior['contracts']}
    rows=document['contractMatrix'];ids=[r['contractId'] for r in rows]
    profiles_by_contract={'normal.1':['PetTurtle1Bullet1'],
        **{f'normal.{i}':['PetTurtle2Bullet1'] for i in [2,3,4]},
        'sld.effect':['PetTurtle1Bullet2'],'sybh.effects':['PetTurtle3Bullet3'],
        'aoyi.chain':['PetTurtle1Bullet2','PetTurtle3Bullet3'],
        'aoyi.damage-window':['PetTurtle1Bullet2','PetTurtle3Bullet3'],
        'damage.dedup':['PetTurtle1Bullet1','PetTurtle2Bullet1','PetTurtle1Bullet2','PetTurtle3Bullet3']}
    check(len(ids)==32 and len(set(ids))==32 and set(ids)==set(expected),'contracts')
    for row in rows:
        check(row.get('behavior')==expected.get(row['contractId']),'contract-source:'+row['contractId'])
        check(row['consumerStatus']=='pending-formal-implementation','modern-status')
        original=next(r for r in load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/contract-visual-consumer-matrix.json')['contracts'] if r['contractId']==row['contractId'])
        check(row['futureConsumer']==original['futureConsumer'],'future-consumer')
        collision=row['collision']
        if row['contractId'] in profiles_by_contract:
            check(collision.get('status')=='verified-finite-fixtures','required-collision-status')
            check(collision.get('profiles')==profiles_by_contract[row['contractId']],'required-collision-profiles')
            check(collision.get('staticEvidence')=='sampling-verification.json' and collision.get('dynamicEvidence')=='dynamic-call-verification.json','required-collision-evidence')
            if row['contractId']=='damage.dedup':check(collision.get('registryEvidence')=='registry-verification.json','dedup-evidence')
        check(collision.get('status') in ['verified-finite-fixtures','not-applicable-after-cleanup','not-applicable-independent-mask'],'collision-status')
        if collision.get('status','').startswith('not-applicable'):
            check(bool(collision.get('reason')) and bool(row.get('behaviorResponsibility')),'not-applicable-reason')
    for key in ['declaredContractIds','manifestContractIds','p1rContractIds']:
        check(set(document['completeness'][key])==set(expected),'completeness:'+key)
    symbol_ids={'PetTurtle1Bullet1':473,'PetTurtle2Bullet1':511,'PetTurtle1Bullet2':504,'PetTurtle3Bullet3':534}
    check({p['symbol'] for p in document['collisionProfiles']}==set(symbol_ids),'collision-symbols')
    for p in document['collisionProfiles']:
        symbol=p['symbol'];check(p['characterId']==symbol_ids[symbol],'source-symbol')
        check(p['sourceOwner']=='pet1','effect-owner')
        check(p['scales']==([1,2] if symbol=='PetTurtle3Bullet3' else [1]),'effect-scale')
        check(p['fields']==[f for f in native['fields'] if f['id'].startswith(symbol+'-')],'collision-fields')
        check(p['trees']==[t for t in native['trees'] if t['symbol']==symbol],'collision-clock')
        check(p['oracleCorpus']==load(OUT/'native-corpus.json'),'archive-reference')
        check(p['staticVerification']==load(OUT/'sampling-verification.json'),'static-evidence')
        check(p['dynamicVerification']==load(OUT/'dynamic-call-verification.json'),'dynamic-evidence')
    for i,owner in enumerate(document['owners'],1):
        check(owner['form']==i and owner['bodySymbol']==f'PetTurtleBmd{i}' and owner['bodyOwner']=='pet1','body-owner')
        check(owner['colipseOwner']=='StageCommon' and owner['colipseSymbol']==['ObjectBaseSprite3','ObjectBaseSprite4','ObjectBaseSprite','ObjectBaseSprite'][i-1],'colipse-owner')
    return errors

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true');args=parser.parse_args()
    path=OUT/'family-draft.json' if args.draft else ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json'
    document=load(path)
    for name in ['coverage-verification','dynamic-verification','dynamic-call-verification','registry-verification','sampling-mutations','approval-mutations','inventory-verification']:
        assert load(OUT/(name+'.json'))['status']=='passed',name
    assert load(OUT/'sampling-verification.json')['status']=='passed-with-approved-residual'
    visual=load(ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json')
    behavior=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json')
    native=load(WORK.parent/'full/measurement.json')
    errors=verify(document,visual,behavior,native);assert not errors,errors
    schema=load(ROOT/'docs/reverse-engineering/ground-truth/schema/pet-family-ground-truth.schema.json')
    if args.draft:
        candidate=copy.copy(document);candidate['status']='verified';candidate['completeness']=dict(document['completeness'],unresolved=[])
    else:candidate=document
    jsonschema.validate(candidate,schema)
    mutations={}
    # Mutate in place and restore, avoiding a second copy of the 222A corpus.
    cases=[('owner',document['owners'][0],'bodyOwner','other'),
        ('scale',document['collisionProfiles'][-1],'scales',[1]),
        ('collision',document['collisionProfiles'][0],'fields',[]),
        ('timing',document['collisionProfiles'][0],'trees',[]),
        ('source',document['contractMatrix'][0],'behavior',{}),
        ('contract',document['completeness'],'declaredContractIds',[]),
        ('visual',document['visualTruth'],'manifest',{}),
        ('target',document['sharedRuntime'],'targetContract',{}),
        ('target-hash',document['sharedRuntime'],'targetContractSha256','invalid'),
        ('consumer',document['contractMatrix'][0],'futureConsumer','invalid'),
        ('collision-status',document['contractMatrix'][0]['collision'],'status','pending'),
        ('collision-downgrade',next(r for r in document['contractMatrix'] if r['contractId']=='sld.effect')['collision'],'status','not-applicable-independent-mask'),
        ('collision-evidence',next(r for r in document['contractMatrix'] if r['contractId']=='sld.effect')['collision'],'dynamicEvidence','missing.json')]
    for name,obj,key,value in cases:
        old=obj[key];obj[key]=value
        mutations[name]=bool(verify(document,visual,behavior,native));obj[key]=old
    assert all(mutations.values()),mutations
    save(OUT/'family-verification.json',dict(status='draft-structure-passed' if args.draft else 'passed',
        manifestSha256=sha(path),contracts=len(document['contractMatrix']),mutations=mutations,
        boundary='Full embedded visual/behavior and collision join; promotion additionally requires current native integrity, specific evidence gates, and successor task handoff.'))
    print('Full family join and schema:',len(document['contractMatrix']),'contracts;',len(mutations),'mutations rejected')

if __name__=='__main__':main()
