"""Independent finite contract checks. No source algorithms are imported here."""
import hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-232'
NAMES=['natural','lethal-first','nonlethal-first','hurt-after','dead-after','destroy-after','frozen-before','thaw','freeze-first','pause-after','redraw','low-level-pause','dead-before','destroy-before','hurt-cut']
MUTATIONS=['effects-first','display-only','death-clears','repeat-spawn','destroy-keeps','same-tick-hit']
def load(name):return json.loads((OUT/name).read_text(encoding='utf-8'))
def verify(report):
 assert report['runtime']=='AIR 51.1.1.5'
 work=Path(report['commands'][1][-1])
 assert hashlib.sha256((work/'Probe.swf').read_bytes()).hexdigest()==report['swfSha256']
 for name,digest in report['generatedHashes'].items():assert hashlib.sha256((work/name).read_bytes()).hexdigest()==digest
 assert hashlib.sha256((ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf').read_bytes()).hexdigest()==report['restoredSwfSha256']
 rows=report['rows'];assert {(r['fps'],r['scenario']) for r in rows}=={(f,n) for f in [20,24,30] for n in NAMES} and len(rows)==45
 for r in rows:
  n=r['scenario'];ss=r['states'];assert len(ss)==18 and [s['tick'] for s in ss]==list(range(1,19))
  birth=None if n in ['frozen-before','dead-before','destroy-before'] else (3 if n=='thaw' else 1)
  first=None if birth is None or n=='destroy-after' else birth+1
  end=2 if n in ['destroy-after','hurt-cut'] else (13 if n in ['pause-after','low-level-pause'] else (12 if n=='thaw' else 10))
  for s in ss:
   t=s['tick'];created=int(birth is not None and t>=birth);assert s['created']==created,(n,t,'created',s)
   assert s['hits']==int(first is not None and t>=first),(n,t,'hits',s)
   assert len(s['bullets'])==created,(n,t,'independent enrollment',s)
   if created:
    b=s['bullets'][0];assert b['uid']==1 and b['x']==(302 if n=='thaw' else 300) and b['y']==200,(n,t,'birth/source move',b)
    assert b['ready']==(t>=end),(n,t,'end',b)
    assert s['enrolled']==int(t<end),(n,t,'world cleanup',s)
   if n=='lethal-first':assert s['hp']==0 and s['action']=='dead' and s['ready']==(t>=15)
   if n=='nonlethal-first':assert s['hp']==99
   if n=='dead-after' and t>=2:assert s['hp']==0 and s['ready']==(t>=15)
   if n=='dead-before':assert s['ready']==(t>=14)
   if n=='destroy-before':assert s['ready']
   if n=='destroy-after':assert s['ready']==(t>=2)
   if n in ['frozen-before','freeze-first']:assert s['frozen']
   if n=='thaw':assert s['frozen']==(t==1)
  if first is not None:
   h=r['hits'];assert len(h)==1 and h[0]['tick']==first
   assert h[0]['sourceDead']==(n in ['lethal-first','dead-after'])
  else:assert r['hits']==[]
  if n=='pause-after':assert all(ss[i]['hold']==ss[1]['hold'] for i in [2,3,4])
  if n=='low-level-pause':assert ss[4]['hold']<ss[1]['hold']
 return len(rows)*18

def main():
 base=load('source-baseline.json');count=verify(base)
 for record in base['sources']:
  assert hashlib.sha256((ROOT/record['path']).read_bytes()).hexdigest()==record['sha256']
 rejected=[]
 if '--mutations' in sys.argv:
  for name in MUTATIONS:
   if '--existing' not in sys.argv:
    p=subprocess.run([sys.executable,str(Path(__file__).with_name('capture.py')),name],cwd=ROOT,capture_output=True,timeout=60);assert p.returncode==0,p.stdout+p.stderr
   report=load('source-'+name+'.json')
   assert report['rows']!=base['rows'],name
   try:verify(report)
   except AssertionError:rejected.append(name)
   else:raise AssertionError('mutant accepted: '+name)
  # Corruption checks do not count as source mutations.
  import copy
  for name in ['missing-case','missing-tick','birth-coordinate','hit-time']:
   bad=copy.deepcopy(base)
   if name=='missing-case':bad['rows'].pop()
   if name=='missing-tick':bad['rows'][0]['states'].pop()
   if name=='birth-coordinate':bad['rows'][0]['states'][0]['bullets'][0]['x']+=1
   if name=='hit-time':bad['rows'][0]['hits'][0]['tick']+=1
   try:verify(bad)
   except AssertionError:pass
   else:raise AssertionError('corruption accepted: '+name)
  summary=dict(status='passed-bounded-source-contract',cases=45,states=count,sourceMutationsRejected=rejected,reportCorruptionsRejected=4,limitations=base['limitations'])
  (OUT/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  contract=dict(schemaVersion=1,contractId='task-settings-232.monster-body-attack-lifecycle',status='verified-bounded-behavior',scope='Monster30 body/independent attack/target effect/death order, controlled source methods; twelve-type static caller mapping only.',contracts={
   'BA-01':'body-before-target-effects',
   'BA-02':'hit1 first hold callback creates one independent enrolled bullet at source root',
   'BA-03':'new bullet first detection in next world step',
   'BA-04':'HP death retains existing bullets; explicit destroy clears them',
   'BA-05':'bullet attack ID deduplicates target; ending tested separately from source action',
   'BA-06':'body frozen before callback prevents spawn; effect phase thaw enables next body step',
   'BA-07':'world pause skips world steps; low-level bullet pause does not imply body pause',
   'BA-08':'Monster2 visual/Tween and Monster16 follow/hurt-cut branches are not Monster30 defaults'},
   evidence={'source':'docs/tasks/evidence/TASK-SETTINGS-232/source-baseline.json','verification':'docs/tasks/evidence/TASK-SETTINGS-232/verification.json','timeline':'docs/tasks/evidence/TASK-SETTINGS-232/timeline.json'},
   sources=base['sources'],restoredSwfSha256=base['restoredSwfSha256'],cases=45,states=count,sourceMutationsRejected=rejected,
   limitations=base['limitations'],generatedBy='python tools/monster-body-order-source/verify.py --mutations')
  reference=ROOT/'docs/reverse-engineering/reference/monster-body-attack-lifecycle-contract.json'
  reference.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

 print('232 verified:',count,'source states; source mutations:',len(rejected))
if __name__=='__main__':main()
