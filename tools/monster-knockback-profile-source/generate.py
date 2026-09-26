"""Publish 237 only after independent source/profile/mutation verification."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import jsonschema
from verify import ROOT, OUT, verify, digest, MUTATIONS
import capture

DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-237-monster-knockback-profiles.json'
SCHEMA=ROOT/'docs/reverse-engineering/ground-truth/schema/monster-knockback-profile.schema.json'

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    report=json.loads((OUT/'native.json').read_text(encoding='utf-8'))
    evidence=json.loads((OUT/'verification.json').read_text(encoding='utf-8'))
    counts=verify(report)
    assert evidence['status']=='passed' and evidence['counts']==counts
    assert evidence['inputSources']==report['sources'] and evidence['inputMethods']==report['methods']
    observation=digest([report['profiles'],report['motion'],report['environmentInputs'],report['environmentMotion']]);assert evidence['observationSha256']==observation
    assert [row['name'] for row in evidence['sourceMutations']]==MUTATIONS
    for row in evidence['sourceMutations']:
        assert row['changedTrajectories']>0
        assert sha(OUT/('mutation-'+row['name']+'.json'))==row['sha256']
    for row in report['sources']:assert sha(ROOT/row['path'])==row['sha256']
    for row in report['methods']:assert sha(ROOT/row['path'])==row['fileSha256']
    # Re-materialize the normal fixture without running AIR. Script drift that
    # changes compiled AS3 must invalidate publishing an older native report.
    capture.prepare(None)
    assert report['generatedHashes']=={p.relative_to(capture.WORK).as_posix():sha(p) for p in capture.WORK.rglob('*.as')}
    references=[]
    for path,role in [
        ('docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json','Formal five-level wall geometry; retain collision order and class/marker properties from 217. No new full-level runtime claim.'),
        ('docs/tasks/evidence/TASK-SETTINGS-217/environment-properties.json','217 wall order, static-axis-aligned and class/marker bindings'),
        ('docs/reverse-engineering/ground-truth/manifests/task-settings-218-dragon1-target-collision.json','Original target symbol/registration provenance'),
        ('docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json','Actual constructor-scaled target bounds; fixed controlled wall positions derived from these bounds')]:
        data=json.loads((ROOT/path).read_text(encoding='utf-8'));assert data['status']=='verified'
        references.append(dict(path=path,sha256=sha(ROOT/path),role=role))
    retained='docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-230-monster-knockback.json'
    prior=json.loads((ROOT/retained).read_text(encoding='utf-8'));assert prior['status']=='verified' and not prior['unresolved']
    fixture_paths=[p.relative_to(ROOT).as_posix() for p in Path(__file__).parent.glob('*') if p.suffix in ['.py','.as']]+['tools/monster-knockback-source/capture.py','tools/monkey-horse-source/run.py']
    value=dict(schemaVersion=1,truthId='task-settings-237.monster-knockback-profiles',status='verified',
        scope='Twelve actual derived constructors and movement predicates, eight constructor contexts, fixed-action source steps; no modern acceptance or full source scene claim.',
        generatedBy='python tools/monster-knockback-profile-source/capture.py -> verify.py --mutations -> generate.py',
        sources=report['sources'],methods=report['methods'],inputReferences=references,
        fixtureSources=[dict(path=p,sha256=sha(ROOT/p)) for p in sorted(fixture_paths)],
        counts=counts,observationSha256=observation,profiles=report['profiles'],
        motion=[row for row in report['motion'] if row['owner']==1 and not row['boss']],
        environmentInputs=report['environmentInputs'],environmentMotion=report['environmentMotion'],
        stateColumns=['x','y','vx','vy','standing','head','wallLeft','wallRight','action'],
        units='Point velocity: source pixels per host step; Sprite assignments: native twips. Tween time: seconds, sampled min((tick-1)/fps,0.4) before step. World translation=(-100,0).',
        retainedContract=dict(truthId=prior['truthId'],path=retained,sha256=sha(ROOT/retained),pointers=['/entryAndScheduler','/naturalTweenOutcome','/directionObservations','/motion']),
        equivalence='Full raw 7560 groups verified identical across owner=1/2 and boss=false/true; publish 1890 representatives. Actual constructor boss flags remain in profiles; forced flags are controlled equivalence inputs.',
        exclusions=report['substitutions']+['Sloped/moving walls and monsters outside the twelve current consumers',
            'Actual body animation/recovery duration, lethal lifecycle and reward attribution remain 231/232',
            'Controllable recover/unfreeze at tick5 is fixture input, not source recovery-duration truth',
            'Formal wall arrays replay exact 217 getBounds inputs/class/markers/order, not full-level source SWF or modern scene playback'],unresolved=[])
    value['$schema']='../../schema/monster-knockback-profile.schema.json'
    validator=jsonschema.Draft202012Validator(json.loads(SCHEMA.read_text(encoding='utf-8')));validator.validate(value)
    # Ensure this new schema rejects malformed critical payloads, not just the positive fixture.
    negatives=[]
    for name,change in [
        ('missing-gravity',lambda v:v['profiles'][0]['profile'].pop('gravity')),
        ('gravity-string',lambda v:v['profiles'][0]['profile'].__setitem__('gravity','0')),
        ('state-speed-type',lambda v:v['motion'][0]['states'][0].__setitem__(2,'12')),
        ('state-short',lambda v:v['motion'][0]['states'][0].pop()),
        ('wrong-owner',lambda v:v['motion'][0].__setitem__('owner',2)),
        ('missing-profile',lambda v:v['profiles'].pop()),
        ('missing-trajectory',lambda v:v['motion'].pop()),
        ('unresolved',lambda v:v['unresolved'].append('unknown'))]:
        bad=copy.deepcopy(value);change(bad)
        assert not validator.is_valid(bad),name
        negatives.append(name)
    text=json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n'
    if '--check' in sys.argv:assert DEST.read_text(encoding='utf-8')==text
    else:DEST.parent.mkdir(parents=True,exist_ok=True);DEST.write_text(text,encoding='utf-8')
    (OUT/'publication.json').write_text(json.dumps(dict(status='passed',bytes=len(text.encode()),sha256=sha(DEST),schemaNegativeCases=negatives),indent=2)+'\n')
    print('237 publication:',len(value['profiles']),'profiles',len(value['motion']),'trajectories',len(text.encode()),'bytes;',len(negatives),'schema negatives rejected')

if __name__=='__main__':main()
