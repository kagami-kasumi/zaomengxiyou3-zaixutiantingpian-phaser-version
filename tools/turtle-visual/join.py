"""Preserve every 221 behavior contract in the visual/collision/consumer handoff."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def main():
    manifest=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'
    verified=manifest.exists() and json.loads(manifest.read_text(encoding='utf-8'))['status']=='verified'
    behavior=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json').read_text(encoding='utf-8'))
    rows=[]
    for index,contract in enumerate(behavior['contracts']):
        key=contract['id'];group=key.split('.')[0]
        units={'entry':['body-all-cells'],'ai':['body-all-cells'],'normal':['body-all-cells','normal-native'],
               'sld':['body-all-cells','sld-native','linked-native'],
               'txlj':['dual-buff-native','linked-native'],
               'sybh':['body-all-cells','sybh-native','effects-native'],
               'aoyi':['aoyi-eight-masks-native','aoyi-lifecycle-native','effects-native'],
               'damage':['effects-native','collision-sprite-visuals'],
               'hurt':['body-all-cells','normal-native','death-native'],
               'lifecycle':['body-all-cells','destroy-native']}[group]
        derived_only=key in ['ai.priority','ai.range','ai.owner','ai.target','ai.follow','sld.gates','txlj.damage','aoyi.gate','aoyi.hurt','damage.power','damage.snapshot','damage.dedup','damage.defense','lifecycle.replace','hurt.counter']
        rows.append(dict(contractId=key,behaviorPointer=f'docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json#/contracts/{index}',
                         source=contract['source'],behaviorFixtureSelector=contract['fixtureSelector'],
                         visualUnits=units,visualRelation='Existing action/effect visual contract; this behavior decision has no separate turtle artwork.' if derived_only else 'Direct native action/effect/lifecycle observations.',
                         visualStatus='verified' if verified else 'measured-not-promoted',collision=dict(taskId='TASK-SETTINGS-222B',status='pending',inheritedRequirement=contract['geometry']),
                         futureConsumer=contract['modernConsumer'],consumerStatus='not-implemented-by-222A'))
    assert len(rows)==32 and len({r['contractId'] for r in rows})==32
    result=dict(taskId='TASK-SETTINGS-222A',status='visual-handoff' if verified else 'draft-handoff',contracts=rows,
                evidence={'body-all-cells':'body-native.json.gz','normal-native':'dynamic-native.json.gz','sld-native':'dynamic-native.json.gz','linked-native':'dynamic-native.json.gz','dual-buff-native':'buff-native.json.gz','sybh-native':'dynamic-native.json.gz','aoyi-eight-masks-native':'dynamic-native.json.gz','aoyi-lifecycle-native':'dynamic-native.json.gz','death-native':'dynamic-native.json.gz','destroy-native':'dynamic-native.json.gz','effects-native':'effects-native.json.gz','collision-sprite-visuals':'effects-native.json.gz'},
                modernVisualExceptions=[],futureComparison='Compare the complete recursive display list and original 940x590 state PNG for the same owner/form/action/host tick. Root-frame equality alone is insufficient. Source 1009 is documented, not a requirement to reproduce the crash.',
                unresolved=[] if verified else ['Schema manifest and final visual promotion remain pending; no collision claim.'])
    (OUT/'contract-visual-consumer-matrix.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A behavior/visual/collision/consumer join:',len(rows),'contracts')


if __name__=='__main__':main()
