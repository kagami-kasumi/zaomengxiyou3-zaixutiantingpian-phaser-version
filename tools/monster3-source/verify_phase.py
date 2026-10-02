"""Independent assertions for real Monster3 world/MovieClip phase observations."""
import copy,json
from pathlib import Path
from verify import FACTS,OUT,require,provenance

def verify_phase(r):
 provenance(r)
 expected=[];checks=[]
 for fps in [20,24,30]:
  for attack in ['hit1','hit2']:
   f=FACTS[attack];birth=f['birthTick'];total=f['totalFrames']
   for mode in ['normal','lethal','pause']:
    end=birth+total+(3 if mode=='pause' else 0)
    hits=[birth+1] if attack=='hit1' else [birth+1,birth+5,birth+9]
    if mode=='pause':hits=[t+(3 if t>birth+1 else 0) for t in hits]
    for frame in range(1,total+1):
     checks.append(dict(tick=birth+frame+(3 if mode=='pause' and frame>=2 else 0),phase=dict(uid=1,frame=frame,total=total,ready=False,parentPresent=True)))
    for tick in range(1,31):
     for phase in ['before-world','after-world','exit']:
      born=tick>birth or tick==birth and phase!='before-world'
      ended=tick>end or tick==end and phase!='before-world'
      frame=max(1,tick-birth)
      if mode=='pause' and tick>=birth+2:frame=2 if tick<=birth+5 else tick-birth-3
      bullets=[] if not born else [dict(uid=1,frame=0 if ended else frame,total=0 if ended else total,ready=ended,parentPresent=not ended)]
      expected.append(dict(fps=fps,attack=attack,scenario=mode,tick=tick,phase=phase,bullets=bullets,hits=4*sum(t<tick or t==tick and phase!='before-world' for t in hits),hp=0 if mode=='lethal' and (tick>birth or tick==birth and phase!='before-world') else 100))
 require(len(r['rows'])==1620,'native phase domain')
 for actual,want in zip(r['rows'],expected):require({k:actual[k] for k in want}==want,'native phase',want['fps'],want['attack'],want['scenario'],want['tick'],want['phase'])
 require(r['checks']==checks,'native actual checkAttack phase sequence')
 return len(expected)
def main():
 path=OUT/'phase.json';r=json.loads(path.read_text(encoding='utf-8'));verify_phase(r)
 for name in ['first-frame','early-clear','missing-phase']:
  bad=copy.deepcopy(r)
  if name=='first-frame':bad['checks'][0]['phase']['frame']=2
  if name=='early-clear':bad['rows'][20]['bullets'][0]['ready']=True
  if name=='missing-phase':bad['rows'].pop()
  try:verify_phase(bad)
  except AssertionError:pass
  else:raise AssertionError('native phase corruption accepted: '+name)
 r['status']='verified-bounded-native-phase';r['corruptionsRejected']=3
 path.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(dict(task='247',status='passed',nativePhaseStates=1620,actualCheckCalls=135,corruptionsRejected=3)))
if __name__=='__main__':main()
