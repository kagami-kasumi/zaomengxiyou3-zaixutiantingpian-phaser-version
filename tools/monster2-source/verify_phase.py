"""Independent ENTER/world/EXIT clock checks; raw MovieClip is outside the pause enrollment."""
import copy,itertools,json
import verify

def verify_phase(r):
 verify.provenance(r)
 rows=r['rows'];domain=set(itertools.product([20,24,30],['hit1','hit2'],['normal','lethal','pause','destroy-after'],range(1,49),['before-world','after-world','exit']))
 assert len(rows)==len(domain)==3456
 assert {(x['fps'],x['attack'],x['scenario'],x['tick'],x['phase']) for x in rows}==domain
 checks=[]
 for fps,action,mode in itertools.product([20,24,30],['hit1','hit2'],['normal','lethal','pause','destroy-after']):
  birth=5 if action=='hit1' else 7
  births=[5] if mode in ['lethal','destroy-after'] else [5,23 if mode=='pause' else 20]
  if action=='hit2':births=[]
  for t in range(1,49):
   for phase in ['before-world','after-world','exit']:
    row=next(x for x in rows if (x['fps'],x['attack'],x['scenario'],x['tick'],x['phase'])==(fps,action,mode,t,phase))
    expected=[]
    for i,b in enumerate(births):
     if t<b or (t==b and phase=='before-world'):continue
     total=14 if i==0 else 20;end=b+total+(3 if mode=='pause' and i==0 else 0)
     killed=mode=='destroy-after' and t>=6
     ended=killed or t>end or (t==end and phase!='before-world')
     paused_frames=min(3,max(0,t-7)) if mode=='pause' and i==0 else 0
     frame=0 if ended else max(1,t-b-paused_frames)
     expected.append(dict(uid=i+1,frame=frame,total=0 if ended else total,ready=ended,parentPresent=not ended))
     if phase=='before-world' and t>b and not ended and not(mode=='pause' and 7<=t<=9):
      checks.append(dict(tick=t,phase=expected[-1]))
    assert row['bullets']==expected,(fps,action,mode,t,phase,'bullets',row['bullets'],expected)
    controls=[]
    if mode=='pause' and t>=birth+2:controls.append(dict(tick=birth+2,kind='pause',tweens=True,delays=True))
    if mode=='pause' and t>=birth+5:controls.append(dict(tick=birth+5,kind='resume'))
    assert row['controls']==controls
    if action=='hit1':assert not row['visuals'] and not row['tweens']
    else:
     exists=t>=7 and not(t==7 and phase=='before-world')
     assert len(row['visuals'])==int(exists) and row['hits']==0
     if exists:
      v=row['visuals'][0]
      assert v['total']==14 and v['frame']==min(14,max(1,t-7)),(fps,mode,t,phase,'raw clock')
      assert v['parentPresent']==(t<21 or t==21 and phase!='exit'),(fps,mode,t,phase,'raw removal')
      assert row['tweens']==[dict(tick=7,target=who,duration=1,x=300,y=150) for who in ['p1','p2']]
     else:assert row['tweens']==[]
 assert r['checks']==checks,('actual checkAttack entries',len(r['checks']),len(checks))
 return dict(states=len(rows),checks=len(checks))

if __name__=='__main__':print(verify_phase(verify.load('phase.json')))
