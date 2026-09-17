"""Describe finite native compositing groups; inherit original display truth by hash."""
import hashlib
import json
import sys
from datetime import datetime, timezone
import jsonschema
from run import ROOT, OUT, sha
from verify_pixels import load
from pack import MODES, encoded

TARGET = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-225-turtle-resource-projection.json'
PARENT = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'


def chosen(group):
    return group.get('canonical', group['primary'].get('canonical', group['primary']))


def state_id(mode, row):
    if mode == 'body':
        return 'body:' + row['id']
    if mode == 'effects':
        m = row['meta']
        return f"effect:{m['symbol']}:{m['tick']}:s{m['scale']}:d{m['sign']}"
    fixture, tick = row['id'].rsplit('-', 1)
    return mode + ':' + fixture + ':' + tick


def build():
    parent = load(PARENT)
    assert parent['status'] == 'verified'
    expected = load(ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A/expected-visual-states.json')['expectedStateIds']
    provenance = [dict(id='original-display-truth', sourceType='runtime-capture', sourcePath=PARENT.relative_to(ROOT).as_posix(),
                       sha256=sha(PARENT), locator='Complete original 13-symbol display list; inherited without replacement. Projection objects below are native compositing groups only.')]
    objects, counts, links = {}, {}, []
    for mode in MODES:
        path = OUT / (mode + '-resources.json.gz')
        data = load(path)
        provenance.append(dict(id=mode, sourceType='runtime-capture', sourcePath=path.relative_to(ROOT).as_posix(), sha256=sha(path),
                               locator='Independent native groups plus unfiltered body/owner-buff component observations; source corpus and original paths retained.'))
        for index, row in enumerate(data['rows']):
            assert all('nativeResponse' not in owner for owner in row.get('groups',[row])), 'Incomplete transfer experiment cannot enter the resource manifest'
            sid = state_id(mode, row)
            counts[sid] = 0
            units=[(owner,part) for owner in row.get('groups',[row]) for part in ([owner] if 'nativeResponse' in owner else owner.get('paintParts',[owner]))]
            for depth,(owner,group) in enumerate(units):
                layer = chosen(group)
                source_path = group.get('path', 'root')
                key = [mode, source_path, depth, group.get('type'), layer['sha256'],group.get('nativeResponse',{}).get('key')]
                oid = 'projection-' + hashlib.sha256(encoded(key)).hexdigest()[:24]
                if oid not in objects:
                    objects[oid] = dict(id=oid, parentId=None, depth=depth, objectType='bitmap',
                        sourceIdentity=dict(provenanceId=mode, characterId=None, symbolClass=group.get('type'), instanceName=source_path),
                        render=dict(assetRef=layer['path'], blendMode='normal', filters=[], maskId=None), placements=[])
                origin = layer['origin']
                bounds = dict(left=0, top=0, width=layer['width'], height=layer['height'])
                placement = dict(stateId=sid, visible=not layer['empty'],
                    localMatrix=dict(a=1,b=0,c=0,d=1,tx=origin['x'],ty=origin['y']),
                    registrationPoint=dict(x=-origin['x'],y=-origin['y']), localBounds=bounds,
                    stageBounds=dict(bounds,left=origin['x'],top=origin['y']), alpha=1,
                    derivation='observed', derivationMethod='Native source group already includes source transforms, alpha, masks and filters. Do not apply them twice. Crop origin restores exact fixture stage placement; source registration remains in inherited display truth.',
                    evidenceRefs=[mode+'#/rows/'+str(index), 'original-display-truth#state='+sid+';path='+source_path])
                objects[oid]['placements'].append(placement)
                counts[sid] += int(not layer['empty'])
                links.append(dict(stateId=sid, objectId=oid, sourcePath=source_path, ownerPath=owner.get('path','root'), resourceRow=index, corpus=mode,nativeResponse=group.get('nativeResponse')))
    assert sorted(counts) == sorted(expected)
    stamp = load(TARGET)['generatedBy']['generatedAt'] if TARGET.exists() else datetime.now(timezone.utc).isoformat()
    result = dict(schemaVersion=1, truthId='task-settings-225.turtle-resource-projection', status='draft',
        scope=dict(taskId='TASK-SETTINGS-225',surfaceId='turtle-13-symbol-native-resource-projection',originalVersion=parent['scope']['originalVersion'],
            description='Finite 11572 source states. Native paint commands bound to independently movable source owners, never full-fixture screenshots. Do not flatten unfiltered paint siblings before blending; preserve source filter/clipDepth boundaries. Complete original display list, masks, filters, clocks and registration are inherited by immutable original-display-truth reference. Raw body/buff components are retained separately; parent-filtered groups are bound to the exact original child tuple. No new behavior truth. Exact user-approved visual exception is bound in projection-links.json; other differences are forbidden.'),
        generatedBy=dict(tool='tools/turtle-projection/manifest.py',toolVersion='1',command='python tools/turtle-projection/manifest.py',generatedAt=stamp),
        provenance=provenance, stage=parent['stage'], states=parent['states'], baselines=parent['baselines'], displayObjects=list(objects.values()),
        completeness=dict(expectedStateIds=expected,extractedStateIds=sorted(counts),expectedVisibleObjectCountByState=counts,displayListMatched=False,stateSetMatched=True,
            unresolved=[dict(id='acceptance',description='Independent projection/source integrity, full pixel checks and mutations pending.',impact='validation',nextEvidence='225 acceptance report')]))
    return result, dict(originalDisplayTruthSha256=sha(PARENT), links=links,
                        composition='Recover P=(C*A+255)//256; accumulate P,A using S+D*(256-SA)//256; output min(255,P*256//max(A,1)), in original paint depth order. Subject to full finite validation and the separately approved exact 28-state/308-pixel exception; not universal Flash compositing equivalence. Transfer response experiments are excluded.',
                        modernVisualExceptions=[dict(approvalPath=(OUT/'visual-exception-approval.json').relative_to(ROOT).as_posix(),approvalSha256=sha(OUT/'visual-exception-approval.json'),states=28,pixels=308)])


def main():
    result, links = build()
    if '--verified' in sys.argv:
        from accept import validate_reports
        validate_reports()
        accepted = load(OUT / 'acceptance.json')
        assert accepted['status'] == 'accepted'
        assert accepted['draftManifestSha256']==accepted['repeatedGenerationSha256']==sha(TARGET), 'Draft changed after acceptance'
        for path, digest in accepted['inputs'].items():
            assert sha(ROOT / path) == digest, path
        result['status'] = 'verified'
        result['completeness'].update(displayListMatched=True, unresolved=[])
    schema = load(ROOT / 'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json')
    jsonschema.Draft202012Validator(schema).validate(result)
    TARGET.write_bytes(encoded(result))
    (OUT / 'projection-links.json').write_bytes(encoded(links))
    if '--verified' in sys.argv:
        (OUT/'promotion.json').write_bytes(encoded(dict(status='verified',draftManifestSha256=accepted['draftManifestSha256'],
            verifiedManifestSha256=sha(TARGET),acceptanceSha256=sha(OUT/'acceptance.json'),states=len(result['states']))))
    print('225', result['status'], len(result['states']), 'states;', len(result['displayObjects']), 'projection objects; Schema passed')


if __name__ == '__main__':
    main()
