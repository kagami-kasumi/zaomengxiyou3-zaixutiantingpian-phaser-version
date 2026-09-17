"""Promote only complete finite source-resource evidence, never a status-only stub."""
import shutil
import gzip
import subprocess
from run import ROOT, OUT, sha
from pack import MODES, encoded
from verify_pixels import load
from manifest import TARGET, PARENT

COUNTS=dict(body=372,effects=2440,dynamic=5856,buff=2904)


def validate_reports(package_name='package-verification-draft.json'):
    names=[]
    for mode,count in COUNTS.items():
        name=mode+'-archived-pixels.json';r=load(OUT/name);names.append(name)
        assert r['status']=='passed' and r['states']==count
        assert not r['extentFailures'] and not r['unapprovedDifferences']
        if mode=='dynamic':
            assert r['differentStates']==28 and r['differentPixels']==308 and len(r['visualExceptions'])==28
        else:
            assert r['differentStates']==r['differentPixels']==0 and not r['visualExceptions']
        assert r['sourceTraceUnchanged']
        for path,digest in r['inputSha256'].items():assert sha(ROOT/path)==digest,path
    p=load(OUT/package_name);names.append(package_name)
    assert p['status']=='passed' and p['stateCount']==11572 and len(p['mutationsRejected'])>=11 and all(p['mutationsRejected'].values())
    c=load(OUT/'components-verification.json');names.append('components-verification.json')
    assert c['status']=='passed' and c['sourceTraceUnchanged'] and not c['differences']
    for mode,digest in c['nativeRuns'].items():assert sha(OUT/(mode+'-components-run.json'))==digest
    expected=set()
    for mode in ('dynamic','buff'):
        for row in load(ROOT/('docs/tasks/evidence/TASK-SETTINGS-222A/'+mode+'-native.json.gz'))['rows']:
            for depth,node in enumerate(row['display']['children']):
                if 'PetTurtle' in node['type'] or 'BaseHero' in node['type']:
                    expected.add((mode,row['id']+'-'+str(row['tick']),'root/'+str(depth)))
    actual={(r['mode'],r['id'],r['parentPath']) for r in c['results']}
    assert actual==expected and len(c['results'])==c['groups']==len(expected)
    assert all(r['passed'] and r['differentPixels']==0 for r in c['results'])
    contracts=load(OUT/'component-contracts.json.gz')
    assert {(r['corpus'],r['id'],r['parentPath']) for r in contracts}==expected
    assert all(r['componentParentFiltersApplied'] is False for r in contracts)
    color=load(OUT/'color-arithmetic.json');names.append('color-arithmetic.json')
    assert color['status']=='passed' and len(color['results'])==5
    assert all(r['singleLayerFailures']==r['differentPixels']==0 and r['pillowMutationDifferentPixels']>0 for r in color['results'])
    for path,digest in color['inputs'].items():assert sha(ROOT/path)==digest
    assert color['sourceRunSha256']==sha(OUT/'dynamic-colors-run.json')
    paint=load(OUT/'paint-boundaries.json');names.append('paint-boundaries.json')
    assert paint['sourceTraceUnchanged'] and paint['parts']>0
    provenance=load(OUT/'provenance.json');names.append('provenance.json')
    assert provenance['status']=='passed' and provenance['environment']==dict(quality='HIGH',runtime='WIN 51,1,1,5',height=590,frameRate=24,width=940)
    assert provenance['archiveSha256']==sha(OUT/'native-probes.json.gz')
    for run in provenance['runs']:assert run['runSha256']==sha(OUT/(run['label']+'-run.json'))
    stages=load(OUT/'effects-replay-stages.json');names.append('effects-replay-stages.json')
    assert stages['status']=='passed' and stages['states']==2440 and stages['sourceTraceUnchanged']
    for path,digest in stages['inputSha256'].items():assert sha(ROOT/path)==digest
    mutations=load(OUT/'exception-mutations.json');names.append('exception-mutations.json')
    assert mutations['status']=='passed' and len(mutations['mutationsRejected'])>=10 and all(mutations['mutationsRejected'].values())
    for path,digest in mutations['inputSha256'].items():assert sha(ROOT/path)==digest
    repeat=load(OUT/'archive-repeat.json');names.append('archive-repeat.json')
    assert repeat['status']=='passed'
    for path,digest in repeat['inputSha256'].items():assert sha(ROOT/path)==digest
    names.extend(['visual-exception-approval.json','diagnostics/exact-unresolved-pixels.json','effects-replay.json','verification-environment.json'])
    return names


def main():
    assert load(TARGET)['status']=='draft'
    assert load(OUT/'package-verification.json')['manifestSha256']==sha(TARGET)
    shutil.copyfile(OUT/'package-verification.json',OUT/'package-verification-draft.json')
    names=validate_reports()
    before=sha(TARGET)
    subprocess.run(['python','tools/turtle-projection/manifest.py'],cwd=ROOT,check=True,timeout=300)
    assert sha(TARGET)==before,'Repeated normalization changed bytes'
    inherited=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
    assert len(load(inherited/'contract-visual-consumer-matrix.json')['contracts'])==32
    assert sum(len(s['symbols']) for s in load(inherited/'source-definitions.json')['sources'])==13
    paths=[OUT/name for name in names]+[OUT/(mode+'-resources.json.gz') for mode in MODES]
    paths += [OUT/'component-contracts.json.gz',OUT/'component-native.json.gz',OUT/'native-probes.json.gz',OUT/'projection-links.json',PARENT,
              inherited/'expected-visual-states.json',inherited/'contract-visual-consumer-matrix.json',inherited/'source-definitions.json']
    paths += list((ROOT/'tools/turtle-projection').glob('*.py'))+list((ROOT/'tools/turtle-projection').glob('*.as'))
    paths += [TARGET,OUT/'package-verification.json',ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json']
    draft_snapshot=OUT/'accepted-draft.json.gz'
    draft_snapshot.write_bytes(gzip.compress(TARGET.read_bytes(),mtime=0));paths.append(draft_snapshot)
    report=dict(status='accepted',states=11572,symbols=13,contracts=32,draftManifestSha256=before,repeatedGenerationSha256=sha(TARGET),
        inputs={p.relative_to(ROOT).as_posix():sha(p) for p in paths},requiredReports=names,
        modernVisualExceptions=[dict(approval='visual-exception-approval.json',states=28,pixels=308,matching='exact state, coordinate, original/candidate RGBA')],scope='Finite native resource projection only; no modern runtime, gameplay, collision or family-completion claim.')
    (OUT/'acceptance.json').write_bytes(encoded(report))
    print('225 accepted:11572 states,13 symbols,32 inherited contracts; repeated normalization/archive identical')


if __name__=='__main__':main()
