"""Join all 221 behavior contracts with 222A visuals and bounded 222B collision evidence."""
import copy
import json
from run import ROOT,OUT,sha,save

def load(path):
    return json.loads(path.read_text(encoding='utf-8'))

def build():
    behavior_path=ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json'
    visual_path=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/contract-visual-consumer-matrix.json'
    behavior=load(behavior_path);visual=load(visual_path)
    all_profiles=['PetTurtle1Bullet1','PetTurtle2Bullet1','PetTurtle1Bullet2','PetTurtle3Bullet3']
    direct={'normal.1':all_profiles[:1],**{f'normal.{i}':all_profiles[1:2] for i in [2,3,4]},
            'sld.effect':all_profiles[2:3],'sybh.effects':all_profiles[3:],
            'aoyi.chain':all_profiles[2:],'aoyi.damage-window':all_profiles[2:],
            'damage.dedup':all_profiles}
    lifecycle={'aoyi.cleanup','hurt.death','lifecycle.destroy','lifecycle.replace'}
    by_id={c['id']:c for c in behavior['contracts']}
    assert set(by_id)=={c['contractId'] for c in visual['contracts']} and len(by_id)==32
    rows=[]
    for old in visual['contracts']:
        row=copy.deepcopy(old);key=row['contractId'];contract=by_id[key]
        row['behavior']=copy.deepcopy(contract)
        row['behaviorResponsibility']='Retained in full from 221; collision N/A applies only to an independent attack mask, never to behavior triggers, target selection, numeric settlement or owner lifecycle.'
        row['consumerStatus']='pending-formal-implementation'
        if key in direct:
            row['collision']={'status':'verified-finite-fixtures','profiles':direct[key],
                'staticEvidence':'sampling-verification.json','dynamicEvidence':'dynamic-call-verification.json',
                'fixtureSelector':{'symbols':direct[key],'allDeclaredScales':True,'owners':['P1','P2']},
                'exception':'sampling-approval.json' if 'PetTurtle1Bullet2' in direct[key] else None}
            if key=='damage.dedup':row['collision']['registryEvidence']='registry-verification.json'
        elif key in lifecycle:
            row['collision']={'status':'not-applicable-after-cleanup',
                'reason':'Source cleanup removes/destroys bullets before subsequent step inputs; there is no independent attack mask for a destroyed actor. Behavior trace proves cleanup, 222A proves visual lifetime, and 222B compares all caller states unchanged.',
                'evidence':['dynamic-call-verification.json','dynamic-verification.json'],
                'behaviorFixtureSelector':contract['fixtureSelector']}
        else:
            row['collision']={'status':'not-applicable-independent-mask',
                'reason':'This contract governs a behavior decision, numeric settlement, owner relation or action release. It does not define a separate attack display shape; attack geometry is covered by normal/sld.effect/sybh.effects/aoyi collision rows.',
                'behaviorFixtureSelector':contract['fixtureSelector']}
        rows.append(row)
        if key=='lifecycle.replace':
            row['collision']['reason']+=' The 221 changePet destroy/init contract remains mandatory; replacement pet attacks consume the normal and skill collision rows.'
    return {'taskId':'TASK-SETTINGS-222B','status':'legacy-evidence-handoff',
        'behaviorSha256':sha(behavior_path),'visualMatrixSha256':sha(visual_path),
        'contracts':rows,'declaredContractIds':list(by_id),
        'boundary':'Legacy behavior, visual and finite collision evidence only; no modern implementation acceptance is implied.'}

if __name__=='__main__':
    result=build();save(OUT/'contract-family-consumer-matrix.json',result)
    print('Joined',len(result['contracts']),'contracts; modern consumers remain pending')
