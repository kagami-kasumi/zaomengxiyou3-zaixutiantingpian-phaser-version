"""227 supplemental behavior handoff, preserving all 84 existing contracts.

This is a behavior evidence index, not a new visual ground-truth manifest.
Required future visual inputs remain explicitly incomplete.
"""
import hashlib
import json
import re
from run import OUT, ROOT, SRC, method
from verify import verify

trace_file = OUT/'source-trace.json'
trace = json.loads(trace_file.read_text(encoding='utf-8'))
count = verify(trace)
mutations = json.loads((OUT/'source-mutations.json').read_text(encoding='utf-8'))
assert mutations['normalTraceSha256'] == hashlib.sha256(trace_file.read_bytes()).hexdigest()
assert len(mutations['results']) == 10 and all(row['rejected'] for row in mutations['results'])
modern = json.loads((OUT/'modern-rejection.json').read_text(encoding='utf-8'))
assert modern['status'] == 'rejected' and len(modern['failures']) == modern['cases'] == 43
retained, static_sources = [], []
for task,family,size in [(207,'monkey',41),(209,'horse',43)]:
    path = f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family}-family.json'
    truth = json.loads((ROOT/path).read_text(encoding='utf-8'))
    assert truth['status'] == 'verified'
    assert len(truth['contractMatrix']) == size
    assert [entry['id'] for entry in truth['contractMatrix']] == truth['p1rAcceptance']['contractIds']
    for index,entry in enumerate(truth['contractMatrix']):
        retained.append(dict(family=family,id=entry['id'],sourceTruth=path,
                             pointer=f'/contractMatrix/{index}',evidenceStatus='retained-original-contract; modern-completion-not-revalidated',
                             requiredImplementationTask='TASK-SLICE-226'))
    for form in range(1,5):
        file = SRC/f'export/pet/Pet{family.title()}{form}.as'
        text = file.read_text(encoding='utf-8')
        names = re.findall(r'function (\w+)\(',text)
        for name in names:
            if not re.match(r'(doHit|releSkill|beforeSkill|normalHit|reduceHp|scriptFrameOverFunc|enterFrameFunc|isCannotMoveWhenAttackOnFloor|getRealPower|myIntelligence)',name):
                continue
            body = method(text,name)
            static_sources.append(dict(path=str(file.relative_to(ROOT)).replace('\\','/'),method=name,
                                       startLine=text[:text.index(body)].count('\n')+1,
                                       fileSha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                                       sliceSha256=hashlib.sha256(body.encode()).hexdigest(),
                                       classification='native-executed' if any(s['path'].endswith(f'Pet{family.title()}{form}.as') and s['method']==name for s in trace['sources']) else 'static-source-retained'))
required = {
    'monkey': ['PetMonkey1Bullet1','PetMonkey1Bullet2','PetMonkey2Bullet1','PetMonkey2Bullet2_1','PetMonkey2Bullet2_2','PetMonkey3Bullet1','PetMonkey3Bullet2','PetMonkey3Bullet3_1','PetMonkey3Bullet3_2'],
    'horse': ['PetHorse1Bullet1','PetHorse1Bullet2','PetHorse2Bullet1','PetHorse2Bullet2','PetHorse3Bullet1','PetHorse3Bullet2','PetHorse3Bullet3','PetHorse3Bullet4','PetHorse4Bullet5','PetHorse4Bullet5Explode','PetHorseIceEffect'],
}
result = dict(taskId='TASK-SETTINGS-227',status='behavior-supplement-verified; spatial-inputs-pending',
              scope=trace['scope'],runtime=trace['runtime'],sourceCaseCount=count,
              normalTraceSha256=mutations['normalTraceSha256'],sourceMutationCount=10,
              modernRejectedCaseCount=43,retainedContracts=retained,
              executedSources=trace['sources'],staticMethodInventory=static_sources,
              targetAcquisition='First distance-qualified input, including dead; subsequent AI clears dead without same-tick reacquisition',
              pendingSpatialInputs=required,
              followups={'monkey':'TASK-SETTINGS-228','horse':'TASK-SETTINGS-229','implementation':'TASK-SLICE-226'})
(OUT/'behavior-contract.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('227 handoff: native cases',count,'retained contracts',len(retained),'static methods',len(static_sources),'spatial inputs pending',sum(map(len,required.values())))
