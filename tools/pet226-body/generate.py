"""Project verified source body rows and callback selectors into runtime data."""
import hashlib
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'src/assets/pet-monkey-horse-body.json'


def read(path):return json.loads(path.read_text(encoding='utf-8'))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def generate():
    result={}
    for family,task in [('monkey',228),('horse',229)]:
        manifest=ROOT/f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family}-collision-phase.json'
        truth=read(manifest);assert truth['status']=='verified'
        report=read(ROOT/f'docs/tasks/evidence/TASK-SETTINGS-{task}/callback-verification.json')
        path=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}/callback-air/measurement.json'
        assert report['status'].startswith('passed') and report['measurementSha256']==sha(path)
        callbacks=read(path)
        forms={}
        for form in truth['body']['forms']:
            assert sha(ROOT/form['sourcePath'])==form['sourceSha256']
            actions={}
            for action in form['actions']:
                name=action['action'];row=form['rows'][action['row']]
                sample=next(c for c in callbacks['cases'] if c['form']==form['form'] and c['action']==name and c['skills']==-1 and c['local'] and not c['hurt'] and not c['noTarget'])
                hits={}
                for tick in sample['rows']:
                    emitted=[e for e in tick['events'] if e['kind']=='emit']
                    if emitted:
                        key=(tick['before']['column'],tick['before']['count'])
                        hits[key]=dict(column=key[0],remaining=key[1])
                loops=name in ('wait','walk')
                actions[name]=dict(row=row['row'],holds=[c['holdTicks'] for c in row['cells']],keyFrameCount=row['keyFrameCount'],loops=loops,hits=list(hits.values()))
                if not loops:
                    actions[name]['completionEvent']='dead-complete' if name=='dead' else 'complete'
                    if name!='dead':actions[name]['completionAction']='wait'
                    actions[name]['completionStatic']=name=='hurt'
            forms[str(form['form'])]=dict(actions=actions,sourceSha256=form['sourceSha256'])
        result[family]=forms
    return result


if __name__=='__main__':
    text=json.dumps(generate(),indent=2)+'\n'
    if '--check' in sys.argv:assert DEST.read_text()==text,'Stale source body projection'
    else:DEST.write_text(text)
    print('226 runtime body data: eight source forms, exact row/count/callback selectors')
