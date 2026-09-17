"""Bounded native sampling preflight; original definitions and HitTest stay read-only."""
import argparse
import hashlib
import gzip
import json
import runpy
import shutil
import struct
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222B/preflight'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-222B'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def save(path, data): path.write_text(json.dumps(data, indent=2)+'\n', encoding='utf-8')


def prepare(full=False):
    WORK.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
    helper=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    visual=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/source-definitions.json').read_text())
    effects=[dict(symbol=s,characterId=c,scales=[1,2] if c==534 else [1]) for s,c in
             [('PetTurtle1Bullet1',473),('PetTurtle2Bullet1',511),('PetTurtle1Bullet2',504),('PetTurtle3Bullet3',534)]]
    phase_map={}
    if full:
        records=json.loads(gzip.decompress((ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/effects-native.json.gz').read_bytes()))
        def signature(n):
            return (n.get('frame'),n.get('totalFrames'),json.dumps(n['matrix'],sort_keys=True),
                    tuple(signature(c) for c in n['children']))
        for effect in effects:
            seen={};mapping={}
            for row in records['states']:
                if row['symbol']!=effect['symbol']:continue
                sig=signature(row['tree']);seen.setdefault(sig,row['tick']);mapping[str(row['tick'])]=seen[sig]
            effect['sampleTicks']=sorted(seen.values());phase_map[effect['symbol']]=mapping
    source=visual['sources'][0]; pet=helper['source_tags'](ROOT/source['path'])
    assert sha(ROOT/source['path'])==source['sha256']
    chunks=[helper['tag'](69,struct.pack('<I',8))]
    chunks += [helper['tag'](*pet[int(cid)]) for cid in sorted(source['definitions'],key=int)]
    stagepath=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
    stage=helper['source_tags'](stagepath)
    xml=ET.parse(ROOT/'local-resources/regima/task-outputs/task-settings-218/StageCommon.xml').getroot()
    defs={int(n.get('spriteId') or n.get('shapeId') or n.get('characterID')):n for n in xml.find('tags')
          if n.get('spriteId') or n.get('shapeId') or n.get('characterID')}
    todo=[105,107,95];used=set()
    while todo:
        cid=todo.pop()
        if cid in used: continue
        used.add(cid)
        for n in defs[cid].iter():
            if n.get('type','').startswith('PlaceObject') and n.get('placeFlagHasCharacter')=='true':todo.append(int(n.get('characterId')))
    chunks += [helper['tag'](*stage[c]) for c in sorted(used)]
    for i,cid in enumerate([e['characterId'] for e in effects]+[105,107,95]):
        chunks.append(helper['place'](cid,i+1,dict(tx=0,ty=0),transformed=False))
    chunks += [helper['tag'](1,b''),helper['tag'](0,b'')]
    body=helper['rectangle'](940,590)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    (WORK/'source.swf').write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    cases=[]
    for owner in ['P1','P2']:
        for anchor,x,y in [('center',0,0),('root',5000,5000)]:
            cases.append(dict(id=owner+'-'+anchor,owner=owner,anchor=anchor,x=x,y=y))
        for edge in ['left','right','top','bottom']:
            for overlap in [.25,1,4]:
                n=overlap if edge in ['left','top'] else -overlap
                cases.append(dict(id=f'{owner}-{edge}-{overlap}',owner=owner,anchor=edge,
                                  x=n if edge in ['left','right'] else 0,y=n if edge in ['top','bottom'] else 0))
        for phase in range(20):
            cases.append(dict(id=f'{owner}-phase-{phase}',owner=owner,anchor='root',x=phase/20,y=-20+(phase*7%20)/20))
    fixtures=dict(task='TASK-SETTINGS-222B',status='frozen-before-native-sampling',effects=effects,cases=cases,
                  ticks=list(range(122)) if full else [0,17,29],lastTick=121 if full else 29,
                  purpose='Finite full phase sampling' if full else 'Sampling capability preflight; not full family acceptance or promoted truth.',
                  phaseMap=phase_map,tiledSLD=True,
                  sourceHashes={source['path']:source['sha256'],str(stagepath.relative_to(ROOT)):sha(stagepath)},
                  sourceSubsetSha256=sha(WORK/'source.swf'),targetIds=[105,107,95],targetScaleX=[2,2,1])
    save(WORK/'fixtures.json',fixtures);save(OUT/('fixtures.json' if full else 'preflight-fixtures.json'),fixtures)
    hit=ROOT/'local-resources/regima/task-outputs/task-settings-218/source/scripts/my/HitTest.as'
    (WORK/'my').mkdir(exist_ok=True);shutil.copyfile(hit,WORK/'my/HitTest.as')
    shutil.copyfile(Path(__file__).with_name('Probe.as'),WORK/'Probe.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.turtle222b.preflight</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''')
    return fixtures,hit


def main():
    global WORK
    parser=argparse.ArgumentParser();parser.add_argument('--full',action='store_true');args=parser.parse_args()
    if args.full:WORK=WORK.parent/'full'
    fixtures,hit=prepare(args.full)
    command=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
             '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=Probe.swf','Probe.as']
    result=subprocess.run(command,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    native=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(native,cwd=WORK,stdout=stdout,stderr=stderr,timeout=3600)
    lines=((WORK/'stdout.log').read_bytes()+b'\n'+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    expected=sum(len(e.get('sampleTicks',fixtures['ticks']))*len(e['scales'])*2*3*len(fixtures['cases']) for e in fixtures['effects'])
    assert result.returncode==0 and f'COMPLETE {expected}' in lines,'\n'.join(lines[-10:])
    report=dict(status='measured-not-promoted',compileCommand=command,command=native,exitCode=result.returncode,
                probeSha256=sha(WORK/'Probe.as'),originalHitTestSha256=sha(hit),fixturesSha256=sha(WORK/'fixtures.json'),
                runtimeSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
                environment=[json.loads(l[4:]) for l in lines if l.startswith('ENV ')],
                cases=[json.loads(l[5:]) for l in lines if l.startswith('CASE ')],
                fields=[json.loads(l[6:]) for l in lines if l.startswith('FIELD ')],
                trees=[json.loads(l[5:]) for l in lines if l.startswith('TREE ')])
    assert len(report['cases'])==expected
    save(WORK/'measurement.json',report)
    print('Native cases:',expected,'fields:',len(report['fields']),flush=True)


if __name__=='__main__': main()
