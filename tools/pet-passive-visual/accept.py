"""244 final bounded acceptance; no promotion on existence/Schema alone."""
import gzip
import hashlib
import json
import re
from datetime import datetime,timezone
from pathlib import Path
from prepare import ROOT,OUT,sha
from repeat_mutations import MUTATIONS,signatures
from verify_lifecycle import key


def main():
    native=OUT/'baseline-native.json.gz';data=json.loads(gzip.decompress(native.read_bytes()))
    source=json.loads((OUT/'source-definitions.json').read_text(encoding='utf-8'))
    assert source['status']=='extracted-not-promoted' and len(source['definitions'])==107
    assert not source['unresolvedCharacterIds'] and not source['missingBitmapDefinitions']
    assert sha(ROOT/source['sourcePath'])==source['sourceSha256']
    assert sha(ROOT/source['closurePath'])==source['closureSha256']
    for p in data['fixtures']['sources']:assert sha(Path(p['path']))==p['sha256']
    assert '51,1,1,5' in data['runtime'],data['runtime']
    for r in data['sources']:
        p=ROOT/r['path'];assert sha(p)==r['sha256'],p
        if r.get('sliceSha256'):
            lines=p.read_text(encoding='utf-8').splitlines(keepends=True)
            body=''.join(lines[r['startLine']-1:]);start=body.index(re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+r['method']+r'\(',body)[0]);pos=body.index('{',start)+1;depth=1
            while depth:depth+=(body[pos]=='{')-(body[pos]=='}');pos+=1
            assert hashlib.sha256(body[start:pos].encode()).hexdigest()==r['sliceSha256'],r['method']
    for p,digest in data['generatedHashes'].items():assert sha(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/air/baseline'/p)==digest,p
    assert data['runtimeDllSha256']==sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll')
    repeat=json.loads((OUT/'repeat.json').read_text(encoding='utf-8'));assert repeat['status']=='passed' and repeat['baselineSha256']==sha(native) and not repeat['different']
    first=signatures(data);variants=[]
    for mutation in MUTATIONS:
        path=OUT/(mutation+'-native.json.gz');changed=json.loads(gzip.decompress(path.read_bytes()));got=signatures(changed)
        differences=[k for k,v in got.items() if v!=first[k]];assert differences,mutation
        variants.append(dict(mutation=mutation,status='rejected',states=len(got),differences=len(differences),firstDifference=differences[0],sha256=sha(path)))
    (OUT/'source-mutations.json').write_text(json.dumps(dict(status='passed',variants=variants),indent=2)+'\n',encoding='utf-8')
    for name in ['lifecycle-verification.json','display-verification.json','display-mutations.json','source-repeat.json']:
        report=json.loads((OUT/name).read_text(encoding='utf-8'));assert report['status']=='passed',name
    life=json.loads((OUT/'lifecycle-verification.json').read_text(encoding='utf-8'));assert life['inputSha256']==sha(native)
    source_repeat=json.loads((OUT/'source-repeat.json').read_text(encoding='utf-8'));assert source_repeat['sha256']==sha(OUT/'source-definitions.json')
    for r in source['scriptAudit']['records']:
        p=ROOT/r['path'];assert sha(p)==r['sha256']
        if r['nontrivial']:
            code=p.read_text(encoding='utf-8');assert 'addFrameScript(99,this.frame100)' in code and '_loc1_["removeChild"](this)' in code and 'stop();' in code
            effect=r['symbol'].removeprefix('buff_');rows={x['tick']:x for x in data['rows'] if x['id']==effect+'-monkey1-p1-d0-cycle' and x['phase']=='exit-after-owner'}
            assert len(rows[99]['display']['children'][0]['children'])==1 and not rows[100]['display']['children'][0]['children']
            assert any(rows[100]['effects']),'timeline removal must precede numeric expiry'
    inputs=[native,*[OUT/n for n in ['source-definitions.json','repeat.json','source-repeat.json','lifecycle-verification.json','display-verification.json','display-mutations.json','source-mutations.json']]]
    inputs+=list((ROOT/'tools/pet-passive-visual').glob('*.py'))+list((ROOT/'tools/pet-passive-visual').glob('*.as'))+[ROOT/'tools/turtle-visual/NativeTree.as',ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json']
    stamp=json.loads((OUT/'acceptance.json').read_text(encoding='utf-8')).get('generatedAt') if (OUT/'acceptance.json').exists() else None
    result=dict(generatedAt=stamp or datetime.now(timezone.utc).isoformat(),status='accepted',taskId='TASK-SETTINGS-244',states=len(data['rows']),fixtures=len(data['fixtures']['cases']),sourceDefinitions=107,compiledVariants=7,fieldMutations=10,inputSha256={p.relative_to(ROOT).as_posix():sha(p) for p in inputs},probeSwfSha256=sha(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/air/baseline/Probe.swf'),scriptResolution='Both nontrivial original ABC frame100 scripts execute from full unmodified pet1; frame99 present/frame100 absent while numeric effect remains. No stripped closure playback used as final native expected.',unknown=[],boundary=data['fixtures']['boundary'])
    (OUT/'acceptance.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('accepted',result['fixtures'],result['states'],'7 compiled/probe + 10 field mutations')

if __name__=='__main__':main()
