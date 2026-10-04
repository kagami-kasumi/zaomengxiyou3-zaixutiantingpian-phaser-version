"""Compile mutated copies only; never write the original corpus."""
import json
import capture
from verify import verify
base=capture.WORK
results=[]
for mutation in ['hold-decrement','phoenix-guard','hurt-end','death-resume','protection-expiry','repeat-reset','frame-count']:
 capture.WORK=base.parent/('clock-'+mutation)
 capture.records.clear()
 capture.run(mutation) # A compile/runtime failure is not a behavioral rejection.
 try:
  verify(capture.WORK)
 except AssertionError as error:
  results.append(dict(mutation=mutation,rejected=True,reason=str(error)))
 else:
  raise AssertionError('Undetected mutation: '+mutation)
capture.WORK=base
verify(base)
(base/'mutations.json').write_text(json.dumps(dict(status='passed',results=results,scope='bounded source clock only'),indent=2)+'\n',encoding='utf-8')
print('Seven compiled source mutants rejected by independent behavior assertions; positive capture remains intact.')
