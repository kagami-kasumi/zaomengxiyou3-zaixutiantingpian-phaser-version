"""Copy independent native EXIT rasters into an ignored local browser fixture."""
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'dist/__pet226_display'
(OUT/'original').mkdir(parents=True, exist_ok=True)
def read(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
mapping = {
    'monkey': {'PetMonkey1Bullet1':'monkey1.normal', 'PetMonkey1Bullet2':'monkey1.xj',
        'PetMonkey2Bullet1':'monkey2.normal', 'PetMonkey2Bullet2_1':'monkey2.lj', 'PetMonkey2Bullet2_2':'monkey2.lj',
        'PetMonkey3Bullet1':'monkey3.normal', 'PetMonkey3Bullet2':'monkey3.lyq',
        'PetMonkey3Bullet3_1':'monkey3.lj', 'PetMonkey3Bullet3_2':'monkey3.lj'},
    'horse': {'PetHorse1Bullet1':'horse1.normal','PetHorse1Bullet2':'horse1.sp','PetHorse2Bullet1':'horse2.normal',
        'PetHorse2Bullet2':'horse2.bd','PetHorse3Bullet1':'horse3.normal','PetHorse3Bullet2':'horse3.bd',
        'PetHorse3Bullet3':'horse3.sp','PetHorse3Bullet4':'horse3.bz','PetHorse4Bullet5':'horse4.tmaoyi',
        'PetHorse4Bullet5Explode':'horse4.tmaoyi.explode','AoyiBuff':'horse4.aoyi-buff'},
}
cases, sources = [], []
for family in ['monkey', 'horse']:
    suffix = '-render' if family == 'horse' else ''
    work = f'local-resources/regima/task-outputs/TASK-SLICE-226/{family}-world-pause-air{suffix}'
    report = read(f'docs/tasks/evidence/TASK-SLICE-226/{family}-world-pause-native{suffix}.json')
    inputs = {}
    for item in report['reports']:
        assert sha(item['path']) == item['sha256']
        inputs[item['fps']] = read(item['path'])
        sources.append(item)
    clocks = read(f'src/assets/pet-{family}-native-clocks.json')['clips']
    for symbol, asset in mapping[family].items():
        clock = clocks.get(symbol, dict(cycleStart=1,cycleTicks=14))
        for age in range(1, clock['cycleStart']+clock['cycleTicks']):
            captures = []
            for fps in [20,24,30]:
                prefix = symbol+'-P1-0-pause' if family == 'monkey' else symbol+('_follow' if symbol in ['PetHorse1Bullet2','PetHorse2Bullet2','PetHorse3Bullet2','AoyiBuff'] else '_enemy' if symbol=='PetHorse4Bullet5' else '_special')+'-P1-0-pause'
                row = next(r for r in inputs[fps]['exitRows'] if r['id']==prefix and r['tick']==age)
                assert not row['state']['dead']
                key = symbol+'|exit|'+json.dumps(row['state']['phaseFrames'],separators=(',',':'))
                capture = inputs[fps]['nativePhases'][key]
                path = f"{work}/{capture['path']}"
                assert sha(path) == capture['sha256']
                captures.append((capture,path,row['state']['frame']))
            capture,path,frame = captures[0]
            assert all((c['sha256'],c['left'],c['top'],f)==(capture['sha256'],capture['left'],capture['top'],frame) for c,_,f in captures)
            filename = capture['sha256']+'.png'
            shutil.copyfile(ROOT/path, OUT/'original'/filename)
            for direction in [-1,1]:
                cases.append(dict(id=f'{family}/{symbol}/{age}/{direction}',family=family,symbol=symbol,assetKey='pet-skill.'+asset,
                    phaseTick=age,rootFrame=frame,direction=direction,original='original/'+filename,
                    sourceSha256=capture['sha256'],crop=dict(left=capture['left'],top=capture['top'])))
(OUT/'inputs.json').write_text(json.dumps(dict(cases=cases,sources=sources),separators=(',',':'))+'\n',encoding='utf-8')
print(f'{len(cases)} independent original EXIT cases, two directions, three-FPS raster identity; local fixture inputs prepared.')
