"""Independent reference-tree, Schema, provenance, parent and mask acceptance."""
import gzip
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import jsonschema

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
TARGET=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'


def load(name):
    raw=(OUT/name).read_bytes();return json.loads(gzip.decompress(raw) if name.endswith('.gz') else raw)


def close(a,b):return abs(a-b)<1e-6


def main():
    raw_manifest=TARGET.read_bytes();manifest=json.loads(raw_manifest)
    schema=json.loads((ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json').read_text(encoding='utf-8'))
    jsonschema.Draft202012Validator(schema).validate(manifest)
    expected=load('expected-visual-states.json')['expectedStateIds'];assert sorted(s['id'] for s in manifest['states'])==expected
    source={Path(s['path']).stem:s for s in load('source-definitions.json')['sources']}
    refs={};fixtures={};image_hashes={}
    def nodes(node,path,table):
        table[path]=node
        for i,child in enumerate(node['children']):nodes(child,path+'/children/'+str(i),table)
    body=load('body-native.json.gz')
    load_body=load('body-inputs.json')
    for i,cell in enumerate(body['cells']):fixtures['body:'+cell['id']]=dict(corpus='body',cell=cell,pointer='/cells/'+str(i),image=cell['file'],sha=cell['sha256'])
    effects=load('effects-native.json.gz')
    for i,entry in enumerate(effects['states']):
        table={};nodes(entry['tree'],'/states/'+str(i)+'/tree',table)
        for b in entry['baselines']:
            key=f"effect:{entry['symbol']}:{entry['tick']}:s{b['scale']}:d{b['sign']}"
            fixtures[key]=dict(corpus='effects',table=table,image=b['path'],sha=b['sha256'],outer=dict(a=b['scale']*b['sign'],b=0,c=0,d=b['scale'],tx=b['root']['x'],ty=b['root']['y']))
    for corpus in ('dynamic','buff'):
        data=load(corpus+'-native.json.gz')
        for i,row in enumerate(data['rows']):
            table={};nodes(row['display'],'/rows/'+str(i)+'/display',table)
            fixtures[corpus+':'+row['id']+':'+str(row['tick'])]=dict(corpus=corpus,table=table,image=row['capture'],sha=row['captureSha256'],outer=dict(a=1,b=0,c=0,d=1,tx=0,ty=0))
    assert set(fixtures)==set(expected)
    for item in manifest['provenance']:
        assert hashlib.sha256((ROOT/item['sourcePath']).read_bytes()).hexdigest()==item['sha256'],item['id']
    for baseline in manifest['baselines']:
        fixture=fixtures[baseline['stateId']]
        assert (baseline['path'],baseline['sha256'])==(fixture['image'],fixture['sha'])
        if baseline['path'] not in image_hashes:image_hashes[baseline['path']]=hashlib.sha256((ROOT/baseline['path']).read_bytes()).hexdigest()
        assert image_hashes[baseline['path']]==baseline['sha256']
    objects={o['id']:o for o in manifest['displayObjects']};assert len(objects)==len(manifest['displayObjects'])
    present={key:{p['stateId']:p for p in obj['placements']} for key,obj in objects.items()}
    by_state=defaultdict(list)
    for oid,obj in objects.items():
        assert len(present[oid])==len(obj['placements'])
        for p in obj['placements']:by_state[p['stateId']].append((obj,p))
    failures=[]
    def require(value,label):
        if not value:failures.append(label)
    def check_placement(obj,p,fixture):
        label=p['stateId']+':'+obj['id'];sid=obj['sourceIdentity'];parent=objects.get(obj['parentId'])
        require(not parent or p['stateId'] in present[parent['id']],label+':parent-state')
        require(p['registrationPoint']==dict(x=0,y=0),label+':symbol-origin')
        # Flash SWF/Bitmap display coordinates use their local origin as registration;
        # pixel export origins are separate signed bounds, never substituted here.
        if fixture['corpus']=='body':return
        ref=p['evidenceRefs'][0];corpus,pointer=ref.split('#',1)
        require(corpus==fixture['corpus'] and pointer in fixture['table'],label+':pointer')
        if pointer not in fixture['table']:return
        node=fixture['table'][pointer];require(sid['frame']==node.get('frame'),label+':frame')
        matrix=node['matrix'] if parent else fixture['outer']
        require(all(close(p['localMatrix'][k],v) for k,v in matrix.items()),label+':matrix')
        for field,rect,transform in [('stageBounds',node['rootBounds'],fixture['outer']),('parentBounds',node['localBounds'],matrix)]:
            xs=[];ys=[]
            for x in [rect['x'],rect['x']+rect['width']]:
                for y in [rect['y'],rect['y']+rect['height']]:xs.append(transform['a']*x+transform['c']*y+transform['tx']);ys.append(transform['b']*x+transform['d']*y+transform['ty'])
            calculated=dict(left=min(xs),top=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))
            require(all(close(p[field][k],v) for k,v in calculated.items()),label+':'+field)
        require(obj['render']['filters']==node['filters'],label+':filters')
        for k,original in [('left','x'),('top','y'),('width','width'),('height','height')]:require(close(p['localBounds'][k],node['localBounds'][original]),label+':localBounds')
        require(close(p['alpha'],node['alpha']) and p['colorTransform']==node['colorTransform'],label+':color')
        if sid['characterId'] is not None:
            owner=source.get(sid['provenanceId']);require(owner is not None and str(sid['characterId']) in owner['definitions'],label+':owner')
            if parent and parent['sourceIdentity']['characterId'] is not None:
                ps=parent['sourceIdentity'];timeline=source[ps['provenanceId']]['timelines'].get(str(ps['characterId']))
                if timeline:
                    placements=timeline[ps['frame']-1]
                    placed=next((q for q in placements if q['depth']==obj['depth']),None)
                    require(placed is not None and placed['characterId']==sid['characterId'],label+':source-character')
                    masks=[q for q in placements if q.get('clipDepth',-1)>=obj['depth']>q['depth']]
                    mask=objects.get(obj['render']['maskId'])
                    require(bool(mask)==bool(masks),label+':mask-binding')
                    if masks and mask:
                        require(mask['sourceIdentity']['characterId']==masks[-1]['characterId'] and mask['depth']==masks[-1]['depth'] and mask['parentId']==parent['id'],label+':mask-source')
        mask=objects.get(obj['render']['maskId'])
        if obj['render']['maskId']:require(mask is not None and mask['objectType']=='mask' and p['stateId'] in present[mask['id']],label+':mask-state')
    for state,entries in by_state.items():
        fixture=fixtures[state];require(len(entries)==manifest['completeness']['expectedVisibleObjectCountByState'][state],state+':count')
        if fixture['corpus']=='body':
            require(len(entries)==4 and sum(o['objectType']=='bitmap' for o,p in entries)==1,state+':body-topology')
            cell=fixture['cell'];spec=load_body['forms'][cell['form']-1];w,h=spec['cellSize']
            dx=-w/2+spec['offset'][0]*(1 if cell['direct']==1 else -1);dy=-h/2+spec['offset'][1]
            root=next((pair for pair in entries if pair[0]['parentId'] is None),None);chain=[]
            while root:
                chain.append(root);children=[pair for pair in entries if pair[0]['parentId']==root[0]['id']];require(len(children)<=1,state+':body-parent-chain');root=children[0] if children else None
            require(len(chain)==4,state+':body-depth')
            for i,(obj,p) in enumerate(chain):
                x,y=(cell['root']['x'],cell['root']['y']) if i==0 else (dx,dy) if i==1 else (0,0)
                require(p['localMatrix']==dict(a=1,b=0,c=0,d=1,tx=x,ty=y),state+':body-matrix')
                require(p['stageBounds']==dict(left=cell['root']['x']+dx,top=cell['root']['y']+dy,width=w,height=h),state+':body-stage-crop')
                require(p['localBounds']==dict(left=dx if i==0 else 0,top=dy if i==0 else 0,width=w,height=h),state+':body-local-crop')
                require(p['parentBounds']==(p['stageBounds'] if i==0 else dict(left=dx if i==1 else 0,top=dy if i==1 else 0,width=w,height=h)),state+':body-parent-crop')
                require(obj['depth']==0,state+':body-child-index')
                require(obj['render']['maskId'] is None and obj['render']['filters']==[],state+':body-render')
                if i==3:
                    sid=obj['sourceIdentity'];require(sid['provenanceId']=='pet1' and sid['characterId']==source['pet1']['symbols'][spec['symbol']],state+':body-source')
                    require(f";row={cell['row']};column={cell['column']};direct={cell['direct']};body-native-pool-crop" in obj['render']['assetRef'],state+':body-asset-crop')
        else:
            pointers=[p['evidenceRefs'][0].split('#',1)[1] for o,p in entries]
            require(len(pointers)==len(set(pointers)) and set(pointers)==set(fixture['table']),state+':complete-original-tree')
        for obj,p in entries:check_placement(obj,p,fixture)
    # Recompute source slice fingerprints from original text, including unused-branch boundaries.
    source_methods=load('dynamic-source-methods.json')['sourceMethods']
    bbdc=load('body-methods.json');source_methods += [dict(m,path=bbdc['sourcePath'],sha256=bbdc['sourceSha256']) for m in bbdc['methods']]
    source_methods += [dict(m,path=m['sourcePath']) for m in load('owner-verification.json')['sourceMethods']]
    for form in load_body['forms']:source_methods += [dict(m,path=form['sourcePath'],sha256=form['sourceSha256']) for m in form['sourceMethods']]
    for record in source_methods:
        path=ROOT/record['path'];require(hashlib.sha256(path.read_bytes()).hexdigest()==record['sha256'],'source-file:'+record['method'])
        if 'sliceSha256' not in record:continue
        text=path.read_text(encoding='utf-8');match=re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+re.escape(record['method'])+r'\(',text);assert match
        opening=text.index('{',match.end());end=opening+1;depth=1
        while depth:depth+=(text[end]=='{')-(text[end]=='}');end+=1
        require(hashlib.sha256(text[match.start():end].encode()).hexdigest()==record['sliceSha256'],'source-slice:'+record['method'])
    # Mutate actual normalized placements/ownership/masks, not expected source data.
    mutations={}
    import copy
    candidates=[(o,p) for o in objects.values() for p in o['placements'] if not p['stateId'].startswith('body:')]
    for kind in ('scale','owner','timing','mask','registration'):
        pair=next((o,p) for o,p in candidates if (o['render']['maskId'] if kind=='mask' else o['sourceIdentity']['characterId'] is not None))
        obj,p=copy.deepcopy(pair);before=len(failures)
        if kind=='scale':p['localMatrix']['a']+=1
        elif kind=='owner':obj['sourceIdentity']['provenanceId']='missing-source'
        elif kind=='timing':obj['sourceIdentity']['frame']=999
        elif kind=='mask':obj['render']['maskId']=None
        else:p['registrationPoint']['x']=1
        check_placement(obj,p,fixtures[p['stateId']]);mutations[kind]=len(failures)>before;del failures[before:]
    report=dict(status='passed-draft-normalization' if not failures else 'failed',states=len(fixtures),objects=len(objects),uniqueBaselineFiles=len(image_hashes),failures=failures[:30],failureCount=len(failures),mutationRejected=mutations,
                manifestSha256=hashlib.sha256(raw_manifest).hexdigest(),sourceMethodFingerprints=len(source_methods),relatedChecks=['owner-verification.json','time-verification.json','mask-mutations.json','body-verification.json'],remaining=['Independent final review, repeat generation and task closure; draft remains draft.'])
    (OUT/'manifest-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report));assert not failures and all(mutations.values())


if __name__=='__main__':main()
