"""Exercise exact exception matching against actual archived candidate pixels."""
import copy
import numpy as np
from PIL import Image
from exceptions import approved, matches
from run import ROOT, OUT, sha
from verify_pixels import load, compose, image
from pack import encoded


def main():
    rows=approved();identity=next(iter(rows));entry=rows[identity]
    source=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')
    ref=next(r for r in source['rows'] if r['id']+'-'+str(r['tick'])==identity)
    row=next(r for r in load(OUT/'dynamic-resources.json.gz')['rows'] if r['id']==identity)
    expected=image(ROOT/ref['capture']);actual=compose(row,ROOT);digest=ref['captureSha256']
    assert matches(identity,digest,expected,actual,rows)
    changes={}
    def reject(name,ident=identity,baseline=digest,a=expected,b=actual,allowed=rows):
        assert not matches(ident,baseline,a,b,allowed),name
        changes[name]=True
    reject('unlisted-state',ident=identity+'-wrong')
    reject('baseline-changed',baseline='0'*64)
    pixel=entry['pixels'][0];x,y=pixel['x'],pixel['y']
    for channel in range(4):
        b=np.array(actual);b[y,x,channel]=(int(b[y,x,channel])+1)%256
        reject('candidate-channel-'+str(channel),b=Image.fromarray(b))
    b=np.array(actual);b[0,0,0]=(int(b[0,0,0])+1)%256
    reject('additional-coordinate',b=Image.fromarray(b))
    moved=copy.deepcopy(rows);moved[identity]['pixels'][0]['x']+=1
    reject('shifted-approved-coordinate',allowed=moved)
    missing=copy.deepcopy(rows);missing[identity]['pixels'].pop()
    reject('missing-approved-tuple',allowed=missing)
    a=np.array(expected);a[y,x,0]=(int(a[y,x,0])+1)%256
    reject('original-rgba-changed',a=Image.fromarray(a))
    inputs=[OUT/'visual-exception-approval.json',OUT/'diagnostics/exact-unresolved-pixels.json',OUT/'dynamic-resources.json.gz',ROOT/'tools/turtle-projection/exceptions.py',ROOT/'tools/turtle-projection/verify_exceptions.py']
    (OUT/'exception-mutations.json').write_bytes(encoded(dict(status='passed',mutationsRejected=changes,inputSha256={p.relative_to(ROOT).as_posix():sha(p) for p in inputs})))
    print('Exact exception verifier:',len(changes),'mutations rejected')


if __name__=='__main__':main()
