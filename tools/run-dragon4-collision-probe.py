"""220 native oracle: unchanged trigger closure, original HitTest, frozen cases."""
import hashlib
import json
import shutil
import subprocess
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / 'local-resources/regima/task-outputs/task-settings-220'
WORK = LOCAL / 'air'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-220'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    out = OUT / 'air-original'
    out.mkdir(parents=True, exist_ok=True)
    fixtures = [dict(id='center', anchor='center', x=0, y=0),
                dict(id='disjoint', anchor='absolute', x=5000, y=5000)]
    for edge in ['left', 'right', 'top', 'bottom']:
        for overlap in [0.25, 1, 4]:
            amount = overlap if edge in ['left', 'top'] else -overlap
            fixtures.append(dict(id=f'{edge}-{overlap}', anchor=edge,
                                 x=amount if edge in ['left', 'right'] else 0,
                                 y=amount if edge in ['top', 'bottom'] else 0))
    for p in range(20):
        fixtures.append(dict(id=f'phase-{p}', anchor='root', x=p/20, y=-20+(p*7 % 20)/20))
    for owner, x, y in [('P1', 123.25, 345.75), ('P2', 731.75, 412.25)]:
        for dx in [-140, 0, 140]:
            fixtures.append(dict(id=f'{owner}-{dx}', anchor='absolute', x=x+dx, y=y-20, sourceX=x, sourceY=y))
    assert len(fixtures) == 40
    fixture_contract = dict(task='TASK-SETTINGS-220', symbols={'PetDragonBullet4':539}, frames=48,
                            directions=['left', 'right'], targetIds=[105,107,95], casesPerStateTarget=40,
                            expectedCases=11520, fixtures=fixtures,
                            note='Frozen before native measurement or candidate sampling. Original HitTest is the oracle.')
    save(OUT / 'fixtures.json', fixture_contract)
    catalog = json.loads((ROOT / 'src/assets/PetDragonAssetFiles.json').read_text(encoding='utf-8'))
    truth = json.loads((ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json').read_text(encoding='utf-8'))
    visual = next(o for o in truth['visualTruth']['displayObjects'] if o['id']=='PetDragonBullet4')
    assets=[]
    for item in catalog['files']:
        if item['objectId'] != 'PetDragonBullet4': continue
        frame = next(f for f in visual['frames'] if f['frame']==item['frame'])
        file = ROOT / ('public'+item['path'])
        assert sha(file)==item['sha256']
        name=f"trigger-{item['frame']}.png"
        shutil.copyfile(file,WORK/name)
        assets.append(dict(symbol=item['objectId'],frame=item['frame'],file=name,
                           sourcePath=file.relative_to(ROOT).as_posix(),sha256=sha(file),
                           cropX=item['cropX'],cropY=item['cropY'],
                           registrationX=frame['registrationPoint']['x'],registrationY=frame['registrationPoint']['y'],
                           maskGroup=f"frame-{item['frame']}",probeMode='trigger',captureMasks=False,
                           symbols=['PetDragonBullet4'],fixtures=fixtures))
    assert len(assets)==48
    save(WORK/'assets.json',assets)
    shutil.copyfile(LOCAL/'source.swf',WORK/'source.swf')
    hit=ROOT/'local-resources/regima/task-outputs/task-settings-218/source/scripts/my/HitTest.as'
    (WORK/'my').mkdir(exist_ok=True)
    shutil.copyfile(hit,WORK/'my/HitTest.as')
    probe=ROOT/'tools/air-collision/Dragon23Probe.as'
    shutil.copyfile(probe,WORK/'Dragon23Probe.as')
    shutil.copyfile(probe,out/'probe.as.txt')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task220.collisionprobe</id><versionNumber>1.0.0</versionNumber><filename>Dragon23Probe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>Dragon23Probe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
          '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=Dragon23Probe.swf','Dragon23Probe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (out/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result=subprocess.run(command,cwd=WORK,capture_output=True,timeout=600)
    (out/'stdout.log').write_bytes(result.stdout);(out/'stderr.log').write_bytes(result.stderr)
    lines=(result.stdout+b'\n'+result.stderr).decode('utf-8',errors='replace').splitlines()
    assert result.returncode==0 and 'COMPLETE 11520 48' in lines,'\n'.join(lines[-12:])
    actual=[json.loads(line[5:]) for line in lines if line.startswith('CASE ')]
    trees=[json.loads(line[5:]) for line in lines if line.startswith('TREE ')]
    assert len(actual)==11520 and len(trees)==48
    hashes={}
    names={'buffers':{r['id']+'.png' for r in actual if r['intersection']['width']>=1 and r['intersection']['height']>=1},
           'stage-baselines':{f'PetDragonBullet4-{f}-{d}.png' for f in range(1,49) for d in ['left','right']}}
    for folder,files in names.items():
        (out/folder).mkdir(exist_ok=True);hashes[folder]={}
        for name in sorted(files):
            shutil.copyfile(WORK/folder/name,out/folder/name);hashes[folder][name]=sha(out/folder/name)
    for asset in assets: asset.pop('fixtures')
    save(out/'measurement.json',dict(status='measured-not-promoted',exitCode=result.returncode,command=command,compileCommand=args,
         environment=[json.loads(l[4:]) for l in lines if l.startswith('ENV ')],
         probeSha256=sha(probe),probeSwfSha256=sha(WORK/'Dragon23Probe.swf'),sourceSubsetSha256=sha(LOCAL/'source.swf'),
         originalHitTestPath=hit.relative_to(ROOT).as_posix(),originalHitTestSha256=sha(hit),
         runtimeDllSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),fixtureSha256=sha(OUT/'fixtures.json'),
         assets=assets,trees=trees,actual=actual,artifactHashes=hashes))
    print('220 native: 48 frames, 11520 cases; PNG/original boolean differences:',sum(a['actual']!=a['productionActual'] for a in actual))
    runpy.run_path(str(ROOT/'tools/dragon4-oracle-buffers.py'))['pack']()


if __name__=='__main__': main()
