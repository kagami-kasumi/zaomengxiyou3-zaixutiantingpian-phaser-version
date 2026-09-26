"""Compare dynamic attacks to independent reduction and all original lifecycle fields."""
import copy
import json
from ui_truth import ROOT,BASE,OUT,sha,read
from verify_lifecycle import check as check_lifecycle


def check(row,spec):
    if row['phase']!='enter':return []
    errors=[];plain=copy.deepcopy(row)
    for state in ['before','state']:
        for call in plain[state]['calls']:
            call.pop('hit',None);call.pop('reference',None)
    errors+=check_lifecycle(plain,spec)
    for call in row['state']['calls']:
        if call['kind']!='attack':continue
        if call['hit']!=call['reference']:errors.append('independent-pixel-reduction')
        if row['target']['far'] and call['hit']:errors.append('far-target')
    return errors


def main():
    files=[];mutants={};total=0;hits=0
    for fps in [20,24,30]:
        path=BASE/f'dynamic-collision-air/{fps}/measurement.json';data=read(path)
        assert data['environment'][0]['fps']==fps
        assert data['lifecycleDriverSha256']==sha(ROOT/'tools/monkey-spatial/LifecycleProbe.as')
        assert data['runnerSha256']==sha(ROOT/'tools/monkey-spatial/run_dynamic_collision.py')
        assert data['compiledSwfSha256']==sha(path.parent/'DynamicCollisionProbe.swf')
        assert data['compiledSourceSha256']==sha(path.parent/'DynamicCollisionProbe.as')
        assert data['referenceSourceSha256']==sha(ROOT/'tools/monkey-spatial/NaturalCollisionProbe.as')
        specs={s['symbol']:s for s in data['fixtures']['effects']}
        rows=[r for r in data['rows'] if r['phase']=='enter']
        assert len({r['id'] for r in rows})==144 and len(rows)==144*(fps*4+8)
        errors=[(r['id'],r['tick'],check(r,specs[r['before']['symbol']])) for r in rows if check(r,specs[r['before']['symbol']])]
        assert not errors,errors[:5]
        calls=[(r,c) for r in rows for c in r['state']['calls'] if c['kind']=='attack']
        assert {r['target']['symbol'] for r,c in calls}=={'ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7'}
        far=[r for r,c in calls if r['target']['far']];assert far and all(not c['hit'] for r,c in calls if r['target']['far'])
        assert any(c['hit'] for r,c in calls) and any(not c['hit'] for r,c in calls)
        selected=[('tracked-identity',far[0]),
                  ('after-follow',next(r for r in rows if r['id']=='PetMonkey1Bullet2-P1-1-move-hurt' and r['tick']==3)),
                  ('disabled-attack',next(r for r in rows if r['id']=='PetMonkey2Bullet2_1-P1-1-natural' and r['tick']==1)),
                  ('paused-follow',next(r for r in rows if r['id']=='PetMonkey1Bullet2-P1-1-pause' and r['tick']==4))]
        for name,row in selected:
            altered=copy.deepcopy(row)
            if name=='tracked-identity':next(c for c in altered['state']['calls'] if c['kind']=='attack')['hit']=True
            elif name=='after-follow':
                call=next(c for c in altered['state']['calls'] if c['kind']=='attack');call['x']=altered['state']['x'];call['y']=altered['state']['y']
            elif name=='disabled-attack':altered['state']['calls'].append(dict(kind='attack',hit=True,reference=True))
            else:altered['state']['x']=altered['before']['x']
            differences=check(altered,specs[altered['before']['symbol']]);assert differences,(fps,name)
            mutants[f'{name}-{fps}']=differences
        positive=sum(c['hit'] for r,c in calls);total+=len(rows);hits+=positive
        files.append(dict(fps=fps,rows=len(rows),attacks=len(calls),hits=positive,farAttacks=len(far),measurementSha256=sha(path),compiledSwfSha256=data['compiledSwfSha256']))
    report=dict(status='passed-bounded',hostRows=total,hits=hits,measurements=files,rejectedMutants=mutants,
                scope='144 continuous cases per fps: native three colipse classes, source lifecycle including paused Follow, target enter/leave and independent pixel reduction at actual attack call; original settlement/wall checks remain sinks. Finite center/far combinations complement the independent geometry coordinate oracle.')
    (OUT/'dynamic-collision-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 dynamic:',total,'host rows;',hits,'hits;',len(mutants),'rejected field/trace mutations')


if __name__=='__main__':main()
