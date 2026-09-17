"""Prove the user approval is an exact residual whitelist, never a tolerance."""
import copy
import json
from run import OUT,sha,save,ROOT
from verify import approved_residual

allowed=json.loads((OUT/'residual-cases.json').read_text(encoding='utf-8'))['cases']
assert approved_residual(allowed,[])
mutants={}
mutants['missing-case']=allowed[:-1]
mutants['extra-case']=allowed+[copy.deepcopy(allowed[0])]
for name in ['coordinate','polarity','owner','intersection','source-draw']:
    data=copy.deepcopy(allowed)
    if name=='coordinate':data[0]['points'][0]['x']+=1
    elif name=='polarity':data[0]['points'][0]['original']=not data[0]['points'][0]['original']
    elif name=='owner':data[0]['id']+='-other-owner'
    elif name=='intersection':data[0]['intersection']['x']+=.05
    else:data[0]['sourceDraw']['x']+=.05
    mutants[name]=data
results={name:not approved_residual(data,[]) for name,data in mutants.items()}
results['boolean-mismatch']=not approved_residual(allowed,['additional-hit'])
assert all(results.values()),results
save(OUT/'approval-mutations.json',dict(status='passed',mutations=results,
    verifierSha256=sha(ROOT/'tools/turtle-collision/verify.py'),
    approvalSha256=sha(OUT/'sampling-approval.json')))
print('Exact approval whitelist:',len(results),'mutations rejected')
