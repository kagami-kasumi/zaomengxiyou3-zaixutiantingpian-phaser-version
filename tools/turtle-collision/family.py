"""Assemble the full family document. Draft until the independent joint gate promotes it."""
import json
import argparse
import hashlib
import subprocess
import sys
from run import ROOT,OUT,WORK,sha
from contract_matrix import build,load

def assemble():
    a=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
    behavior=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json')
    visual_path=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'
    visual=load(visual_path);matrix=build();fixture=load(OUT/'fixtures.json')
    native=load(WORK.parent/'full/measurement.json')
    profiles=[]
    for effect in fixture['effects']:
        symbol=effect['symbol']
        profiles.append({**effect,'sourceOwner':'pet1','fixture':fixture,
            'fields':[f for f in native['fields'] if f['id'].startswith(symbol+'-')],
            'trees':[t for t in native['trees'] if t['symbol']==symbol],
            'oracleCorpus':load(OUT/'native-corpus.json'),
            'staticVerification':load(OUT/'sampling-verification.json'),
            'dynamicVerification':load(OUT/'dynamic-call-verification.json'),
            'approvedFiniteResidual':load(OUT/'sampling-approval.json') if symbol=='PetTurtle1Bullet2' else None,
            'scope':'Declared finite fixtures and original pixels; no general Flash rasterization equivalence claim.'})
    owners=[]
    for i,form in enumerate(behavior['forms'],1):
        owners.append({'form':i,'bodySymbol':f'PetTurtleBmd{i}','bodyOwner':'pet1',
            'colipseSymbol':['ObjectBaseSprite3','ObjectBaseSprite4','ObjectBaseSprite','ObjectBaseSprite'][i-1],
            'colipseOwner':'StageCommon','source':form['source']})
    ids=matrix['declaredContractIds']
    return {'schemaVersion':1,'truthId':'task-settings-222.pet-turtle-family','status':'draft',
        'taskId':'TASK-SETTINGS-222','sources':visual['provenance'],
        'visualTruth':{'manifest':visual,'sourceManifestSha256':sha(visual_path),
            'acceptance':load(a/'acceptance.json'),'ownerVerification':load(a/'owner-verification.json'),
            'modernVisualExceptions':[]},
        'owners':owners,'forms':behavior['forms'],
        'sharedRuntime':{'behaviorContract':behavior,'collisionRegistry':load(OUT/'registry-verification.json'),
            'targetContract':load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json'),
            'targetContractSha256':sha(ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json'),
            'targetApplicability':load(OUT/'coverage-verification.json'),
            'boundary':'221 source computational traces, 222A native visuals, and 222B bounded HitTest observations are separate evidence layers; modern runtime remains pending.'},
        'collisionProfiles':profiles,
        'playerLifecycle':{'owners':['P1','P2'],'visualEvidence':load(a/'contract-visual-consumer-matrix.json'),
            'postStep':load(OUT/'dynamic-verification.json'),'attackEntry':load(OUT/'dynamic-call-verification.json'),
            'nonAttackStates':'TTL expires before attack; disabled AoyiBuff has no secondary clip; destroyed/removed bullets have no subsequent step. Cleanup semantics remain sourced from behavior contracts.'},
        'modernConsumers':[{'name':name,'status':'pending','contractIds':[r['contractId'] for r in matrix['contracts'] if r['futureConsumer']==name]}
            for name in sorted({r['futureConsumer'] for r in matrix['contracts']})],
        'contractMatrix':matrix['contracts'],
        'p1rAcceptance':{'status':'pending-formal-runtime','contractIds':ids,
            'requiredSurfaces':['TestScene','five-formal-stages','P1','P2'],
            'requiredChecks':['outside-range-chase-before-attack','all-four-normal-attacks','all-learnable-skills','eight-aoyi-combinations','real-target-hp-and-dedup','shield-before-linked-damage','linked-healing','pet-hurt-counter','replace-rest-death-retry-return-reload-cleanup','native-940x590-state-differences']},
        'completeness':{'declaredContractIds':ids,'manifestContractIds':[r['contractId'] for r in matrix['contracts']],
            'p1rContractIds':ids,'unresolved':['Independent parent verification and successor task handoff pending.']}}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--promote',action='store_true');args=parser.parse_args()
    result=assemble();path=OUT/'family-draft.json'
    if args.promote:
        from verify_family import verify
        visual=result['visualTruth']['manifest'];behavior=result['sharedRuntime']['behaviorContract']
        native=load(WORK.parent/'full/measurement.json')
        assert not verify(result,visual,behavior,native)
        for name in ['coverage-verification','dynamic-verification','dynamic-call-verification','registry-verification','sampling-mutations','approval-mutations','inventory-verification']:
            assert load(OUT/(name+'.json'))['status']=='passed',name
        assert load(OUT/'sampling-verification.json')['status']=='passed-with-approved-residual'
        for task in ['223','224A','224B','224C']:
            assert (ROOT/f'docs/tasks/task-definitions/TASK-SLICE-{task}.md').exists()
        subprocess.run([sys.executable,str(ROOT/'tools/turtle-collision/pack.py'),'--check'],check=True)
        repeated=assemble();assert repeated==result,'Non-deterministic family assembly'
        result['status']='verified';result['completeness']['unresolved']=[]
        path=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json'
    encoded=(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n').encode('utf-8')
    path.write_bytes(encoded)
    if args.promote:
        subprocess.run([sys.executable,str(ROOT/'tools/turtle-collision/verify_family.py')],check=True)
        from run import save
        save(OUT/'family-acceptance.json',dict(status='accepted',manifestSha256=hashlib.sha256(encoded).hexdigest(),
            repeatedAssemblyEqual=True,scope='Full legacy turtle behavior/visual/collision finite evidence; modern family implementation pending.',
            successors=['TASK-SLICE-223','TASK-SLICE-224A','TASK-SLICE-224B','TASK-SLICE-224C']))
    print('Full family:',len(encoded),'bytes;',result['status'])
