"""Mutate copied original frame methods; require native capture then pixel rejection."""
import json
import visual
from verify_visual import verify
base=visual.WORK
results=[]
for mutation in ['origin','direction','row']:
 visual.WORK=base.parent/('visual-'+mutation)
 visual.capture.records.clear()
 visual.run(mutation)
 try:
  verify(visual.WORK)
 except AssertionError as error:
  results.append(dict(mutation=mutation,rejected=True,reason=str(error)))
 else:
  raise AssertionError('Undetected native visual mutant: '+mutation)
verify(base)
(base/'mutations.json').write_text(json.dumps(dict(status='passed',scope='native frame origin/direction/row; not owner priority or modern renderer',results=results),indent=2)+'\n',encoding='utf-8')
print('Three native visual mutants compiled and ran, then failed independent pixel/geometry comparison.')
