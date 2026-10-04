"""Verify all source evidence and emit the bounded behavior sidecar deterministically."""
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.dont_write_bytecode = True
import ordering
import verify_controlled
import verify_shared

ROOT=ordering.ROOT
OUT=ordering.base.OUT
DEST=ROOT/'docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json'
MUTATIONS=('move-sign','screen-clamp','wall-snap','pause-tween','exit-tween','hero-kills','source-kills','duration','world-before-tween')


def read(name):
    return json.loads((OUT/name).read_text(encoding='utf-8'))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def record_method(relative,name,records):
    path=ordering.base.SRC/relative
    text=path.read_text(encoding='utf-8')
    match=re.search(r'(?:override )?(?:public|private|protected)(?: static)? function '+name+r'\(',text)
    assert match,(relative,name)
    opening=text.index('{',match.end());end=opening+1;depth=1
    while depth:
        depth+=(text[end]=='{')-(text[end]=='}');end+=1
    records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,line=text[:match.start()].count('\n')+1,
                        fileSha256=digest(path),methodSha256=hashlib.sha256(text[match.start():end].encode()).hexdigest()))


def build():
    controlled=read('controlled.json');shared=read('shared.json');repeat=read('shared-repeat.json')
    assert not verify_controlled.verify(controlled['rows'])
    plain=[r for r in shared['rows'] if not r['native']]
    assert not verify_shared.controlled(plain)
    assert plain==[r for r in repeat['rows'] if not r['native']]
    native_counts=[]
    for report in (shared,repeat):
        native_counts.append(verify_shared.natural([r for r in report['rows'] if r['native']]))
    evidence=[]
    for suffix,report in [('',shared),('-repeat',repeat)]+[('-'+n,read('shared-'+n+'.json')) for n in MUTATIONS]:
        folder='shared'+(suffix if suffix!='-repeat' else '')
        work=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-257B'/folder
        log=work/('run'+suffix+'.log')
        content=log.read_text(encoding='utf-8')
        assert 'COMPLETE' in content and '51,1,1,5' in content
        assert [json.loads(s[4:]) for s in content.splitlines() if s.startswith('ROW ')]==report['rows']
        for file,sha in report['generatedHashes'].items():assert digest(work/file)==sha,(folder,file)
        evidence.append(dict(report='docs/tasks/evidence/TASK-SETTINGS-257B/shared'+suffix+'.json',
                             reportSha256=digest(OUT/('shared'+suffix+'.json')),log=log.relative_to(ROOT).as_posix(),
                             logSha256=digest(log),compiledSwfSha256=digest(work/'Probe.swf'),librarySha256=digest(work/'main-library.swf')))
    mutations=[]
    for name in MUTATIONS:
        report=read('shared-'+name+'.json')
        assert report['mutation']==name and len(report['rows'])==len(plain)
        try:
            differences=verify_shared.controlled(report['rows'])
        except AssertionError:
            mutations.append(dict(id=name,rejected=True,reason='clock-or-lifecycle-invariant'))
        else:
            assert differences, ('Mutant accepted',name)
            mutations.append(dict(id=name,rejected=True,coordinateDifferences=len(differences),first=differences[0]))
    # A data-negative control is distinct from the compiled source mutations above.
    damaged=json.loads(json.dumps(plain));damaged[0]['positions'][0]['x']+=1
    assert verify_shared.controlled(damaged)
    records=controlled['sources']+shared['sources']
    for path,names in {
        'GMain.as':['showStageMap','startGame'],
        'my/MainGame.as':['nextDoAfterLoad'],
        'com/greensock/TweenLite.as':['initClass','updateAll','easeOut','renderTime'],
        'com/greensock/TweenMax.as':['to','pauseAll','resumeAll','killAll'],
    }.items():
        for name in names:record_method(path,name,records)
    unique={json.dumps(r,sort_keys=True):r for r in records}
    records=sorted(unique.values(),key=lambda r:(r['path'],r.get('method','')))
    for source in records:
        assert digest(ROOT/source['path'])==source['fileSha256'],source['path']
    body_path=ROOT/'docs/reverse-engineering/reference/monster2-body-attack-contract.json'
    body=json.loads(body_path.read_text(encoding='utf-8'))
    space_path=ROOT/'docs/reverse-engineering/reference/monster2-attack-space-contract.json'
    space=json.loads(space_path.read_text(encoding='utf-8'))
    assert space['status']=='verified'
    assert space['targets'][0]['tree']['stageBounds']==dict(x=-30,y=-50,width=60,height=100), 'Wall oracle profile changed'
    consumers=body['modernConsumers']
    for consumer in consumers:assert digest(ROOT/consumer['path'])==consumer['sha256']
    groups=defaultdict(list)
    for row in plain:
        for p in row['positions']:
            groups[row['fps'],row['owner'],row['mode'],p['slot']].append(
                [row['tick'],p['x'],p['y'],p['vx'],p['vy'],p['dead'],p['ready'],p['parent'],row['paused'],row['sourceReady']])
    trajectories=[dict(fps=f,owners=o,mode=m,slot=s,states=states) for (f,o,m,s),states in sorted(groups.items())]
    natural=[]
    for label,report in [('normal',shared),('repeat',repeat)]:
        groups=defaultdict(list)
        for row in report['rows']:
            if row['native']:groups[row['fps'],row['owner']].append(row)
        for (fps,owner),rows in sorted(groups.items()):
            exits=[r for r in rows if r['phase']=='exit']
            intervals=[round(b['time']-a['time'],9) for a,b in zip(exits,exits[1:])]
            natural.append(dict(run=label,fps=fps,owners=owner,states=len(rows),hostTicks=len(exits),
                                rootIntervalMin=min(intervals),rootIntervalMax=max(intervals),
                                bothEndpointsVerified=True,activeOverwriteVerified=True,
                                resumedOrderVerified=True,detachedTargetContinues=True,exitKillsVerified=True))
    result=dict(schemaVersion=1,contractId='task-settings-257b.monster2-gather-coordinate',status='verified-bounded-coordinate',
                runtime='original-package AIR 51.1.1.5; AIR SDK 51.3.4 compiler/ADL',
                scope=dict(stage='Stage1-2 Monster2.doHi2',rates=[20,24,30],owners=['P1','P2','both'],
                           controlledModes=list(verify_shared.MODES),libraryModes=['plain','move-before','move-after','pause','overwrite','source-detach','hero-detach','kill'],
                           exclusions=['Complete keyboard/role action system, pets/equipment/weapon updates, network, moving/sloped walls, sea/buffs/enforceSpeed and moving camera.',
                                       'HP is explicit property input, not real hit reception; no modern gameplay or visual acceptance.']),
                rules=dict(durationSeconds=1,ease='1-(1-t)^2, t=clamp(elapsedSeconds,0,1)',
                           timeSource='Original TweenLite.updateAll getTimer()*0.001; root timeline seconds, not a fixed host-frame counter.',
                           coordinateWrite='DisplayObject x/y truncate toward zero to 1/20 pixel; keep IEEE operation order before conversion.',
                           initialization='Lazy: first render captures current target position, including movement since the request.',
                           originalOrder=['prior map Tween initialization','Tween Shape ENTER_FRAME','MainGame root: PhysicsWorld.step','monster callbacks','hero BaseObject movement/walls','BaseHero screen correction'],
                           pause='stopGame removes world listener and pauseAll(true,true); resume adds listener then resumeAll; elapsed pause shifts cachedStartTime.',
                           overwrite='TweenMax AUTO mode 2; same target x/y properties replaced on initialization of new request; new request lasts a full second.',
                           targetSelection='Original Config.getPlayerArray excludes dead heroes; ready alone is not excluded (256).',
                           death='Changing actual isDead property input after request does not kill existing tween.',
                           heroDestroy='Original destroy removes hero from display/world, but tween keeps writing held target until completion.',
                           sourceDestroy='Original Monster2/BaseMonster.destroy does not kill target tweens; world removes ready source; source fade is independent.',
                           sceneExit='Original MainGame.destroyGame and PhysicsWorld.destroy clear world, heroes, and finally killAll(false); endpoints are not forced.'),
                references=dict(body=dict(path=body_path.relative_to(ROOT).as_posix(),sha256=digest(body_path),contractId=body['contractId']),
                                space=dict(path=space_path.relative_to(ROOT).as_posix(),sha256=digest(space_path),truthId=space['truthId'],manifest=space['manifest'],pointers=['/profiles/0','/targets/0','/phaseBindings']),
                                inheritedContracts=list(body['contracts'])),
                sources=records,modernConsumers=consumers,evidence=evidence,
                tools=[dict(path=p.relative_to(ROOT).as_posix(),sha256=digest(p)) for p in sorted(Path(__file__).parent.iterdir()) if p.suffix in ('.py','.as')],
                stateColumns=['tick','x','y','vx','vy','dead','ready','parent','paused','sourceReady'],trajectories=trajectories,
                acceptance=dict(libraryStates=len(controlled['rows']),sharedControlledStates=len(plain),
                                sharedHeroStates=sum(len(r['positions']) for r in plain),controlledRepeatEqual=True,
                                nativeRuns=natural,nativeInitialMovementSamples=native_counts,mutations=mutations,dataNegativeRejected=True),
                parentClosure=dict(task='TASK-SETTINGS-257',space='257A verified; exact 234 collision pixel approval unchanged',
                                   coordinates='257B bounded original library/shared chain verified',
                                   preserved=['M2-01..09','raw MovieClip continues during pause and removes itself at EXIT','hit2 has no damage producer'],
                                   nextTask='TASK-SETTINGS-258'),
                unresolvedInScope=[],remainingInputs=['Real BaseBullet damage -> BaseHero/BasePet reception and HP/protection/hurt/dead (TASK-SETTINGS-258).'])
    (OUT/'acceptance.json').write_text(json.dumps(result['acceptance'],indent=2)+'\n',encoding='utf-8')
    return result


def main():
    result=build()
    text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if '--check' in sys.argv:
        assert DEST.read_text(encoding='utf-8')==text,'Sidecar differs from verified evidence'
    else:DEST.write_text(text,encoding='utf-8')
    print(json.dumps(dict(status=result['status'],trajectories=len(result['trajectories']),mutations=len(MUTATIONS))))


if __name__=='__main__':main()
