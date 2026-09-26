"""Reject the current Runtime/resolver using separate original-source outputs."""
import json
from run import OUT, ROOT
from verify import verify

source = json.loads((OUT/'source-trace.json').read_text(encoding='utf-8'))
verify(source)
by_id = {row['id']:row for row in source['cases']}
modern = json.loads((ROOT/'docs/tasks/evidence/TASK-SLICE-226/preflight-counterexamples.json').read_text(encoding='utf-8'))
failures = []
for row in modern['rows']:
    expected = by_id['collision:false-false-false-false']['extra']['accepted']
    if bool(row['actualHits']) != expected:
        failures.append(dict(kind='collision',species=row['species'],form=row['form'],slot=row['slot'],expected=expected,actual=row['actualHits']))
for row in modern['skillRows']:
    eligible = by_id[f"monkey{row['form']}:gates-0-1000-false"]['extra']['gates']
    if not any(eligible) and row['failedSkills']:
        failures.append(dict(kind='unlearned-priority',form=row['form'],expectedFailedSkills=0,actualFailedSkills=row['failedSkills']))
for row in modern['phaseRows']:
    expected = by_id[f"{row['species']}{row['form']}:off-phase-acquire-{row['fps']}"]['extra']['normalTicks']
    if row['normalTicks'] != expected:
        failures.append(dict(kind='phase',species=row['species'],form=row['form'],fps=row['fps'],expected=expected,actual=row['normalTicks']))
result = dict(status='rejected' if failures else 'passed',cases=len(modern['rows'])+len(modern['skillRows'])+len(modern['phaseRows']),failures=failures,
              scope='Only collision acceptance, unlearned priority and off-phase acquisition; not full 226 acceptance')
(OUT/'modern-rejection.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('227 modern comparison:',result['status'],len(failures),'/',result['cases'])
raise SystemExit(1 if failures else 0)
