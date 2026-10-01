"""244 reproducible native fixture runner. No production assets/TS expected input."""
import gzip
import json
import shutil
import subprocess
import sys
from pathlib import Path
from prepare import ROOT, OUT, NAMES, prepare, sha

SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')

def fixtures(smoke=False, mutation='baseline'):
    sources=[dict(path=str(ROOT/'local-resources/regima/source/restored-swfs/assets'/n),sha256=sha(ROOT/'local-resources/regima/source/restored-swfs/assets'/n)) for n in ['StageCommon.swf','pet1.swf']]
    cases=[]
    for effect in NAMES:
        pet=effect in NAMES[:2]
        profiles=[(f'{family}{i}', 'ObjectBaseSprite3' if i==1 else 'ObjectBaseSprite4' if i==2 or family=='horse' else 'ObjectBaseSprite') for family in ['monkey','horse'] for i in range(1,5)] if pet else [(f'hero{i}','ObjectBaseSprite') for i in range(1,6)]
        for profile,collider in profiles:
            for owner in [1,2]:
                for direction in [0,1]:
                    scenarios=['cycle','refresh','late-refresh','readd','short','zero','move','hurt','effect-destroy','host-destroy','world-pause'] if profile in ['monkey1','hero1'] else ['cycle']
                    for scenario in scenarios:
                        cases.append(dict(id=f'{effect}-{profile}-p{owner}-d{direction}-{scenario}',effect=effect,profile=profile,owner=owner,direction=direction,hostType='pet' if pet else 'hero',colipse=collider,colipseScaleX=1 if pet else 1.2,x=350 if owner==1 else 550,y=350,scenario=scenario,duration=0 if scenario=='zero' else 2 if scenario=='short' else 120))
    if mutation!='baseline':
        target={'wrong-direction':('smjc','cycle'),'wrong-parent':('smjc','cycle'),'wrong-registration':('sxkb','cycle'),'refresh-duplicate':('smjc','refresh'),'destroy-residual':('smjc','cycle'),'freeze':('sxkb','cycle'),'advance':('sxkb','cycle')}[mutation]
        cases=[c for c in cases if (c['effect'],c['scenario'])==target and c['owner']==1 and c['direction']==0 and c['profile'] in ['monkey1','hero1']]
    if smoke:cases=[c for c in cases if c['owner']==1 and c['direction']==0 and c['profile'] in ['monkey1','hero1'] and c['scenario']=='cycle']
    return dict(task='TASK-SETTINGS-244',status='frozen-before-capture',sources=sources,cases=cases,ticks=3 if smoke else 168,pauseEnd=40,mutation=mutation,stage=[940,590],boundary='Native restored assets with original six effect branches, original FollowBaseObjectBullet, source bullet lifecycle, real Flash display API. Controlled host position/BBDC direction; collider from original StageCommon. Bodies/physics/damage excluded. Pet fade uses original easeOut under deterministic elapsed clock; no tween overlaps pause fixtures.')

def run(mutation='baseline',smoke=False):
    work,records=prepare(mutation+('-smoke' if smoke else ''))
    cfg=fixtures(smoke,mutation)
    work.joinpath('fixtures.json').write_text(json.dumps(cfg,indent=2),encoding='utf-8')
    for name in ['Probe.as']:
        shutil.copyfile(Path(__file__).with_name(name),work/name)
    if mutation=='advance':
        probe=work/'Probe.as';code=probe.read_text(encoding='utf-8')
        code=code.replace("if(cfg.mutation=='advance'){advance(c.world);}",'')
        code=code.replace(" capture('first-owner-step');"," for each(var early:Object in cases)advance(early.world);capture('first-owner-step');")
        probe.write_text(code,encoding='utf-8')
    shutil.copyfile(ROOT/'tools/turtle-visual/NativeTree.as',work/'NativeTree.as')
    work.joinpath('application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task244.'+mutation+'</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>',encoding='utf-8')
    command=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-frame-rate=24','-default-size=940,590','-output=Probe.swf','Probe.as']
    r=subprocess.run(command,cwd=work,capture_output=True,timeout=60)
    work.joinpath('compile.log').write_bytes(r.stdout+r.stderr)
    assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')
    runtime=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)]
    with work.joinpath('stdout.log').open('wb') as stdout,work.joinpath('stderr.log').open('wb') as stderr:
        r=subprocess.run(runtime,cwd=work,stdout=stdout,stderr=stderr,timeout=900)
    log=(work.joinpath('stdout.log').read_bytes()+work.joinpath('stderr.log').read_bytes()).decode(errors='replace')
    assert r.returncode==0 and 'COMPLETE ' in log,log[-3000:]
    data=json.loads(work.joinpath('measurement.json').read_text())
    assert len(data['rows'])==len(cfg['cases'])*(cfg['ticks']+2)
    for row in data['rows']:
        p=work/row['capture'];row['captureSha256']=sha(p);row['capture']=p.relative_to(ROOT).as_posix()
    data.update(fixtures=cfg,sources=records,compileCommand=command,runtimeCommand=runtime,generatedHashes={p.relative_to(work).as_posix():sha(p) for p in work.rglob('*.as')},runtimeDllSha256=sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll'))
    OUT.mkdir(parents=True,exist_ok=True)
    target=OUT/(mutation+('-smoke' if smoke else '')+'-native.json.gz')
    target.write_bytes(gzip.compress(json.dumps(data,separators=(',',':')).encode(),mtime=0))
    print(mutation,len(cfg['cases']),'fixtures',len(data['rows']),'states',target)
    return data

if __name__=='__main__':run(next((a for a in sys.argv[1:] if not a.startswith('--')),'baseline'),'--smoke' in sys.argv)
