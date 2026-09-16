"""Normalize source/native visual observations into the existing UI truth Schema.

Draft only: promotion requires independent completeness acceptance, never this serializer.
"""
import gzip
from datetime import datetime, timezone
import hashlib
import json
import sys
from pathlib import Path

import jsonschema

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
TARGET=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'
IDENTITY=dict(a=1,b=0,c=0,d=1,tx=0,ty=0)


def load(name):
    path=OUT/name;raw=path.read_bytes()
    return json.loads(gzip.decompress(raw) if name.endswith('.gz') else raw)


def bounds(value,matrix=None):
    x,y=value['x'],value['y'];w,h=value['width'],value['height']
    if matrix is None:return dict(left=x,top=y,width=w,height=h)
    points=[(matrix['a']*px+matrix['c']*py+matrix['tx'],matrix['b']*px+matrix['d']*py+matrix['ty']) for px in (x,x+w) for py in (y,y+h)]
    xs,ys=zip(*points);return dict(left=min(xs),top=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))


def main():
    verified='--verified' in sys.argv
    acceptance=load('acceptance.json') if verified else None
    if verified:
        assert acceptance['status']=='accepted'
        for path,digest in acceptance['inputSha256'].items():assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==digest,path
    sources=load('source-definitions.json')['sources'];bodies=load('body-inputs.json')
    symbols={name:(s,cid) for s in sources for name,cid in s['symbols'].items()}
    expected=load('expected-visual-states.json')
    generated_at=json.loads(TARGET.read_text(encoding='utf-8'))['generatedBy']['generatedAt'] if TARGET.exists() else datetime.now(timezone.utc).isoformat()
    states=[];objects={};baselines=[];counts={};provenance=[]
    for source in sources:
        source['provenanceId']=Path(source['path']).stem
        provenance.append(dict(id=source['provenanceId'],sourceType='restored-swf',sourcePath=source['path'],sha256=source['sha256'],locator='SymbolClass and byte-preserved target definition closures; source-definitions.json'))
    for corpus in ('body','effects','dynamic','buff'):
        path=OUT/(corpus+'-native.json.gz')
        provenance.append(dict(id=corpus,sourceType='runtime-capture',sourcePath=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),locator='Native AIR target-scope observation corpus; see source-method/probe/runtime hashes.'))
    methods=load('dynamic-source-methods.json')['sourceMethods']
    methods+= [dict(path=m['sourcePath'],method=m['method'],startLine=m['startLine'],sha256=m['sha256']) for m in load('owner-verification.json')['sourceMethods']]
    bbdc=load('body-methods.json')
    methods+=[dict(m,path=bbdc['sourcePath'],sha256=bbdc['sourceSha256']) for m in bbdc['methods']]
    for form in bodies['forms']:
        methods+=[dict(m,path=form['sourcePath'],sha256=form['sourceSha256']) for m in form['sourceMethods']]
    method_refs={}
    for m in methods:
        key=(m['path'],m['method']);pid='as3-'+hashlib.sha256('|'.join(key).encode()).hexdigest()[:16]
        if key in method_refs:continue
        method_refs[key]=pid;provenance.append(dict(id=pid,sourceType='legacy-as3',sourcePath=m['path'],sha256=m['sha256'],locator=m['method']+'; line '+str(m.get('startLine','whole class'))+'; source slice hashes in source-method evidence.'))

    def state(identity,entry,fixture,tick,path,digest):
        baseline='b-'+identity
        states.append(dict(id=identity,entry=entry,fixtureId=fixture,frame=tick,baselineId=baseline))
        baselines.append(dict(id=baseline,stateId=identity,path=path,sha256=digest,width=940,height=590,crop=dict(left=0,top=0,width=940,height=590)))

    def source_count(node,source,cid):
        timeline=source['timelines'].get(str(cid))
        if timeline is None:
            assert not node['children'];return 1
        placements=timeline[node['frame']-1];assert len(placements)==len(node['children'])
        return 1+sum(source_count(child,source,p['characterId']) for child,p in zip(node['children'],placements))

    def tree(node,identity,group,corpus,pointer,outer,source=None,cid=None,parent=None,depth=0,path='root',is_mask=False,mask_id=None,form=None,cell=None):
        if source is None and node['type'] in symbols:source,cid=symbols[node['type']]
        bitmap=node['type']=='flash.display::Bitmap' and form is not None
        if bitmap:source,cid=symbols['PetTurtleBmd'+str(form)]
        asset=source['path']+'#character='+str(cid) if source else None
        if bitmap:asset+=';row='+str(cell[0])+';column='+str(cell[1])+';direct='+str(cell[2])+';body-native-pool-crop'
        symbol=next((name for name,value in source['symbols'].items() if value==cid),None) if source else None
        render=dict(assetRef=asset,blendMode=node.get('blendMode','normal'),filters=node.get('filters',[]),maskId=mask_id)
        meta=[group,path,parent,source['provenanceId'] if source else corpus,cid,node.get('frame'),asset,render['blendMode'],render['filters'],is_mask]
        oid='o-'+hashlib.sha256(json.dumps(meta,sort_keys=True).encode()).hexdigest()[:24]
        kind='mask' if is_mask else 'bitmap' if bitmap else 'movie-clip' if 'frame' in node else 'shape' if node['type'].endswith('::Shape') else 'container'
        obj=dict(id=oid,parentId=parent,depth=depth,objectType=kind,
                 sourceIdentity=dict(provenanceId=source['provenanceId'] if source else corpus,characterId=cid,symbolClass=symbol,instanceName=None if node.get('name','').startswith('instance') else node.get('name'),frame=node.get('frame')),
                 placements=[],render=render)
        if oid in objects:
            prior=objects[oid];assert all(prior[k]==obj[k] for k in ('parentId','depth','objectType','sourceIdentity','render'))
        else:objects[oid]=obj
        matrix=node['matrix'] if parent else outer
        objects[oid]['placements'].append(dict(stateId=identity,visible=node['visible'],localMatrix=matrix,registrationPoint=dict(x=0,y=0),localBounds=bounds(node['localBounds']),stageBounds=bounds(node['rootBounds'],outer),alpha=node['alpha'],colorTransform=node.get('colorTransform'),derivation='calculated',derivationMethod='Original native local matrix/bounds; rootBounds transformed by the explicit fixture root. Bounds are geometric; masks/filters and final pixel bounds remain separate.',evidenceRefs=[corpus+'#'+pointer]))
        objects[oid]['placements'][-1]['parentBounds']=bounds(node['localBounds'],matrix)
        objects[oid]['placements'][-1]['derivationMethod']='Flash local origin; affine local AABB to parent, native rootBounds to stage.'
        if parent is None and form:
            form_path=bodies['forms'][form-1]['sourcePath']
            objects[oid]['placements'][-1]['evidenceRefs'] += [method_refs[(form_path,name)] for name in ('initBBDC','setAction','enterFrameFunc','scriptFrameOverFunc')]
        children=node.get('children',[])
        placements=source['timelines'][str(cid)][node['frame']-1] if source and str(cid) in source['timelines'] else None
        # Traverse source mask objects first, then bind masked siblings by original depth range.
        child_ids={};order=list(range(len(children)))
        if placements:
            assert len(children)==len(placements)
            order.sort(key=lambda i:not bool(placements[i].get('clipDepth')))
        for index in order:
            child=children[index];p=placements[index] if placements else None
            masked_by=None
            if placements:
                masks=[j for j,q in enumerate(placements) if q.get('clipDepth',-1)>=p['depth']>q['depth']]
                if masks:masked_by=child_ids[masks[-1]]
            child_pointer=pointer if corpus=='body' else pointer+'/children/'+str(index)
            child_ids[index]=tree(child,identity,group,corpus,child_pointer,outer,source if p else None,p['characterId'] if p else None,oid,p['depth'] if p else index,path+'/'+str(index),bool(p and p.get('clipDepth')),masked_by,form,cell)
        return oid

    body=load('body-native.json.gz')
    for index,entry in enumerate(body['cells']):
        identity='body:'+entry['id'];state(identity,'Original BBDC bitmap-pool cell',entry['id'],entry['column'],entry['file'],entry['sha256'])
        spec=bodies['forms'][entry['form']-1];w,h=spec['cellSize'];offset=entry['offset'];rect=dict(x=0,y=0,width=w,height=h)
        def n(kind,local,root,matrix,children):return dict(type=kind,matrix=matrix,localBounds=local,rootBounds=root,visible=True,alpha=1,children=children)
        global_rect=dict(x=offset['x'],y=offset['y'],width=w,height=h)
        leaf=n('flash.display::Bitmap',rect,global_rect,IDENTITY,[])
        sprite=n('flash.display::Sprite',rect,global_rect,IDENTITY,[leaf])
        clip=n('flash.display::Sprite',rect,global_rect,dict(IDENTITY,tx=offset['x'],ty=offset['y']),[sprite])
        root=n('flash.display::Sprite',global_rect,global_rect,IDENTITY,[clip]);outer=dict(IDENTITY,tx=entry['root']['x'],ty=entry['root']['y'])
        tree(root,identity,'body-'+str(entry['form'])+'-'+entry['owner'],'body','/cells/'+str(index),outer,form=entry['form'],cell=(entry['row'],entry['column'],entry['direct']))
        counts[identity]=4
    effects=load('effects-native.json.gz')
    for index,entry in enumerate(effects['states']):
        source,cid=symbols[entry['symbol']]
        for baseline in entry['baselines']:
            identity=f"effect:{entry['symbol']}:{entry['tick']}:s{baseline['scale']}:d{baseline['sign']}"
            state(identity,'Controlled recursive frame1 then native playback',entry['symbol'],entry['tick'],baseline['path'],baseline['sha256'])
            outer=dict(IDENTITY,a=baseline['scale']*baseline['sign'],d=baseline['scale'],tx=baseline['root']['x'],ty=baseline['root']['y'])
            tree(entry['tree'],identity,'effect-'+entry['symbol'],'effects','/states/'+str(index)+'/tree',outer,source,cid)
            counts[identity]=source_count(entry['tree'],source,cid)
    for corpus in ('dynamic','buff'):
        data=load(corpus+'-native.json.gz')
        for index,entry in enumerate(data['rows']):
            identity=corpus+':'+entry['id']+':'+str(entry['tick']);assert 'capture' in entry
            state(identity,'Source caller/BBDC/bullet/protection and buff projection; explicit24 FPS host tick',entry['id'],entry['tick'],entry['capture'],entry['captureSha256'])
            form=int(entry['id'].split('-')[1]);tree(entry['display'],identity,corpus+'-'+entry['id'],corpus,'/rows/'+str(index)+'/display',IDENTITY,form=form,cell=(entry['row'],entry['column'],entry['direct']))
            # Source-derived wrapper topology plus binary-expanded native symbol subtrees.
            def expected_count(node):
                if node['type'] in symbols:
                    source,cid=symbols[node['type']];return source_count(node,source,cid)
                return 1+sum(expected_count(c) for c in node['children'])
            counts[identity]=expected_count(entry['display'])
    extracted=sorted(s['id'] for s in states);assert extracted==expected['expectedStateIds']
    result=dict(schemaVersion=1,truthId='task-settings-222a.pet-turtle-visual',status='draft',scope=dict(taskId='TASK-SETTINGS-222A',surfaceId='pet-turtle-family-13-symbols',originalVersion='RegiMA restored SWFs with legacy172845 caller evidence',description='Finite target-family visual fixtures only. Combat collision, shared hero/HUD/hit-spark rendering and full-game scheduling excluded; no modern visual exceptions.'),generatedBy=dict(tool='tools/turtle-visual/manifest.py',toolVersion='1',command='python tools/turtle-visual/manifest.py',generatedAt=generated_at),provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='topLeft'),states=states,displayObjects=list(objects.values()),baselines=baselines,completeness=dict(expectedStateIds=expected['expectedStateIds'],extractedStateIds=extracted,expectedVisibleObjectCountByState=counts,displayListMatched=False,stateSetMatched=True,unresolved=['Independent normalized display-list/count/parent/mask acceptance and complete provenance linkage pending.','Repeated generation, final consumer matrix and project closure gates pending.']))
    result['completeness']['unresolved']=[dict(id='pending-'+str(i+1),description=description,impact='validation',nextEvidence='Independent normalization/provenance verifier and repeated generation, then project closure checks.') for i,description in enumerate(result['completeness']['unresolved'])]
    result['scope']['description']+=' Registration is the Flash symbol coordinate origin, not export top-left. parentBounds transforms local geometric AABBs; stageBounds transforms native rootBounds. Tight opaque-pixel/mask/filter extents use native baselines; collision remains222B.'
    if verified:
        result['status']='verified';result['completeness']['displayListMatched']=True;result['completeness']['unresolved']=[]
        result['generatedBy']['generatedAt']=acceptance['generatedAt'];result['generatedBy']['command']+=' --verified'
    schema=json.loads((ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json').read_text(encoding='utf-8'))
    jsonschema.Draft202012Validator(schema).validate(result)
    TARGET.write_text(json.dumps(result,separators=(',',':'))+'\n',encoding='utf-8',newline='\n')
    print('222A',result['status'],'manifest:',len(states),'states;',len(objects),'objects;',TARGET.stat().st_size,'bytes; Schema passed')


if __name__=='__main__':main()
