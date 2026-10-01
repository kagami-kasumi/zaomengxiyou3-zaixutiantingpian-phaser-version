"""Repeat independent native capture; exercise seven actual compiled/probe variants."""
import gzip
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from prepare import OUT,ROOT,sha
from run import run
from verify_lifecycle import key

MUTATIONS=['wrong-direction','wrong-parent','wrong-registration','refresh-duplicate','destroy-residual','freeze','advance']

def canonical(v):
    if isinstance(v,dict):return {k:(None if k=='name' and isinstance(x,str) and x.startswith('instance') else canonical(x)) for k,x in v.items() if k!='capture'}
    if isinstance(v,list):return [canonical(x) for x in v]
    return v

def signatures(data):return {key(r):hashlib.sha256(json.dumps(canonical(r),sort_keys=True,separators=(',',':')).encode()).hexdigest() for r in data['rows']}

def source_repeat():
    p=OUT/'source-definitions.json';before=sha(p)
    result=subprocess.run([sys.executable,str(ROOT/'tools/pet-passive-visual/source.py')],capture_output=True,timeout=150)
    assert result.returncode==0,result.stderr.decode(errors='replace')
    assert sha(p)==before,'source repeat changed'
    (OUT/'source-repeat.json').write_text(json.dumps(dict(status='passed',sha256=before))+'\n',encoding='utf-8')

def main():
    source_repeat()
    p=OUT/'baseline-native.json.gz';initial=json.loads(gzip.decompress(p.read_bytes()))
    first=signatures(initial);source=initial['sources'];fixture=initial['fixtures'];generated=initial['generatedHashes'];del initial
    second=run();actual=signatures(second)
    assert source==second['sources'] and fixture==second['fixtures'] and generated==second['generatedHashes'],'source/fixture changed during repeat'
    diff=[k for k in first if first[k]!=actual.get(k)]
    (OUT/'repeat.json').write_text(json.dumps(dict(status='passed' if not diff else 'failed',states=len(first),different=diff,baselineSha256=sha(p),normalization='JSON key order and unnamed Flash instance IDs only; coordinates, frames, filters, colors, named nodes, crops and PNG bytes exact.'),indent=2)+'\n',encoding='utf-8')
    assert not diff,diff[:5]
    del second
    results=[]
    for mutation in MUTATIONS:
        changed=run(mutation);observed=signatures(changed)
        killed=[k for k,v in observed.items() if first[k]!=v]
        assert killed,mutation
        results.append(dict(mutation=mutation,status='rejected',observedStates=len(observed),differentStates=len(killed),firstDifferences=killed[:3],nativeSha256=sha(OUT/(mutation+'-native.json.gz'))))
        del changed
    (OUT/'source-mutations.json').write_text(json.dumps(dict(status='passed',variants=results,baselineSha256=sha(p)),indent=2)+'\n',encoding='utf-8')
    print('Repeat exact:',len(first),'states; native mutations:',len(results),'rejected')

if __name__=='__main__':
    source_repeat() if '--source-repeat-only' in sys.argv else main()
