"""Source-derived atomic paint boundaries: preserve filters and timeline masks."""
from run import ROOT, BASE
from verify_pixels import load
from pack import encoded


def requests():
    sources=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/source-definitions.json')['sources']
    symbols={name:(s,cid) for s in sources for name,cid in s['symbols'].items()}
    def leaves(node,path,source=None,cid=None):
        assert node.get('mask') is None, 'Explicit masks need their own proven source boundary before sampling'
        assert node.get('blendMode','normal')=='normal', 'This finite composition contract covers normal blending only'
        if node['type'] in symbols:source,cid=symbols[node['type']]
        timeline=source['timelines'].get(str(cid)) if source else None
        placements=timeline[node['frame']-1] if timeline else None
        # A parent filter or source clipDepth range must stay a native boundary.
        if node.get('filters') or (placements and any(p.get('clipDepth') for p in placements)) or not node['children']:
            return [path]
        if placements:assert len(placements)==len(node['children'])
        result=[]
        for i,child in enumerate(node['children']):
            p=placements[i] if placements else None
            result+=leaves(child,path+'/'+str(i),source if p else None,p['characterId'] if p else None)
        return result
    result={}
    for row in load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')['rows']:
        groups={}
        for i,node in enumerate(row['display']['children']):
            paths=leaves(node,'root/'+str(i))
            if len(paths)>1:groups['root/'+str(i)]=paths
        if groups:result[row['id']+'-'+str(row['tick'])]=groups
    return result


if __name__=='__main__':
    result=requests();(BASE/'paint-requests.json').write_bytes(encoded(result))
    print('Source paint requests:',len(result),'states;',sum(len(v) for r in result.values() for v in r.values()),'parts')
