"""Independent observable lifecycle assertions derived from original source contracts."""
import gzip
import hashlib
import json
import struct
from PIL import Image
from pathlib import Path
from prepare import ROOT, OUT, NAMES, sha

SCENARIOS=['cycle','refresh','late-refresh','readd','short','zero','move','hurt','effect-destroy','host-destroy','world-pause']
LENGTH=dict(sxkb=100,fsnl=100,smjc=20,mfjc=20,gjjc=25,fyjc=25)

def nodes(tree):
    yield tree
    for c in tree['children']:yield from nodes(c)

def key(row):return row['id']+':'+str(row['tick'])+':'+row['phase']

def expected_cases():
    ids=set()
    for effect in NAMES:
        profiles=[f'{family}{i}' for family in ['monkey','horse'] for i in range(1,5)] if effect in NAMES[:2] else [f'hero{i}' for i in range(1,6)]
        for profile in profiles:
            for owner in (1,2):
                for direction in (0,1):
                    for scenario in SCENARIOS if profile in ('monkey1','hero1') else ['cycle']:
                        ids.add(f'{effect}-{profile}-p{owner}-d{direction}-{scenario}')
    return ids

def check(data, files=True):
    fixtures={s['id']:s for s in data['fixtures']['cases']}
    assert set(fixtures)==expected_cases(), 'fixture universe'
    actual={key(r):r for r in data['rows']}
    expected={i+':'+str(t)+':'+phase for i in fixtures for t,phase in [(0,'added-before-step'),(0,'first-owner-step')]+[(t,'exit-after-owner') for t in range(1,169)]}
    assert set(actual)==expected and len(data['rows'])==len(expected),'state completeness'
    counts={};checked=0
    for cid,s in fixtures.items():
        effect=s['effect'];pet=s['hostType']=='pet';scenario=s['scenario'];length=LENGTH[effect]
        display_alive=False;frame=0;has_effect=True;first=True;count=0;start=0;value=7;source=True;dead=False;host=True
        # Per-state model is source semantics; native trees are the independent observation.
        for t,phase in [(0,'added-before-step'),(0,'first-owner-step')]+[(t,'exit-after-owner') for t in range(1,169)]:
            row=actual[cid+':'+str(t)+':'+phase]
            pause=scenario=='world-pause' and 3<=t<=40
            if phase!='added-before-step':
                # Flash constructs/advances timelines before ENTER_FRAME; newly constructed
                # clips retain frame1 for the next native frame. Pause is observed on entry.
                if t>0 and display_alive:
                    held=(not pet and scenario=='world-pause' and 4<=t<=41)
                    newborn=(scenario=='readd' and t==126)
                    if t!=1 and not newborn and not held:frame=frame%length+1
                    if pet and frame==100:display_alive=False
                if (t==3 and scenario=='refresh') or (t==105 and scenario=='late-refresh') or (t==125 and scenario=='readd'):
                    if has_effect:start=count
                    else:has_effect=True;first=True;value=99
                if t==3 and scenario in ('effect-destroy','host-destroy'):
                    source=False;count=0;has_effect=False
                    if scenario=='host-destroy':
                        dead=True
                        if not pet:host=False;display_alive=False
                if t==27 and scenario=='host-destroy' and pet:host=False
                if not pause and not dead:
                    if not pet and display_alive and (frame==length or (scenario=='hurt' and t>=3)):display_alive=False
                    if source and has_effect:
                        if first:
                            first=False;start=count;display_alive=True;frame=1
                        if count-start>=s['duration']:
                            has_effect=False
                            if pet:display_alive=False
                    count+=1
            assert row['count']==count,(cid,t,'count',row['count'],count)
            live_effects=[e for e in row['effects'] if e]
            assert len(live_effects)==int(has_effect),(cid,t,'effect existence')
            if live_effects:
                assert live_effects[0]['value']==value,(cid,t,'refresh value')
            tree=row['display'];hs=[n for n in tree['children'] if n['name']=='host']
            assert len(hs)==int(host),(cid,t,'host parent')
            buffs=[n for n in nodes(tree) if n['type']=='buff_'+effect]
            visible=display_alive and host if pet else display_alive
            assert len(buffs)==int(visible),(cid,t,phase,'buff existence',len(buffs),visible)
            if buffs:
                assert buffs[0]['frame']==frame,(cid,t,'frame',buffs[0]['frame'],frame)
                assert buffs[0]['totalFrames']==length
                assert buffs[0]['visible'] and buffs[0]['mask'] is None
                if pet:
                    assert buffs[0] in hs[0]['children'],(cid,t,'pet parent')
                    assert buffs[0]['matrix']['tx']==0 and buffs[0]['matrix']['ty']==0
                else:
                    bullets=[n for n in tree['children'] if n['type'].endswith('FollowBaseObjectBullet')]
                    assert len(bullets)==1 and buffs[0] in bullets[0]['children'],(cid,t,'scene parent')
                    m=bullets[0]['matrix'];x=s['x']+(31.25 if scenario=='move' and t>=3 else 0);y=s['y']-(12.5 if scenario=='move' and t>=3 else 0)
                    assert m['tx']==x and m['ty']==y,(cid,t,'follow position')
                    sign=(-1 if s['direction']==1 else 1)
                    if scenario=='move' and t==4:sign=-1
                    if scenario=='move' and t>=5:sign=1
                    assert m['a']*sign>0,(cid,t,'direction versus root')
            if not pet:
                assert len(row['bullets'])==int(display_alive),(cid,t,'source array cleanup')
                assert all(not b['dead'] for b in row['bullets'])
            assert row['ready']==dead,(cid,t,'host dead')
            if scenario=='host-destroy' and pet and 3<=t<27:
                # Original TweenLite easeOut: -c*t*(t-2)+b, deterministic elapsed clock.
                q=(t-3)/24;expected_alpha=(1-q)**2
                assert abs(hs[0]['alpha']-expected_alpha)<=1/256,(cid,t,'source fade alpha')
            if files:
                p=ROOT/row['capture'];assert sha(p)==row['captureSha256'],p
                assert struct.unpack('>II',p.read_bytes()[16:24])==(row['crop']['width'],row['crop']['height'])
                with Image.open(p) as im:
                    bbox=im.getchannel('A').getbbox()
                    if bbox:
                        assert bbox[0]>0 and bbox[1]>0 and bbox[2]<im.width and bbox[3]<im.height,(cid,t,'clipped baseline crop')
            counts[key(row)]=int(host)+1+(1 if visible and not pet else 0)
            checked+=1
    return dict(status='passed',fixtures=len(fixtures),states=checked,wrapperCounts=counts,
                scope='Independent fixed fixture universe, effect transitions, separate native/display clock, actual parent/array cleanup, owner matrices, source fade; bodies/AI/damage excluded.')

def main():
    p=OUT/'baseline-native.json.gz';data=json.loads(gzip.decompress(p.read_bytes()))
    report=check(data);report['inputSha256']=sha(p)
    (OUT/'lifecycle-verification.json').write_text(json.dumps(report,separators=(',',':'))+'\n',encoding='utf-8')
    print('lifecycle:',report['fixtures'],report['states'],'passed')

if __name__=='__main__':main()
