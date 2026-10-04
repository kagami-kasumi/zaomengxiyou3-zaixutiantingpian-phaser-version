"""257A independent oracle comparison; never authorizes collision residuals."""
import hashlib,json,sys
from pathlib import Path
import numpy as np
from PIL import Image
from verify import ROOT,OUT,WORK,ATTACK,load,plane
from capture import method,SRC

def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def hit(p):return bool(p.size and p.any() and not (p.sum()==1 and p[0,0]))

def main():
 r,fields,raw=load();frames=20 if ATTACK==2 else 14
 assert len(r['cases'])==frames*2*4*1444
 assert len({c['id'] for c in r['cases']})==len(r['cases'])
 assert sha(WORK/'buffers.deflate')==r['bufferSha256']
 assert sha(WORK/'Probe.as')==r['probeSha256']==sha(Path(__file__).with_name('Probe.as'))
 assert sha(OUT/'fixtures.json')==r['fixtureSha256']
 for name,digest in r['fieldHashes'].items():assert sha(WORK/'fields'/name)==digest
 for src in r['sources']:
  if 'method' not in src:assert sha(ROOT/src['path'])==src['sha256']
  else:assert hashlib.sha256(method(ROOT/src['path'],src['method']).encode()).hexdigest()==src['sha256']
 original=read(ROOT/'docs/tasks/evidence/TASK-SETTINGS-241/profile-source-map.json')
 for row in original['types']:
  for key in ['source','constructorSource']:assert sha(ROOT/row[key]['path'])==row[key]['sha256']
 for src in original['commonSources']:assert sha(ROOT/src['path'])==src['sha256']
 targets=read(ROOT/'docs/tasks/evidence/TASK-SETTINGS-241/target-display-list.json')
 assert sha(ROOT/targets['source'])==targets['sha256']
 prior=read(ROOT/'docs/tasks/evidence/TASK-SETTINGS-241/native.json')['targets']
 assert r['targets']==prior,'Actual target construction changed'
 repeat=read(OUT/'repeat.json');assert repeat['sourceCasesEqual'] and repeat['fieldBytesEqual']
 differences=[];total=0;hits=0;diagnostic={'targetDifferences':0,'attackDifferences':0,'compositeDifferences':0}
 mutants={k:None for k in ['flip','origin-x','origin-y','profile','frame','bounds','rounding','omitted-child','sole-origin']}
 for c in r['cases']:
  q=c['intersection'];key=f"f{c['frame']}-s{c['sign']}"
  a=plane(fields[key],c['sourceRoot'],q);t=plane(fields[c['profile']],c['targetRoot'],q);p=a&t
  assert hit(p)==c['hit'],c['id'];hits+=int(c['hit'])
  assert c['hit']==(c['pixel'] and (c['broad'] if c['profile'].startswith('pet-') else True))
  if not p.size:continue
  actual=np.unpackbits(np.frombuffer(raw[c['bufferOffset']:c['bufferOffset']+c['bufferLength']],dtype=np.uint8),bitorder='little')[:p.size].reshape(p.shape).astype(bool)
  assert int(actual.sum())==c['cyanPixels'];total+=p.size
  ys,xs=np.where(actual!=p)
  if len(xs):
   differences.append({**{k:c[k] for k in ['id','frame','sign','profile','sourceRoot','targetRoot','intersection']},'points':[dict(x=int(x),y=int(y),native=bool(actual[y,x]),candidate=bool(p[y,x])) for y,x in zip(ys,xs)]})
   diag=[]
   for name,pred in [('target',t),('source',a)]:
    rgb=np.asarray(Image.open(WORK/'diagnostic'/f"{c['id']}-{name}.png").convert('RGB'))
    diag.append(np.all(rgb==[0,255,255],axis=2))
   diagnostic['targetDifferences']+=int(np.count_nonzero(diag[0]!=t))
   diagnostic['attackDifferences']+=int(np.count_nonzero(diag[1]!=a))
   diagnostic['compositeDifferences']+=int(np.count_nonzero((diag[0]&diag[1])!=actual))
  variants={
   'flip':lambda:plane(fields[f"f{c['frame']}-s{-c['sign']}"],c['sourceRoot'],q)&t,
   'origin-x':lambda:plane(fields[key],dict(x=c['sourceRoot']['x']+1,y=c['sourceRoot']['y']),q)&t,
   'origin-y':lambda:plane(fields[key],dict(x=c['sourceRoot']['x'],y=c['sourceRoot']['y']+1),q)&t,
   'profile':lambda:a&plane(fields['pet-ObjectBaseSprite' if c['profile'].startswith('hero-') else 'hero-ObjectBaseSprite'],c['targetRoot'],q),
   'frame':lambda:plane(fields[f"f{c['frame']%frames+1}-s{c['sign']}"],c['sourceRoot'],q)&t,
   'bounds':lambda:np.ones_like(a)&t,
   'rounding':lambda:plane(fields[key],c['sourceRoot'],q,'twip')&plane(fields[c['profile']],c['targetRoot'],q,'twip'),
   'omitted-child':lambda:np.zeros_like(a),
  }
  for name,fn in variants.items():
   if mutants[name] is None and hit(fn())!=c['hit']:mutants[name]=c['id']
  if mutants['sole-origin'] is None and bool(p.any())!=c['hit']:mutants['sole-origin']=c['id']
 assert all(mutants[k] for k in mutants if k!='sole-origin'),mutants
 candidate=dict(status='unapproved-candidate',attack=ATTACK,nativeSha256=sha(OUT/'native.json'),pixels=total,differences=differences)
 save(OUT/'candidate-pixel-differences.json',candidate)
 report=dict(status='boolean-domain-passed-pixel-residuals-unapproved',cases=len(r['cases']),positive=hits,negative=len(r['cases'])-hits,pixels=total,booleanDifferences=0,residualCases=len(differences),residualPixels=sum(len(x['points']) for x in differences),diagnostic=diagnostic,mutants=mutants,repeat=repeat,candidateSha256=sha(OUT/'candidate-pixel-differences.json'),profileTypes=40,profileSourceSha256=sha(ROOT/'docs/tasks/evidence/TASK-SETTINGS-241/profile-source-map.json'))
 approval_path=OUT.parent/'approved-pixel-differences.json'
 if approval_path.exists():
  approval=read(approval_path)
  assert approval['status']=='user-approved' and approval['candidates'][str(ATTACK)]==report['candidateSha256']
  report['status']='passed-exact-approved-residuals'
  report['approvalSha256']=sha(approval_path)
 save(OUT/'verification.json',report);print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':main()
