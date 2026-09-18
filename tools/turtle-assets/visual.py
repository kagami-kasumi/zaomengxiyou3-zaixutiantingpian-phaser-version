"""Project verified native owner/paint units into portable production resources."""
import hashlib
from common import ROOT, EVIDENCE, DEST, MODES, load, sha, write, chosen, state_id


def build(check=False):
    files, packages = {}, {}
    links_doc = load(EVIDENCE/'TASK-SETTINGS-225/projection-links.json')
    links = links_doc['links']
    by_state = {}
    for link in links:
        by_state.setdefault(link['stateId'], []).append(link)
    for mode in MODES:
        source = EVIDENCE/'TASK-SETTINGS-225'/f'{mode}-resources.json.gz'
        data = load(source)
        native = load(ROOT/data['sourceCorpus'])
        assert sha(ROOT/data['sourceCorpus']) == data['sourceCorpusSha256']
        if mode == 'body':
            refs = {r['id']: r for r in native['cells']}
        elif mode == 'effects':
            refs = {b['id']: dict(tree=r['tree'], root=b['root'], tick=r['tick'],
                                 symbol=r['symbol'], scale=b['scale'], sign=b['sign'])
                    for r in native['states'] for b in r['baselines']}
        else:
            refs = {r['id']+'-'+str(r['tick']): r for r in native['rows']}

        def unit(item):
            assert 'nativeResponse' not in item
            layer = chosen(item)
            path = ROOT/layer['path']
            digest = layer['sha256']
            if digest not in files:
                assert sha(path) == digest
                target = DEST/'images'/(digest+'.png')
                if check:
                    assert target.read_bytes() == path.read_bytes()
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(path.read_bytes())
                files[digest] = dict(path='/'+target.relative_to(ROOT/'public').as_posix(),
                                     sha256=digest, width=layer['width'], height=layer['height'],
                                     source=layer['path'])
            return dict(image=digest, origin=layer['origin'], empty=layer['empty'],
                        sourcePath=item.get('path', 'root'), type=item.get('type'),
                        width=layer['width'], height=layer['height'],
                        sourceCapture=dict(path=layer['path'],sha256=layer['sha256'],
                            primary=item['primary'],expanded=item['expanded']))

        rows = []
        for row in data['rows']:
            groups = []
            for owner in row.get('groups', [row]):
                groups.append(dict(ownerPath=owner.get('path', 'root'),
                    depth=owner.get('depth', 0), type=owner.get('type'),
                    paintParts=[unit(part) for part in owner.get('paintParts', [owner])],
                    components=[unit(part) for part in owner.get('components', [])]))
            trace = {k:v for k,v in refs[row['id']].items()
                     if k not in ('capture','captureSha256','originalCapturePath','file','sha256')}
            timing = dict(fixtureId=trace.get('id',row['id']),hostTick=trace.get('tick'),
                          phase=native.get('phase'),action=trace.get('action'),
                          direct=trace.get('direct'),row=trace.get('row'),column=trace.get('column'),
                          count=trace.get('count'),events=trace.get('events',[]))
            rows.append(dict(id=state_id(mode,row), nativeId=row['id'], groups=groups,timing=timing,
                             projectionLinks=by_state[state_id(mode,row)],
                             meta=row.get('meta', {}), sourceTrace=trace))
        package = dict(version=1, mode=mode, sourceSha256=sha(source), states=rows,
                       clocks=native.get('clocks', []), stage=dict(width=940,height=590,fps=24))
        packages[mode] = write(DEST/(mode+'.json.gz'),package,check)
        packages[mode]['states'] = len(rows)
        print(mode, len(rows), 'states', flush=True)
    return files, packages
