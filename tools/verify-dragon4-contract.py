"""Independent 220 artifact coverage/field encoding and negative contract checks."""
import copy
import hashlib
import json
import runpy
import sys
from pathlib import Path
import jsonschema
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-220'
DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-220-dragon4-trigger-collision.json'


def read(path): return json.loads(path.read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def rect(b): return dict(left=b['x'],top=b['y'],width=b['width'],height=b['height'])


def validate(manifest,contract,native,source):
    schemas=ROOT/'docs/reverse-engineering/ground-truth/schema'
    jsonschema.Draft202012Validator(read(schemas/'ui-ground-truth.schema.json')).validate(manifest)
    jsonschema.Draft202012Validator(read(schemas/'dragon4-trigger-collision.schema.json')).validate(contract)
    states={f'PetDragonBullet4-{f}-{d}' for f in range(1,49) for d in ['left','right']}
    assert len(manifest['states'])==96 and {s['id'] for s in manifest['states']}==states
    assert set(manifest['completeness']['expectedStateIds'])==set(manifest['completeness']['extractedStateIds'])==states
    rows={r['frame']:r for r in contract['frames']};assert set(rows)==set(range(1,49))
    objects={o['id']:o for o in manifest['displayObjects']};assert len(objects)==len(manifest['displayObjects'])==384
    visible=dict.fromkeys(states,0)
    for obj in objects.values():
        assert obj['parentId'] is None or obj['parentId'] in objects
        for p in obj['placements']:visible[p['stateId']]+=int(p['visible'])
    assert visible==manifest['completeness']['expectedVisibleObjectCountByState']
    for index in range(48):
        row=rows[index+1];original=source['states'][index];tree=native['trees'][index]['tree'];asset=native['assets'][index]
        assert row['localBounds']==rect(tree['bounds']) and row['blank'] is False
        assert row['displayList']==original['displayList']
        assert row['production']['path']==asset['sourcePath'] and row['production']['sha256']==asset['sha256']==sha(ROOT/asset['sourcePath'])
        for k in ['cropX','cropY','registrationX','registrationY']:assert row['production'][k]==asset[k]
        nodes={'root':tree,'root/1':tree['children'][0],
               'root/1/1':tree['children'][0]['children'][0],'root/1/2':tree['children'][0]['children'][1]}
        for direction,sign,px in [('left',1,350),('right',-1,590)]:
            state=f'PetDragonBullet4-{index+1}-{direction}'
            observed=next(i for i in native['actual'] if i['frame']==index+1 and i['sign']==sign)
            box=rect(observed['bullet']);box['left']-=observed['sourceRoot']['x'];box['top']-=observed['sourceRoot']['y']
            assert row['directions'][direction]==dict(bounds=box,fieldId=f'tile-{index%15+1}-{direction}')
            for path,node in nodes.items():
                obj=objects[state+'-'+path];p=obj['placements'][0]
                assert p['localBounds']==rect(node['bounds']) and p['alpha']==node['alpha']
                assert obj['render']['filters']==node['filters'] and obj['render']['blendMode']==node['blendMode']
                stage=rect(node['stageBounds']);stage['left']=px+(stage['left'] if sign==1 else -stage['left']-stage['width']);stage['top']+=450
                assert p['stageBounds']==stage
                if path!='root':assert p['localMatrix']==node['matrix']
            assert objects[state+'-root/1/1']['placements'][0]['visible'] is False
            assert objects[state+'-root/1/2']['render']['maskId']==state+'-root/1/1'
    assert contract['lifecycle']['sourceOrder']==['collision','optional hit callback','last-frame release','surviving owner position/flip follow']
    for e in contract['lifecycle']['sourceEvidence']:assert sha(ROOT/e['path'])==e['sha256']
    for key in ['maskPack','targetContract']:assert sha(ROOT/contract[key]['path'])==contract[key]['sha256']
    assert contract['provenance']['sourceDisplayListSha256']==sha(OUT/'source-display-list.json')
    assert contract['provenance']['nativeReportSha256']==sha(OUT/'air-original/measurement.json')


def main():
    runpy.run_path(str(ROOT/'tools/verify-dragon4-source.py'),run_name='__main__')
    manifest,contract=read(DEST),read(OUT/'collision-contract.json')
    native,source=read(OUT/'air-original/measurement.json'),read(OUT/'source-display-list.json')
    validate(manifest,contract,native,source)
    sampling=read(OUT/'sampling-verification.json')
    assert sampling['status']=='passed' and sampling['cases']==11520 and sampling['pixels']==78373320
    assert not sampling['booleanMismatches'] and not sampling['pixelMismatches'] and all(sampling['mutations'].values())
    assert sampling['fieldReportSha256']==sha(OUT/'source-fields/measurement.json') and sampling['oracleReportSha256']==sha(OUT/'air-original/measurement.json')
    fixture=read(OUT/'fixtures.json');names={f['id'] for f in fixture['fixtures']}
    expected={f'PetDragonBullet4-{f}-{d}-t{t}-{name}' for f in range(1,49) for d in ['left','right'] for t in range(3) for name in names}
    assert len(names)==40 and len(expected)==len(native['actual'])==11520 and {a['id'] for a in native['actual']}==expected
    assert all(any(a['actual'] for a in native['actual'] if a['frame']==frame) for frame in range(1,49))
    for item in native['actual']:
        if '-P1-' in item['id']:assert item['sourceRoot']==dict(x=123.25,y=345.75)
        if '-P2-' in item['id']:assert item['sourceRoot']==dict(x=731.75,y=412.25)
    pack=read(OUT/'runtime-mask-pack.json');lookup=runpy.run_path(str(ROOT/'tools/verify-dragon4-sampling.py'))['fields']()
    assert set(pack['fields'])==set(lookup) and len(lookup)==30
    planes=0
    for ident,(meta,native_planes) in lookup.items():
        field=pack['fields'][ident]
        for key in ['width','height','originX','originY','support']:assert field[key]==meta[key]
        assert len(field['quarterPhasePlaneIds'])==16
        for idx,digest in enumerate(field['quarterPhasePlaneIds']):
            p=pack['planes'][digest];size=meta['width']*meta['height'];assert p['size']==size
            actual=np.zeros(size,dtype=np.uint8);spans=p['spans'];assert len(spans)%2==0
            previous=0
            for start,length in zip(spans[::2],spans[1::2]):
                assert start>=previous and length>0 and start+length<=size
                actual[start:start+length]=1;previous=start+length
            assert hashlib.sha256(actual.tobytes()).hexdigest()==digest
            assert np.array_equal(actual,native_planes[idx].reshape(-1));planes+=1
    for baseline in manifest['baselines']:
        path=ROOT/baseline['path'];assert sha(path)==baseline['sha256'] and Image.open(path).size==(940,590)
    assert len(manifest['baselines'])==96
    mutants={
        'missing-frame':lambda m,c:c['frames'].pop(),
        'missing-child':lambda m,c:m['displayObjects'].pop(),
        'lost-mask':lambda m,c:m['displayObjects'][3]['render'].update(maskId=None),
        'mask-visible':lambda m,c:m['displayObjects'][2]['placements'][0].update(visible=True),
        'wrong-tile':lambda m,c:c['frames'][1]['directions']['left'].update(fieldId='tile-1-left'),
        'wrong-crop':lambda m,c:c['frames'][0]['production'].update(cropX=-1),
        'lost-clip-depth':lambda m,c:c['frames'][0]['displayList'][1].pop('clipDepth'),
        'wrong-trigger-tick':lambda m,c:c['lifecycle'].update(triggerHostTick=48),
        'hurt-interrupt':lambda m,c:c['lifecycle'].update(hurtInterrupts=True),
        'invented-heal':lambda m,c:c['lifecycle'].update(hitHealCallback=True),
    }
    killed=[]
    for name,mutate in mutants.items():
        m,c=copy.deepcopy(manifest),copy.deepcopy(contract);mutate(m,c)
        try:validate(m,c,native,source)
        except (AssertionError,jsonschema.ValidationError):killed.append(name)
        else:raise AssertionError('Survived mutation: '+name)
    if '--promote' in sys.argv:
        for obj,path in [(manifest,DEST),(contract,OUT/'collision-contract.json')]:
            obj['status']='verified';obj['completeness'].update(displayListMatched=True,stateSetMatched=True,unresolved=[])
            if 'sampling' in obj:obj['sampling']['status']='finite-source-verified'
            path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        validate(manifest,contract,native,source)
    result=dict(status='passed',states=96,objects=384,nativeCases=11520,fieldPlanesChecked=planes,artifactMutations=killed,
                manifestSha256=sha(DEST),contractSha256=sha(OUT/'collision-contract.json'),samplingSha256=sha(OUT/'sampling-verification.json'))
    (OUT/'contract-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print('220 contract verification:',result)


if __name__=='__main__': main()
