"""Native per-channel response requests for the finite SLD source tuples."""
import hashlib
from run import ROOT, BASE
from verify_pixels import load
from pack import encoded


def signature(value):
    if isinstance(value,dict):return {k:signature(v) for k,v in value.items() if k not in ('name','path')}
    if isinstance(value,list):return [signature(v) for v in value]
    return value


def requests():
    layers={r['id']:r for r in load(BASE/'dynamic/layers.json')['rows']}
    representatives={};bindings=[]
    for row in load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')['rows']:
        identity=row['id']+'-'+str(row['tick'])
        for depth,node in enumerate(row['display']['children']):
            if not any(c['type']=='PetTurtle1Bullet2' for c in node['children']):continue
            key=hashlib.sha256(encoded(signature(node))).hexdigest()
            p=layers[identity]['groups'][depth]['primary']
            p=p.get('canonical',p)
            assert not p['empty'] and p['origin']['x']>=0 and p['origin']['y']>=0
            assert p['origin']['x']+p['width']<=940 and p['origin']['y']+p['height']<=590
            representatives.setdefault(key,dict(id=identity,depth=depth,key=key,origin=p['origin'],width=p['width'],height=p['height']))
            bindings.append(dict(id=identity,path='root/'+str(depth),key=key))
    by_id={}
    for request in representatives.values():by_id.setdefault(request['id'],[]).append(request)
    return dict(requests=by_id,bindings=bindings,uniqueTuples=len(representatives))


if __name__=='__main__':
    result=requests();(BASE/'transfer-requests.json').write_bytes(encoded(result))
    print('Native finite transfer requests:',result['uniqueTuples'],'tuples;',len(result['bindings']),'bindings')
