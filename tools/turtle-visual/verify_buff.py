"""Check native dual-buff first display, refresh and expiry from source count rules."""
import gzip
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/buff-air'


def check(data):
    errors=[];cases={}
    for row in data['rows']:cases.setdefault(row['id'],{})[row['tick']]=row
    assert len(cases)==12
    for identity,states in cases.items():
        assert set(states)==set(range(242))
        end=216 if identity.startswith('buffrefresh-') else 169
        names=[set(),set()]
        for tick,row in states.items():
            for owner,root in enumerate(row['display']['children'][:2]):
                buffs=[c for c in root['children'] if c['type']=='PetTurtle2Buff']
                expected=1 if 1<=tick<end else 0
                if len(buffs)!=expected:errors.append((identity,tick,owner,'count'))
                for buff in buffs:
                    if buff['matrix']['tx']!=0 or buff['matrix']['ty']!=-50:errors.append((identity,tick,owner,'offset'))
                    names[owner].add(buff['name'])
        if any(len(n)!=1 for n in names):errors.append((identity,'duplicate-or-replaced-child'))
    return errors


def main():
    data=json.loads((WORK/'measurement.json').read_text(encoding='utf-8'));errors=check(data)
    pngs=set()
    for row in data['rows']:
        if 'capture' not in row:continue
        path=WORK/row['capture'];content=path.read_bytes();digest=hashlib.sha256(content).hexdigest()
        with Image.open(path) as image:assert image.size==(940,590)
        target=OUT/'native-baselines'/(digest+'.png');target.write_bytes(content);pngs.add(digest)
        row['capture']=target.relative_to(ROOT).as_posix();row['captureSha256']=digest
    data['probeSha256']=hashlib.sha256((WORK/'DynamicProbe.as').read_bytes()).hexdigest()
    data['probeSwfSha256']=hashlib.sha256((WORK/'DynamicProbe.swf').read_bytes()).hexdigest()
    data['originalMeasurementSha256']=hashlib.sha256((WORK/'measurement.json').read_bytes()).hexdigest()
    (OUT/'buff-native.json.gz').write_bytes(gzip.compress(json.dumps(data).encode(),mtime=0))
    report=dict(status='passed-bounded-check' if not errors else 'failed',states=len(data['rows']),cases=12,uniqueImages=len(pngs),failures=errors,
                expected={'firstVisibleTick':1,'initialExpiryTick':169,'refreshAtTick':48,'refreshedExpiryTick':216,'durationTicks':'uint(7.9) * 24 = 168'},
                boundaries='Explicit 24 FPS profile; original target-buff add/step/remove projection, source methods and native child definitions. Other status effects excluded.')
    (OUT/'buff-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report));assert not errors


if __name__=='__main__':main()
