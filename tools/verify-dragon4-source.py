"""Independent binary/source/native checks for the single 220 masked trigger."""
import hashlib
import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-220'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify():
    helpers = runpy.run_path(str(ROOT / 'tools/verify-dragon23-source.py'))
    binary = helpers['definitions']
    source = json.loads((OUT/'source-display-list.json').read_text())
    native = json.loads((OUT/'air-original/measurement.json').read_text())
    logs=((OUT/'air-original/stdout.log').read_bytes()+b'\n'+(OUT/'air-original/stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    assert 'COMPLETE 11520 48' in logs and not any(line.startswith('FAIL ') for line in logs)
    assert native['actual']==[json.loads(line[5:]) for line in logs if line.startswith('CASE ')]
    assert native['trees']==[json.loads(line[5:]) for line in logs if line.startswith('TREE ')]
    pet_path = ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf'
    common_path = pet_path.with_name('StageCommon.swf')
    pet, common = binary(pet_path), binary(common_path)
    subset_path = ROOT/'local-resources/regima/task-outputs/task-settings-220/source.swf'
    subset = binary(subset_path)
    pet_ids = {535,536,537,538,539}
    common_ids = {53,94,95,104,105,106,107}
    assert set(subset)==pet_ids|common_ids
    assert sha(subset_path)==source['subsetSha256']==native['sourceSubsetSha256']
    for cid in pet_ids:
        assert subset[cid]==pet[cid]
        assert hashlib.sha256(pet[cid][1]).hexdigest()==source['sourceTagHashes'][str(cid)]
    for cid in common_ids: assert subset[cid]==common[cid]
    assert source['sourceHashes']=={'pet1.swf':sha(pet_path),'StageCommon.swf':sha(common_path)}
    states={s['frame']:s for s in source['states']}
    trees={s['frame']:s['tree'] for s in native['trees']}
    assert set(states)==set(trees)==set(range(1,49)) and len(native['trees'])==48
    nodes=filters=0
    for frame in range(1,49):
        state,tree=states[frame],trees[frame]
        assert tree['frame']==frame and tree['totalFrames']==48
        children=list(helpers['native_children'](tree))
        assert len(children)==len(state['displayList'])==3
        assert [c['characterId'] for c in state['displayList']]==[538,535,537]
        assert state['displayList'][1]['clipDepth']==3 and state['displayList'][1]['depth']==1
        assert children[0]['frame']==(frame-1)%15+1 and children[0]['totalFrames']==15
        for raw,actual in zip(state['displayList'],children):
            nodes+=1
            assert all(abs(raw['matrix'][k]-actual['matrix'][k])<1e-6 for k in ['a','b','c','d','tx','ty'])
            assert abs(raw['alpha']-actual['alpha'])<1e-6
            assert len(raw['filters'])==len(actual['filters'])
            for raw_filter,native_filter in zip(raw['filters'],actual['filters']):
                assert raw_filter['attributes']['type']=='COLORMATRIXFILTER'
                assert native_filter['type']=='flash.filters::ColorMatrixFilter'
                values=[float(v['item']['text']) for v in raw_filter['children'][0]['matrix']['children']]
                assert len(values)==len(native_filter['matrix'])==20
                assert all(abs(a-b)<1e-6 for a,b in zip(values,native_filter['matrix']))
                filters+=1
    assert sha(OUT/'air-original/probe.as.txt')==native['probeSha256']
    assert sha(ROOT/native['originalHitTestPath'])==native['originalHitTestSha256']
    assert sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll')==native['runtimeDllSha256']
    assert sha(OUT/'fixtures.json')==native['fixtureSha256']
    report=dict(status='passed',sourceDefinitions=5,targetDefinitions=7,frames=48,directionalStates=96,
                recursiveNodes=nodes,colorFilterInstances=filters,maskedStates=48,
                sourceDisplayListSha256=sha(OUT/'source-display-list.json'),nativeReportSha256=sha(OUT/'air-original/measurement.json'),
                scope='Unchanged source bytes and native recursive states. Sampling correctness is a separate check.')
    (OUT/'source-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('220 source verification:',report)


if __name__=='__main__': verify()
