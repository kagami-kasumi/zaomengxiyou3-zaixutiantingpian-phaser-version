"""Strict 241 gate: frozen native oracle, exact authorized residuals, executable mutants."""
import hashlib, json
from collections import Counter
import numpy as np
from verify import ROOT, OUT, WORK, load, plane

def read(p): return json.loads(p.read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def hit(p): return bool(p.size and p.any() and not (p.sum()==1 and p[0,0]))

def main():
 r,fields,raw=load()
 approval=read(OUT/'approved-pixel-differences.json')
 candidate=read(OUT/'candidate-pixel-differences.json')
 assert approval['status']=='user-approved'
 assert sha(OUT/'candidate-pixel-differences.json')==approval['candidateSha256']
 assert sha(OUT/'native.json')==candidate['nativeSha256']
 assert sha(WORK/'buffers.deflate')==r['bufferSha256']
 assert sha(WORK/'Probe.as')==r['probeSha256']==sha(ROOT/'tools/monster30-collision/Probe.as')
 assert sha(OUT/'fixtures.json')==r['fixtureSha256']
 for name,digest in r['fieldHashes'].items(): assert sha(WORK/'fields'/name)==digest
 for source in r['sources']:
  if 'method' not in source: assert sha(ROOT/source['path'])==source['sha256']
 profiles=read(ROOT/'tools/monster30-collision/profiles.json')
 source_map=read(OUT/'profile-source-map.json')
 assert len(source_map['types'])==40 and sum(len(p['types']) for p in profiles)==40
 for row in source_map['types']:
  for key in ['source','constructorSource']: assert sha(ROOT/row[key]['path'])==row[key]['sha256']
 repeat=read(OUT/'repeat.json')
 assert repeat==dict(status='passed',cases=93920,phaseFields=24,sourceCasesEqual=True,fieldBytesEqual=True)
 assert r['runtime']=='AIR 51.1.1.5'
 assert len(r['cases'])==93920 and len({c['id'] for c in r['cases']})==93920
 assert set(Counter((c['frame'],c['sign'],c['profile']) for c in r['cases']).values())=={1174}
 residuals=[];total=0;mutants={k:None for k in ['flip','origin','origin-y','target-scale','child-clock','transparent-as-bounds','edge-rounding','sole-origin']}
 broad_equivalent=0
 for c in r['cases']:
  q=c['intersection'];key=f"f{c['frame']}-s{c['sign']}"
  a=plane(fields[key],c['sourceRoot'],q);t=plane(fields[c['profile']],c['targetRoot'],q);p=a&t
  if p.size:
   actual=np.unpackbits(np.frombuffer(raw[c['bufferOffset']:c['bufferOffset']+c['bufferLength']],dtype=np.uint8),bitorder='little')[:p.size].reshape(p.shape).astype(bool)
   assert int(actual.sum())==c['cyanPixels'];total+=p.size
   ys,xs=np.where(actual!=p)
   if len(xs): residuals.append({**{k:c[k] for k in ['id','frame','sign','profile','sourceRoot','targetRoot','intersection']},'points':[dict(x=int(x),y=int(y),native=bool(actual[y,x]),lookup=bool(p[y,x])) for y,x in zip(ys,xs)]})
  assert hit(p)==c['hit'],c['id']
  assert c['hit']==(c['pixel'] and (c['broad'] if c['profile'].startswith('pet-') else True))
  # Omission is a proven equivalent mutant for this predicate: HitTest itself
  # intersects bounds and rejects dimensions <1. Never invent a killed witness.
  if c['profile'].startswith('pet-'):
   assert c['pixel']==c['hit'];broad_equivalent+=1
  if not p.size: continue
  variants={
   'flip':lambda:plane(fields[f"f{c['frame']}-s{-c['sign']}"],c['sourceRoot'],q)&t,
   'origin':lambda:plane(fields[key],dict(x=c['sourceRoot']['x']+1,y=c['sourceRoot']['y']),q)&t,
   'origin-y':lambda:plane(fields[key],dict(x=c['sourceRoot']['x'],y=c['sourceRoot']['y']+1),q)&t,
   'target-scale':lambda:a&plane(fields['pet-ObjectBaseSprite' if c['profile'].startswith('hero-') else 'hero-ObjectBaseSprite'],c['targetRoot'],q),
   'child-clock':lambda:plane(fields[f"f{c['frame']%10+1}-s{c['sign']}"],c['sourceRoot'],q)&t,
   'transparent-as-bounds':lambda:np.ones_like(a)&t,
   'edge-rounding':lambda:plane(fields[key],c['sourceRoot'],q,'twip')&plane(fields[c['profile']],c['targetRoot'],q,'twip'),
  }
  for name,fn in variants.items():
   if mutants[name] is None and hit(fn())!=c['hit']:mutants[name]=c['id']
  if mutants['sole-origin'] is None and bool(p.any())!=c['hit']:mutants['sole-origin']=c['id']
 assert residuals==candidate['differences'],'Unapproved residual tuple change'
 assert total==candidate['pixels']==58411155
 assert len(residuals)==379 and sum(len(d['points']) for d in residuals)==382
 assert all(mutants.values()),mutants
 phase=read(OUT/'phase.json')
 for source in phase['sources']: assert sha(ROOT/source['path'])==source['sha256']
 assert len(phase['rows'])==324 and len(phase['checks'])==60
 for fps in [20,24,30]:
  for scenario in ['normal','pause']:
   rows=[x for x in phase['rows'] if x['fps']==fps and x['scenario']==scenario]
   assert len(rows)==54
   for x in rows:
    tick=x['tick'];paused=scenario=='pause';effective=tick-(min(3,max(0,tick-4)) if paused else 0)
    if x['phase']=='before-world':expected=0 if tick==1 or effective>11 else min(10,effective-1)
    else: expected=1 if tick==1 else (0 if effective>=11 else effective-1)
    bullet=x['bullets'][0] if x['bullets'] else dict(frame=0,childFrame=0)
    assert bullet['frame']==bullet['childFrame']==expected,(x,expected)
 for i in range(6):
  checks=phase['checks'][i*10:(i+1)*10]
  assert [c['phase']['frame'] for c in checks]==list(range(1,11))
  assert [c['phase']['childFrame'] for c in checks]==list(range(1,11))
  assert [c['tick'] for c in checks]==([2,3,7,8,9,10,11,12,13,14] if phase['rows'][i*54]['scenario']=='pause' else list(range(2,12)))
 report=dict(status='passed',cases=93920,pixels=total,hitMismatches=0,approvedResidualCases=379,approvedResidualPixels=382,approvalSha256=sha(OUT/'approved-pixel-differences.json'),mutants=mutants,broadPhaseOmission=dict(status='equivalent',petCases=broad_equivalent,proof='AUtils positive bounds intersection is necessary for HitTest nonempty >=1 pixel intersection; omission cannot change this pure spatial Boolean. Caller retains broad-phase explicitly.'),phaseObservations=324,nativeChecks=60,repeat=repeat)
 (OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False))

if __name__=='__main__':main()
