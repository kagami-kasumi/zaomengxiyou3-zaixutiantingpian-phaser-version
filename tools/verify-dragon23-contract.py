"""Independent completeness and source-field equality gate, with an explicit approximation boundary."""
from pathlib import Path
import hashlib
import json
import runpy
import sys
import zlib
import numpy as np
import jsonschema
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-219'
MANIFEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-219-dragon23-effect-collision.json'
COUNTS={'PetDragon2Bullet1':15,'PetDragon2Bullet2':30,'PetDragon3Bullet1':21,'PetDragon3Bullet3':10}
CIDS={'PetDragon2Bullet1':547,'PetDragon2Bullet2':563,'PetDragon3Bullet1':572,'PetDragon3Bullet3':603}


def read(path):return json.loads(path.read_text(encoding='utf-8'))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def rect(r):return dict(left=r['x'],top=r['y'],width=r['width'],height=r['height'])


def main():
    runpy.run_path(str(ROOT/'tools/verify-dragon23-source.py'),run_name='__main__')
    manifest=read(MANIFEST);contract=read(OUT/'collision-contract.json');native=read(OUT/'air-original/measurement.json')
    source=read(OUT/'source-display-list.json');pack=read(OUT/'runtime-mask-pack.json');sampling=read(OUT/'sampling-verification.json')
    for value,name in [(manifest,'ui-ground-truth.schema.json'),(contract,'dragon-effect-collision.schema.json')]:
        jsonschema.Draft202012Validator(read(ROOT/'docs/reverse-engineering/ground-truth/schema'/name)).validate(value)
    assert sampling['status']=='passed-with-approved-approximation' and sampling['exactAirEquivalence'] is False
    assert sampling['cases']==6448 and sampling['pixels']==25655000
    assert all(not dataset['booleanMismatches'] for dataset in sampling['datasets'])
    assert all(sampling['mutations'].values()) and len(sampling['mutations'])==8
    for name in ['air-original','edge-probe','roots-probe']:
        report=read(OUT/name/'measurement.json')
        assert sha(OUT/name/'probe.as.txt')==report['probeSha256']
        artifacts=report['artifactHashes']
        if name=='air-original':
            for folder,files in artifacts.items():
                for file,digest in files.items():assert sha(OUT/name/folder/file)==digest
        else:
            for file,digest in artifacts.items():assert sha(OUT/name/'buffers'/file)==digest
    assert contract['sampling']['status']=='approved-approximation'
    approval=ROOT/contract['sampling']['approvalPath']
    assert read(approval)['status']=='user-approved' and sha(approval)==contract['sampling']['approvalSha256']
    assert sha(ROOT/contract['maskPack']['path'])==contract['maskPack']['sha256']
    assert sha(ROOT/contract['targetContract']['path'])==contract['targetContract']['sha256']
    assert contract['rootMapping']['owners']==['P1','P2'] and contract['rootMapping']['expression']==dict(x='combat.x',y='combat.y')
    assert sha(OUT/'source-display-list.json')==contract['provenance']['sourceDisplayListSha256']
    assert sha(OUT/'air-original/measurement.json')==contract['provenance']['nativeReportSha256']
    for evidence in contract['lifecycle']['sourceEvidence']:assert sha(ROOT/evidence['path'])==evidence['sha256']
    expected={(s,f) for s,n in COUNTS.items() for f in range(1,n+1)}
    rows={(r['symbol'],r['frame']):r for r in contract['frames']}
    trees={(r['symbol'],r['frame']):r['tree'] for r in native['trees']}
    extracted={(r['symbol'],r['frame']):r for r in source['states']}
    assets={(r['symbol'],r['frame']):r for r in native['assets']}
    assert set(rows)==expected and len(contract['frames'])==76
    roots=read(OUT/'roots-probe/measurement.json')['actual']
    assert len(roots)==304
    root_keys=set()
    for item in roots:
        owner=item['id'].rsplit('-',1)[1];root_keys.add((item['symbol'],item['frame'],item['sign'],owner))
        assert item['sourceRoot']==({'x':123.25,'y':345.75} if owner=='P1' else {'x':731.75,'y':412.25})
        if rows[(item['symbol'],item['frame'])]['blank']:assert item['actual'] is False and item['cyanPixels']==0
    assert root_keys=={(s,f,sign,owner) for s,f in expected for sign in [1,-1] for owner in ['P1','P2']}
    expected_states={f'{s}-{f}-{direction}' for s,f in expected for direction in ['left','right']}
    assert {s['id'] for s in manifest['states']}==expected_states and len(manifest['states'])==152
    assert set(manifest['completeness']['expectedStateIds'])==set(manifest['completeness']['extractedStateIds'])==expected_states
    visible={s:0 for s in expected_states}
    objects={o['id']:o for o in manifest['displayObjects']};assert len(objects)==len(manifest['displayObjects'])==414
    for obj in objects.values():
        assert obj['parentId'] is None or obj['parentId'] in objects
        for placement in obj['placements']:visible[placement['stateId']]+=int(placement['visible'])
    assert visible==manifest['completeness']['expectedVisibleObjectCountByState']
    for key,row in rows.items():
        tree=trees[key];asset=assets[key]
        assert row['characterId']==CIDS[key[0]] and row['localBounds']==rect(tree['bounds'])
        assert row['blank']==(tree['bounds']['width']==0 or tree['bounds']['height']==0)
        assert row['displayList']==extracted[key]['displayList']
        assert row['production']['path']==asset['sourcePath'] and sha(ROOT/asset['sourcePath'])==row['production']['sha256']==asset['sha256']
        for field in ['cropX','cropY','registrationX','registrationY']:assert row['production'][field]==asset[field]
        assert row['production']['collisionUsesPngAlpha'] is False
        for direction,sign in [('left',1),('right',-1)]:
            item=next(i for i in native['actual'] if (i['symbol'],i['frame'],i['sign'])==(*key,sign))
            box=rect(item['bullet']);box['left']-=item['sourceRoot']['x'];box['top']-=item['sourceRoot']['y']
            assert row['directions'][direction]['bounds']==box
            assert row['directions'][direction]['fieldId']==asset['maskGroup']+'-'+direction
            state=f'{key[0]}-{key[1]}-{direction}'
            root=objects[state+'-root'];assert root['sourceIdentity']['characterId']==CIDS[key[0]]
            assert root['placements'][0]['localBounds']==rect(tree['bounds'])
            expected_nodes={'root':tree}
            def visit(node,path):
                children=[r for r in extracted[key]['displayList'] if r['path'].rsplit('/',1)[0]==path]
                assert len(children)==len(node['children'])
                for child,measured in zip(children,node['children']):
                    expected_nodes[child['path']]=measured;visit(measured,child['path'])
            visit(tree,'root')
            for path,measured in expected_nodes.items():
                obj=objects[state+'-'+path];placement=obj['placements'][0]
                assert placement['localBounds']==rect(measured['bounds']) and placement['alpha']==measured['alpha']
                assert obj['render']['filters']==measured['filters']
                if path!='root':assert placement['localMatrix']==measured['matrix']
    assert len(pack['fields'])==len(native['maskFields'])==54
    checked_planes=0
    for field in native['maskFields']:
        path=OUT/'air-original/mask-fields'/(field['id']+'.deflate');assert sha(path)==field['sha256']
        raw=zlib.decompress(path.read_bytes());assert len(raw)==field['rawBytes']
        packed=pack['fields'][field['id']]
        for key in ['width','height','originX','originY']:assert packed[key]==field[key]
        assert len(packed['quarterPhasePlaneIds'])==16
        for phase,plane_id in enumerate(packed['quarterPhasePlaneIds']):
            plane=pack['planes'][plane_id];size=field['width']*field['height'];assert plane['size']==size
            decoded=np.zeros(size,dtype=np.uint8);spans=plane['spans'];assert len(spans)%2==0
            previous=0
            for start,length in zip(spans[::2],spans[1::2]):
                assert start>=previous and length>0 and start+length<=size
                decoded[start:start+length]=1;previous=start+length
            assert hashlib.sha256(decoded.tobytes()).hexdigest()==plane_id
            source_phase=(phase//4)*100+(phase%4)*5;start=source_phase*field['phaseStride']
            original=np.unpackbits(np.frombuffer(raw[start:start+field['phaseStride']],dtype=np.uint8),bitorder='little')[:size]
            assert np.array_equal(decoded,original),(field['id'],phase)
            checked_planes+=1
    for baseline in manifest['baselines']:
        path=ROOT/baseline['path'];assert sha(path)==baseline['sha256']
        assert Image.open(path).size==(940,590)
    assert len(manifest['baselines'])==152
    if '--promote' in sys.argv:
        for value,path in [(contract,OUT/'collision-contract.json'),(manifest,MANIFEST)]:
            value['status']='verified';value['completeness'].update(displayListMatched=True,stateSetMatched=True,unresolved=[])
            path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    result=dict(status='passed',sourceFrames=76,directionalStates=152,displayObjects=414,quarterPlanesChecked=checked_planes,
                sourceTruth='verified source facts only',runtimeSampling='user-approved approximation, not exact AIR equivalence',
                nativeCases=6448,nativeBufferPixels=25655000,knownDifferingPixels=104)
    (OUT/'contract-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('219 contract verification:',result)


if __name__=='__main__':main()
