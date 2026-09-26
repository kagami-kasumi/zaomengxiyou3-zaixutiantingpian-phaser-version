"""Original Monkey4 target-selection callback over original collider classes."""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK=BASE/'aoyi-target-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def bounds(source,cid):
    shape=source['shapes'].get(str(cid))
    if shape:
        b=shape['boundsTwips'];return [b['Xmin']/20,b['Xmax']/20]
    points=[]
    for p in source['timelines'][str(cid)][0]:
        m=p['matrix'];assert m['b']==m['c']==0
        points.extend(m['tx']+m['a']*x for x in bounds(source,p['characterId']))
    return [min(points),max(points)]


def main():
    global WORK
    mutation=sys.argv[1] if len(sys.argv)>1 else None
    variants={
        'inclusive':('_loc4_.x > 20 && _loc4_.x < 920','_loc4_.x >= 20 && _loc4_.x <= 920'),
        'alive':('_loc2_.push(_loc3_);','if(!_loc3_.dead) _loc2_.push(_loc3_);'),
        'side':('gc.random() < 0.5','gc.random() <= 0.5'),
        'index':('int(gc.random() * _loc2_.length)','Math.round(gc.random() * (_loc2_.length - 1))'),
        'clear-target':('this.x = this.sourceRole.x;','this.curAttackTarget = null; this.x = this.sourceRole.x;')}
    assert mutation is None or mutation in variants
    if mutation:WORK=BASE/('aoyi-target-mutation-'+mutation)
    WORK.mkdir(parents=True,exist_ok=True)
    for path in (BASE/'callback-air').glob('*.as'):
        if path.name=='CallbackProbe.as':continue
        shutil.copyfile(path,WORK/path.name)
    monkey=WORK/'Monkey4.as';original_monkey_sha=hashlib.sha256(monkey.read_bytes()).hexdigest()
    if mutation:
        before,after=variants[mutation];text=monkey.read_text();assert before in text
        monkey.write_text(text.replace(before,after))
    monster=WORK/'BaseMonster.as';text=monster.read_text();text=text.replace('public var colipse:Sprite','public var dead:Boolean=false;public function isDead():Boolean{return dead;}public var colipse:Sprite');monster.write_text(text)
    body=json.loads((OUT/'body-inputs.json').read_text())['forms'][3]
    geometry=json.loads((OUT/'geometry-inputs.json').read_text());source=next(s for s in geometry['sources'] if s['id']=='StageCommon')
    targets=[]
    for i,(symbol,left,scale) in enumerate([('ObjectBaseSprite',20,1),('ObjectBaseSprite',20.05,1),('ObjectBaseSprite2',919.95,1),('ObjectBaseSprite7',920,.5)]):
        local=bounds(source,source['roots'][symbol]);targets.append(dict(id='ABCD'[i],symbol=symbol,scaleX=scale,localBounds=local,x=left-local[0]*scale,y=330+i*20))
    fixture=dict(body=body,targets=targets,sourcePath=str(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'),
                 modes=['static','dead-first','enter','leave-enter','reorder','empty-reenter','scene-shift','scene-flip'],
                 choices=[0,1/3-1e-10,1/3,.5,2/3-1e-10,2/3,1-1e-10],sides=[.5-1e-10,.5])
    (WORK/'inputs.json').write_text(json.dumps(fixture,indent=2)+'\n')
    probe=ROOT/'tools/monkey-spatial/AoyiTargetProbe.as';shutil.copyfile(probe,WORK/probe.name)
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.aoyitarget</id><versionNumber>1.0.0</versionNumber><filename>AoyiTargetProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>AoyiTargetProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>'''.replace('regima.task228.aoyitarget','regima.task228.aoyitarget.'+(mutation or 'normal')))
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=AoyiTargetProbe.swf','AoyiTargetProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
    output=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace')
    assert result.returncode==0 and 'COMPLETE 672' in output,output[-2000:]
    cases=[json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
    report=dict(status='measured-not-promoted',mutation=mutation,cases=cases,fixtures=fixture,probeSha256=hashlib.sha256(probe.read_bytes()).hexdigest(),originalMonkeySha256=original_monkey_sha,compiledMonkeySha256=hashlib.sha256(monkey.read_bytes()).hexdigest(),
                callbackMethodsSha256=hashlib.sha256((OUT/'callback-methods.json').read_bytes()).hexdigest(),
                scope='Original body/action/target callback and native source colipse; original random calls supplied fixed boundary sequence. Bullet creation and settlement remain explicit callback sinks; dead marker is an observed field, no monster death caller is executed.')
    (WORK/'measurement.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('228 aoyi target cases:',len(cases))
    if mutation:
        from verify_aoyi_targets import check
        errors=check(report)
        (WORK/'rejection.json').write_text(json.dumps(dict(mutation=mutation,failures=len(errors),examples=errors[:8]),indent=2)+'\n')
        print('Mutation differences:',len(errors))
        if errors:raise SystemExit(1)


if __name__=='__main__':main()
