"""Independent source/group/crop correspondence and finite mutation rejection."""
import copy
import hashlib
import json
import jsonschema
from run import ROOT, BASE, OUT, sha
from pack import MODES, encoded
from verify_pixels import load
from manifest import TARGET, PARENT


def restore(value):
    if isinstance(value, list):
        return [restore(v) for v in value]
    if isinstance(value, dict):
        result = {k:restore(v) for k,v in value.items() if k not in ('originalPath','sha256')}
        if 'originalPath' in value:
            result['path'] = value['originalPath']
        return result
    return value


def exact(candidate, native):
    assert restore(candidate) == native, 'Native sampling fields changed'


def main():
    manifest = load(TARGET)
    parent = load(PARENT)
    expected = load(ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A/expected-visual-states.json')['expectedStateIds']
    jsonschema.Draft202012Validator(load(ROOT / 'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json')).validate(manifest)
    assert manifest['states'] == parent['states'] and manifest['baselines'] == parent['baselines']
    assert sorted(manifest['completeness']['extractedStateIds']) == sorted(expected)
    assert parent['status'] == 'verified'
    for p in manifest['provenance']:
        assert sha(ROOT / p['sourcePath']) == p['sha256'], p['id']
    objects = {(p['stateId'],o['sourceIdentity']['instanceName']):(o,p) for o in manifest['displayObjects'] for p in o['placements']}
    links={(v['stateId'],v['sourcePath']):v for v in load(OUT/'projection-links.json')['links']}
    assert set(links)==set(objects)
    seen_images, ids, counts = set(), [], {}
    pairs, source_count, component_count, offscreen = {}, 0, 0, []
    for mode in MODES:
        data = load(OUT/(mode+'-resources.json.gz'))
        original = load(ROOT/data['sourceCorpus'])
        assert sha(ROOT/data['sourceCorpus']) == data['sourceCorpusSha256']
        work = BASE / mode
        raw = load(work/('canonical-layers.json' if (work/'canonical-layers.json').exists() else 'layers.json'))['rows']
        assert len(data['rows']) == len(raw)
        sources = ({r['id']:r for r in original['cells']} if mode=='body' else
                   {b['id']:dict(state=s,baseline=b) for s in original['states'] for b in s['baselines']} if mode=='effects' else
                   {r['id']+'-'+str(r['tick']):r for r in original['rows']})
        assert set(sources) == {r['id'] for r in data['rows']}
        assert len(sources) == len(data['rows'])
        for row, native in zip(data['rows'],raw):
            exact(row,native)
            source = sources[row['id']]
            if mode=='body':
                sid='body:'+row['id']
                assert all(row['meta'][k]==source[k] for k in ['owner','form','column','direct','row'])
            elif mode=='effects':
                s,b=source['state'],source['baseline'];m=row['meta']
                assert m['symbol']==s['symbol'] and m['tick']==s['tick'] and m['tree']==s['tree']
                assert m['owner']==s['owner'] and m['sign']==b['sign'] and m['scale']==b['scale']
                sid=f"effect:{s['symbol']}:{s['tick']}:s{b['scale']}:d{b['sign']}"
                if b['scale']==2:
                    p=row['primary'];x,y=p['origin']['x'],p['origin']['y']
                    if x<0 or y<0 or x+p['width']>940 or y+p['height']>590:offscreen.append(row['id'])
            else:
                sid=mode+':'+source['id']+':'+str(source['tick'])
                children=source['display']['children']
                assert len(row['groups'])==len(children)
                for depth,(group,node) in enumerate(zip(row['groups'],children)):
                    assert group['path']=='root/'+str(depth) and group['depth']==depth
                    assert group['type']==node['type'] and group['visible']==node['visible']
                    if group['components']:
                        assert len(group['components'])==len(node['children'])
                        for n,(part,child) in enumerate(zip(group['components'],node['children'])):
                            assert part['path']==group['path']+'/'+str(n) and part['type']==child['type']
                            component_count+=1
                    source_count+=1
            ids.append(sid);counts[sid]=0
            units=[part for owner in row.get('groups',[row]) for part in ([owner] if 'nativeResponse' in owner else owner.get('paintParts',[owner]))]
            for depth,group in enumerate(units):
                selected=group.get('canonical',group['primary'].get('canonical',group['primary']))
                obj,placement=objects[(sid,group.get('path','root'))]
                link=links[(sid,group.get('path','root'))]
                assert link['objectId']==obj['id'] and link['corpus']==mode
                assert link['nativeResponse']==group.get('nativeResponse')
                assert obj['render']==dict(assetRef=selected['path'],blendMode='normal',filters=[],maskId=None)
                assert obj['depth']==depth
                assert placement['visible']==(not selected['empty'])
                assert placement['localMatrix']==dict(a=1,b=0,c=0,d=1,tx=selected['origin']['x'],ty=selected['origin']['y'])
                assert placement['registrationPoint']==dict(x=-selected['origin']['x'],y=-selected['origin']['y'])
                assert placement['localBounds']==dict(left=0,top=0,width=selected['width'],height=selected['height'])
                counts[sid]+=int(not selected['empty'])
            for parent_group in row.get('groups',[row]):
                assert 'nativeResponse' not in parent_group, 'Incomplete transfer experiment is not an accepted resource'
                for unit in [parent_group,*parent_group.get('components',[]),*parent_group.get('paintParts',[])]:
                    for capture in [unit['primary'],unit['expanded'],unit.get('canonical'),unit['primary'].get('canonical')]:
                        if capture is None:continue
                        if capture['sha256'] not in seen_images:
                            assert sha(ROOT/capture['path'])==capture['sha256']
                            seen_images.add(capture['sha256'])
                    canonical=unit.get('canonical',unit['primary'].get('canonical'))
                    if canonical and 'rasterContexts' not in unit:
                        for c in [unit['primary'],canonical]:
                            assert not c['empty'] and c['origin']['x']>0 and c['origin']['y']>0
                            assert c['origin']['x']+c['width']<940 and c['origin']['y']+c['height']<590
            pairs.setdefault(mode,(row,native))
    assert sorted(ids)==sorted(expected) and counts==manifest['completeness']['expectedVisibleObjectCountByState']
    assert len(objects)==sum(sum(1 if 'nativeResponse' in g else len(g.get('paintParts',[g])) for g in r.get('groups',[r])) for mode in MODES for r in load(OUT/(mode+'-resources.json.gz'))['rows'])
    assert any('-d-1' in s for s in offscreen) and any('-d1' in s for s in offscreen)
    mutations={}
    def reject(name,mode,edit):
        row,native=pairs[mode];candidate=copy.deepcopy(row);edit(candidate)
        try:exact(candidate,native)
        except AssertionError:mutations[name]=True;return
        raise AssertionError('Mutation escaped: '+name)
    reject('owner','body',lambda r:r['meta'].update(owner='P2' if r['meta']['owner']=='P1' else 'P1'))
    reject('timing','effects',lambda r:r['meta'].update(tick=r['meta']['tick']+1))
    reject('scale','effects',lambda r:r['meta'].update(scale=3))
    reject('source','effects',lambda r:r['meta']['tree'].update(type='wrong-source'))
    reject('mask','effects',lambda r:r['meta']['tree'].update(mask='wrong-mask'))
    reject('filter','effects',lambda r:r['meta']['tree'].update(filters=[{'type':'wrong-filter'}]))
    reject('crop-origin','body',lambda r:r['primary']['origin'].update(x=r['primary']['origin']['x']+1))
    reject('crop-size','body',lambda r:r['primary'].update(width=r['primary']['width']+1))
    reject('layer-missing','dynamic',lambda r:r['groups'].pop())
    reject('state-identity','body',lambda r:r.update(id='missing-state'))
    mutations['missing-frame']=sorted(ids[:-1])!=sorted(expected)
    assert all(mutations.values())
    report=dict(status='passed',stateCount=len(ids),sourceGroups=source_count,independentComponents=component_count,
        imageHashes=len(seen_images),scale2OffscreenStates=offscreen,mutationsRejected=mutations,
        manifestSha256=sha(TARGET),scope='225 finite resource projection; inherited original source display tree unchanged; no full-world assets or visual tolerance.')
    (OUT/'package-verification.json').write_bytes(encoded(report))
    print('225 package integrity passed:',len(ids),'states;',component_count,'independent components;',len(mutations),'mutations rejected')


if __name__ == '__main__':
    main()
