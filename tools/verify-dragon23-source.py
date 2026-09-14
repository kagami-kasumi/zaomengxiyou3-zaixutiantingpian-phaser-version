"""Verify source bytes and native recursive states independently of extraction traversal."""
from pathlib import Path
import hashlib
import json
import struct
import zlib

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-219'
EXPECTED={'PetDragon2Bullet1':15,'PetDragon2Bullet2':30,'PetDragon3Bullet1':21,'PetDragon3Bullet3':10}


def sha(data):return hashlib.sha256(data).hexdigest()


def definitions(path):
    data=path.read_bytes()
    assert data[:3] in (b'CWS',b'FWS')
    body=zlib.decompress(data[8:]) if data[:3]==b'CWS' else data[8:]
    assert len(body)+8==struct.unpack_from('<I',data,4)[0]
    cursor=(5+4*(body[0]>>3)+7)//8+4
    result={}
    while cursor<len(body):
        word=struct.unpack_from('<H',body,cursor)[0];cursor+=2
        code,length=word>>6,word&63
        if length==63:length=struct.unpack_from('<I',body,cursor)[0];cursor+=4
        payload=body[cursor:cursor+length];cursor+=length
        assert len(payload)==length
        if code in (2,6,20,21,22,32,35,36,39,83,90):
            cid=struct.unpack_from('<H',payload)[0]
            assert cid not in result
            result[cid]=(code,payload)
        if code==0:break
    return result


def native_children(node):
    for child in node['children']:
        yield child
        yield from native_children(child)


def main():
    source=json.loads((OUT/'source-display-list.json').read_text(encoding='utf-8'))
    native=json.loads((OUT/'air-original/measurement.json').read_text(encoding='utf-8'))
    original=definitions(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf')
    subset=definitions(ROOT/'local-resources/regima/task-outputs/task-settings-219/source.swf')
    assert sha((ROOT/'local-resources/regima/task-outputs/task-settings-219/source.swf').read_bytes())==source['subsetSha256']
    for name,digest in source['sourceHashes'].items():
        assert sha((ROOT/'local-resources/regima/source/restored-swfs/assets'/name).read_bytes())==digest
    for cid in range(543,604):
        assert original[cid]==subset[cid],cid
        assert sha(original[cid][1])==source['sourceTagHashes'][str(cid)]
    assert len(subset)==68
    common=definitions(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf')
    for cid in set(subset)-set(range(543,604)):assert subset[cid]==common[cid]
    states={(s['symbol'],s['frame']):s for s in source['states']}
    trees={(s['symbol'],s['frame']):s['tree'] for s in native['trees']}
    expected={(symbol,frame) for symbol,total in EXPECTED.items() for frame in range(1,total+1)}
    assert set(states)==set(trees)==expected and len(native['trees'])==76
    nodes=filters=0
    for key,state in states.items():
        tree=trees[key]
        assert tree['frame']==key[1] and tree['totalFrames']==EXPECTED[key[0]]
        actual=list(native_children(tree));assert len(actual)==len(state['displayList']),key
        for extracted,measured in zip(state['displayList'],actual):
            nodes+=1
            assert all(abs(extracted['matrix'][k]-measured['matrix'][k])<1e-6 for k in ('a','b','c','d','tx','ty')),key
            assert abs(extracted['alpha']-measured['alpha'])<1e-6
            if extracted['kind']=='DefineSpriteTag':assert extracted['frame']==measured['frame'],key
            assert len(extracted['filters'])==len(measured['filters'])
            for raw,observed in zip(extracted['filters'],measured['filters']):
                assert raw['attributes']['type']=='COLORMATRIXFILTER'
                assert observed['type']=='flash.filters::ColorMatrixFilter'
                values=[float(v['item']['text']) for v in raw['children'][0]['matrix']['children']]
                assert len(values)==len(observed['matrix'])==20
                assert all(abs(a-b)<1e-6 for a,b in zip(values,observed['matrix']));filters+=1
    assert native['probeSha256']==sha((OUT/'air-original/probe.as.txt').read_bytes())
    assert native['sourceSubsetSha256']==source['subsetSha256']
    result=dict(status='passed',scope='Source byte identity, finite frame set, local recursive matrices/alpha/child frames/color filters only; excludes collision sampler equivalence.',
                sourceDefinitions=61,subsetDefinitions=68,frames=76,directionalStates=152,recursiveNodes=nodes,colorFilterInstances=filters,
                sourceDisplayListSha256=sha((OUT/'source-display-list.json').read_bytes()),nativeReportSha256=sha((OUT/'air-original/measurement.json').read_bytes()))
    (OUT/'source-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('219 source verification:',result)


if __name__=='__main__':main()
