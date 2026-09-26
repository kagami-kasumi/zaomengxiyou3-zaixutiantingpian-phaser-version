"""Publish the bounded behavior sidecar; spatial truth stays in 217/218."""
import hashlib
import json
from pathlib import Path
import sys
import re
import jsonschema
from verify import ROOT, OUT, verify

DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-230-monster-knockback.json'
SCHEMA=ROOT/'docs/reverse-engineering/ground-truth/schema/monster-knockback.schema.json'


def main():
    DEST.parent.mkdir(parents=True,exist_ok=True)
    report=json.loads((OUT/'native.json').read_text(encoding="utf-8"))
    for ref in report['methods']:
        assert hashlib.sha256((ROOT/ref['path']).read_bytes()).hexdigest()==ref['fileSha256']
    for ref in report['sources']:
        assert hashlib.sha256((ROOT/ref['path']).read_bytes()).hexdigest()==ref['sha256']
    counts=verify(report)
    evidence=json.loads((OUT/'verification.json').read_text(encoding="utf-8"))
    assert len(evidence['sourceMutationsRejected'])==5
    spatial=[]
    for name in ['task-settings-217-pet-ground-environment.json','task-settings-218-dragon1-target-collision.json']:
        p=DEST.parent.parent/name
        truth=json.loads(p.read_text(encoding="utf-8"))
        assert truth['status']=='verified' and not truth['completeness']['unresolved']
        spatial.append(dict(path=p.relative_to(ROOT).as_posix(),truthId=truth['truthId'],sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    profiles=[]
    src=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    for monster_id in [2,3,4,5,6,7,8,9,10,16,19,30]:
        path=src/f'export/monster/Monster{monster_id}.as'
        code=path.read_text(encoding="utf-8")
        assert 'function setAttackBack(' not in code and 'function move(' not in code
        profiles.append(dict(id=monster_id,path=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                             collider=re.search(r'this.colipse = AUtils.getNewObj\("([^"]+)"\)',code)[1],
                             explicitlyFlying='this.isFly = true;' in code,
                             movementPredicateOverrides=re.findall(r'function (isAttacking|isCannotMoveWhenAttack)\(',code)))
    groups=[]
    # Duplicate boss/owner cases are verified equal, then losslessly represented
    # by explicit applicability metadata rather than four copies of each trace.
    for r in report['rows']:
        if r['type']!='motion' or r['boss'] or r['owner']!=1:continue
        if r['tick']==0:
            groups.append(dict(id=r['id'],shape=r['shape'],fps=r['fps'],mode=r['mode'],direction=r['dir'],
                               collider=r['state']['collider'],states=[]))
        state=r['state']
        groups[-1]['states'].append([state[k] for k in ['x','y','vx','vy','standing','head','wallLeft','wallRight']])
    stable=[r for r in report['rows'] if r['type']!='natural-tween']
    digest=hashlib.sha256(json.dumps(stable,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    assert evidence['inputSources']==report['sources'] and evidence['inputMethods']==report['methods']
    assert evidence['deterministicObservationSha256']==digest
    value=dict(schemaVersion=1,truthId='task-settings-230.monster-knockback',status='verified',
               scope='Bounded original shared pet-to-monster knockback; no full scene, hurt animation or modern acceptance claim',
               generatedBy='python tools/monster-knockback-source/generate.py',
               spatialTruth=spatial,sources=report['sources'],methods=report['methods'],
               counts=counts,deterministicObservationSha256=hashlib.sha256(json.dumps(stable,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
               applicability=dict(monsterIds=[2,3,4,5,6,7,8,9,10,16,19,30],owners=[1,2],boss=[False,True],
                                  coordinateSpace='gameSence local root; screen guard uses localToGlobal',
                                  velocityUnit='pixels per original host step; tween duration is seconds',
                                  stateColumns=['x','y','vx','vy','standing','head','wallLeft','wallRight']),
               monsterProfiles=profiles,motion=groups,entryAndScheduler=[r for r in stable if r['type'] in ['gate','dedup','schedule','null-config']],
               naturalTweenOutcome={label:next(r['state']['vx'] for r in reversed(report['rows']) if r['type']=='natural-tween' and r['mode']==mode) for label,mode in [('replace','replace'),('edgeReturn','edge-return'),('zero','zero')]},
               exclusions=['hero-only named bullet direction branches', 'moving/sloping walls and monsters outside the 12 current consumers',
                           'full body callback/HP/death/AI implementation and hurt recovery duration (232)',
                           'reward owner (231), modern consumer and browser acceptance (236)'],unresolved=[])
    jsonschema.Draft202012Validator(json.loads(SCHEMA.read_text(encoding="utf-8"))).validate(value)
    text=json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n'
    if '--check' in sys.argv:assert DEST.read_text(encoding='utf-8')==text
    else:DEST.write_text(text,encoding='utf-8')
    print('230 bounded truth:',len(groups),'trajectories;',len(text.encode()),'bytes')


if __name__=='__main__':main()
