"""Recursive UI Schema projection of inherited hurt, miss and HP display evidence."""
import json
from pathlib import Path
import jsonschema
from PIL import Image
from ui_truth import ROOT,BASE,OUT,read,sha,rect


def generate():
    swf=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
    legacy=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as'
    hp_path=BASE/'inherited-display-air/measurement.json';hp=read(hp_path)
    hurt_path=BASE/'hurt-geometry-air/measurement.json';hurt=read(hurt_path)
    hurt_inputs=read(OUT/'hurt-geometry-inputs.json');source=hurt_inputs['source']
    selectors={s['id']:s for s in hurt_inputs['states']}
    assert read(OUT/'hurt-geometry-verification.json')['status']=='passed-bounded'
    assert read(OUT/'inherited-display-verification.json')['independentPixelStates']==210
    provenance=[dict(id=identity,sourceType=kind,sourcePath=path.relative_to(ROOT).as_posix(),sha256=sha(path),locator=locator) for identity,kind,path,locator in [
        ('swf','restored-swf',swf,'SymbolClass HeroBeHurt=18, miss=8'),('as3','legacy-as3',legacy,'addBeAttackEffect/addMissMc/newHpSlip/drawPetHp/showHpSlip'),
        ('hurt-native','runtime-capture',hurt_path,'/states; independent rebuilt tree with strict original RGBA/bounds match'),('hud-native','runtime-capture',hp_path,'/rows')]]
    objects=[];states=[];baselines=[];counts={}
    def walk(node,state_id,kind,path='root',parent=None,index=0,cid=None,phase=None):
        assert not node.get('pendingConstruction')
        identity=state_id+'/'+path
        original_type=node['type'].split('::')[-1]
        object_type='shape' if original_type=='Shape' else 'bitmap' if original_type=='Bitmap' else 'movie-clip' if cid==18 else 'sprite'
        frame=(phase or {}).get('frame') or 1
        ref=(OUT/'hurt-geometry-inputs.json').relative_to(ROOT).as_posix() if kind=='hurt' else hp_path.relative_to(ROOT).as_posix()
        objects.append(dict(id=identity,parentId=parent,depth=index,objectType=object_type,
                            sourceIdentity=dict(provenanceId='swf' if kind=='hurt' else 'as3',characterId=cid,symbolClass='HeroBeHurt' if cid==18 else None,instanceName=node['name'],frame=frame if kind=='hurt' else None),
                            placements=[dict(stateId=state_id,visible=node['visible'],localMatrix=node['matrix'],registrationPoint=dict(x=0,y=0),localBounds=rect(node['localBounds']),stageBounds=rect(node['rootBounds']),
                                             alpha=node['alpha'],colorTransform=node['colorTransform'],derivation='calculated' if kind=='hurt' else 'observed',
                                             derivationMethod='Hurt root in isolated resource space; source child geometry and hue reconstruction. HP/miss in source world space, cropped only for baseline image.',evidenceRefs=[ref,kind+'-native-tree:'+node['path']])],
                            render=dict(assetRef=ref,blendMode=node['blendMode'],filters=node['filters'],maskId=None)))
        count=int(node['visible']);placements=source['timelines'].get(str(cid),[])
        placements=placements[frame-1] if placements else []
        if kind=='hurt':assert len(placements)==len(node['children'])
        for i,child in enumerate(node['children']):
            selected=(phase or {}).get('children',[])
            count+=walk(child,state_id,kind,path+'/'+str(i),identity,placements[i]['depth'] if kind=='hurt' else i,
                        placements[i]['characterId'] if kind=='hurt' else None,selected[i] if i<len(selected) else None)
        return count
    for row in hurt['states']:
        identity='hurt-'+row['id'];selector=selectors[row['id']];reference=hurt['reference'][row['id']];path=Path(reference['path'])
        assert sha(path)==reference['sha256']
        counts[identity]=walk(row['tree'],identity,'hurt',cid=18,phase=selector['phase'])
        baseline='baseline-'+identity;width,height=Image.open(path).size
        states.append(dict(id=identity,entry='Isolated natural HeroBeHurt source phase; mounting lifetime in hurt-natural measurement',fixtureId=row['id'],baselineId=baseline,frame=selector['phase']['frame']))
        baselines.append(dict(id=baseline,stateId=identity,path=path.relative_to(ROOT).as_posix(),sha256=sha(path),width=width,height=height,crop=dict(left=selector['left'],top=selector['top'],width=width,height=height)))
    cases={c['id']:c for c in hp['fixtures']['cases']}
    for row in hp['rows']:
        identity='inherited-'+row['id'];path=hp_path.parent/row['path'];case=cases[row['inputId']]
        assert sha(path)==row['sha256'];counts[identity]=walk(row['tree'],identity,'hud')
        baseline='baseline-'+identity;width,height=Image.open(path).size
        states.append(dict(id=identity,entry='Original vector/miss creation and source easeOut under explicit manual tween clock',fixtureId=row['inputId'],baselineId=baseline))
        baselines.append(dict(id=baseline,stateId=identity,path=path.relative_to(ROOT).as_posix(),sha256=sha(path),width=width,height=height,crop=dict(left=case['x']-80,top=case['y']-180,width=width,height=height)))
    ids=[s['id'] for s in states]
    result=dict(schemaVersion=1,truthId='task-settings-228.monkey-inherited-display',status='verified',
                scope=dict(taskId='TASK-SETTINGS-228',surfaceId='monkey-inherited-display',originalVersion='RegiMA restored StageCommon + legacy BasePet',description='Inherited HeroBeHurt source frame resources and source HP/miss display states; no complete game/tween scheduler claim.'),
                generatedBy=dict(tool='tools/monkey-spatial/additional_ui.py',toolVersion='1',command='python tools/monkey-spatial/additional_ui.py',generatedAt='2026-09-21T00:00:00Z'),
                provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage'),states=states,displayObjects=objects,baselines=baselines,
                completeness=dict(expectedStateIds=ids,extractedStateIds=ids,expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=[]),
                evidenceRefs=[(OUT/n).relative_to(ROOT).as_posix() for n in ['hurt-natural-verification.json','hurt-geometry-verification.json','inherited-display-verification.json']])
    jsonschema.validate(result,read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json'))
    return result


if __name__=='__main__':
    data=generate();(OUT/'inherited-display-ui.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('228 inherited UI Schema:',len(data['states']),'states;',len(data['displayObjects']),'objects')
