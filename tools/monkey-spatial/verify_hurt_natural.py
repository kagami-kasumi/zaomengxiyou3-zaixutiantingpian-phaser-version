"""Native callback, hue transform and eight-frame self-removal boundary verification."""
import copy
import json
import math
import struct
from ui_truth import ROOT,BASE,OUT,sha,read


def expected_filter():
    c=math.cos(math.radians(100));s=math.sin(math.radians(100))
    base=[.213,.715,.072];cosines=[[.787,-.715,-.072],[-.213,.285,-.072],[-.213,-.715,.928]]
    sines=[[-.213,-.715,.928],[.143,.14,-.283],[-.787,.715,.072]]
    matrix=[]
    for row in range(3):matrix += [base[col]+c*cosines[row][col]+s*sines[row][col] for col in range(3)]+[0,0]
    matrix += [0,0,0,1,0]
    # Native ColorMatrixFilter stores each coefficient as float32.
    return [struct.unpack('<f',struct.pack('<f',v))[0] for v in matrix]


def check_row(row):
    tick=row['tick'];errors=[]
    expected=dict(frame=1 if tick==0 else (tick-1)%8+1,total=8,attached=tick<=8,children=6 if tick<=8 else 0,
                  parentAttached=row['owner']==2 or tick<12,x=12 if row['owner']==1 else 37,y=-24 if row['owner']==1 else -51,filter=expected_filter())
    for key,value in expected.items():
        if row[key]!=value:errors.append(key)
    return errors


def main():
    files=[];mutants={};pictures={};total=0
    script=BASE/'hurt-source/scripts/HeroBeHurt.as';text=script.read_text(encoding='utf-8')
    assert 'addFrameScript(7,this.frame8)' in text and 'parent.removeChild(this)' in text
    for fps in [20,24,30]:
        path=BASE/f'hurt-natural-air/{fps}/measurement.json';data=read(path)
        assert data['frameRate']==fps and len(data['rows'])==228 and len(data['hits'])==12
        assert data['probeSha256']==sha(ROOT/'tools/monkey-spatial/HurtNaturalProbe.as')
        assert data['compiledSwfSha256']==sha(path.parent/'HurtNaturalProbe.swf')
        assert data['sourceSha256']==sha(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf')
        for record in data['methods']:assert sha(ROOT/record['path'])==record['fileSha256']
        for hit in data['hits']:
            assert hit['before']==hit['hit']-1 and hit['after']==hit['hit']
            assert hit['father']==(hit['hit']==6) and hit['fatherCount']==(5*fps if hit['hit']==6 else -1)
            assert hit['childClass']=='HeroBeHurt' and hit['filter']==expected_filter()
            assert hit['x']==hit['colipse']['x'] and hit['y']==hit['colipse']['y']
        for row in data['rows']:
            assert not check_row(row),(fps,row['owner'],row['hit'],row['tick'],check_row(row))
            if 'path' in row:
                assert sha(path.parent/row['path'])==row['sha256']
                pictures.setdefault((row['owner'],row['tick']),set()).add(row['sha256'])
        for name,key,value,tick in [('wrong-offset','x',99,0),('identity-filter','filter',[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],0),('late-removal','attached',True,9),('wrong-phase','frame',2,1)]:
            row=copy.deepcopy(next(r for r in data['rows'] if r['tick']==tick));row[key]=value
            errors=check_row(row);assert errors;mutants[f'{name}-{fps}']=errors
        total+=len(data['rows']);files.append(dict(fps=fps,measurementSha256=sha(path),compiledSwfSha256=data['compiledSwfSha256']))
    assert all(len(values)==1 for values in pictures.values())
    report=dict(status='passed-bounded',nativeHost=True,states=total,hitStates=36,baselineStates=len(pictures)*3,measurements=files,rejectedMutants=mutants,
                script=script.relative_to(ROOT).as_posix(),scriptSha256=sha(script),
                scope='Original addBeAttackEffect/ColorMatrix/updateFather with native ENTER_FRAME; frame8 removal observed next ENTER_FRAME. Referenced detached clips continue in the fixture, not a gameplay visible-lifetime claim. Independent geometric reconstruction and shared inherited inventory are separate pending inputs.')
    (OUT/'hurt-natural-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 natural hurt verified:',total,'states; 36 hit states;',len(mutants),'rejected mutations')


if __name__=='__main__':main()
