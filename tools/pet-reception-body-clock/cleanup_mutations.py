import json
import cleanup
from verify_cleanup import verify
base=cleanup.WORK
results=[]
for mutation in ['source-retained','bullets-retained','body-retained','protection-retained']:
 cleanup.WORK=base.parent/('cleanup-'+mutation);cleanup.capture.records.clear()
 cleanup.run(mutation)
 try:verify(cleanup.WORK)
 except AssertionError as error:results.append(dict(mutation=mutation,rejected=True,reason=str(error)))
 else:raise AssertionError('Undetected cleanup mutant: '+mutation)
verify(base)
(base/'mutations.json').write_text(json.dumps(dict(status='passed',results=results),indent=2)+'\n',encoding='utf-8')
print('Four source teardown mutants compiled and ran, then failed owner/reference assertions.')
