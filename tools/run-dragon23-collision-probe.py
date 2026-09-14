"""Native playback of four unchanged source-tag effect closures plus original HitTest."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
LOCAL=ROOT/'local-resources/regima/task-outputs/task-settings-219'
WORK=LOCAL/'air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-219'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
SYMBOLS=['PetDragon2Bullet1','PetDragon2Bullet2','PetDragon3Bullet1','PetDragon3Bullet3']


def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    original='--sdk-runtime' not in sys.argv
    geometry_only='--geometry-only' in sys.argv
    edge_only='--edge-only' in sys.argv
    roots_only='--roots-only' in sys.argv
    assert sum([geometry_only,edge_only,roots_only])<=1
    out=OUT/('air-original' if original else 'air-sdk')
    if geometry_only:out=OUT/'geometry-probe'
    if edge_only:out=OUT/'edge-probe'
    if roots_only:out=OUT/'roots-probe'
    WORK.mkdir(parents=True,exist_ok=True);out.mkdir(parents=True,exist_ok=True)
    catalog=json.loads((ROOT/'src/assets/PetDragonAssetFiles.json').read_text(encoding='utf-8'))
    truth=json.loads((ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json').read_text(encoding='utf-8'))
    assets=[]
    source_states=json.loads((OUT/'source-display-list.json').read_text(encoding='utf-8'))['states']
    groups={};group_by_state={}
    for state in source_states:
        key=json.dumps([{k:c[k] for k in ('characterId','path','matrix','alpha','colorTransform','filters','blendMode')}
                        for c in state['displayList']],sort_keys=True)
        if key not in groups:groups[key]=f'group-{len(groups):02d}'
        group_by_state[(state['symbol'],state['frame'])]=groups[key]
    for item in catalog['files']:
        if item['objectId'] not in SYMBOLS: continue
        frame=next(f for o in truth['visualTruth']['displayObjects'] if o['id']==item['objectId'] for f in o['frames'] if f['frame']==item['frame'])
        name=f"{item['objectId']}-{item['frame']}.png"
        source=ROOT/'public'/item['path'].lstrip('/')
        shutil.copyfile(source,WORK/name)
        assets.append(dict(symbol=item['objectId'],frame=item['frame'],file=name,cropX=item['cropX'],cropY=item['cropY'],
                           registrationX=frame['registrationPoint']['x'],registrationY=frame['registrationPoint']['y'],
                           sourcePath=source.relative_to(ROOT).as_posix(),sha256=sha(source),
                           maskGroup=group_by_state[(item['objectId'],item['frame'])],
                           probeMode='geometry' if geometry_only else 'edge' if edge_only else 'roots' if roots_only else 'full'))
    assert len(assets)==76
    (WORK/'assets.json').write_text(json.dumps(assets),encoding='utf-8')
    shutil.copyfile(LOCAL/'source.swf',WORK/'source.swf')
    (WORK/'my').mkdir(exist_ok=True)
    hit=ROOT/'local-resources/regima/task-outputs/task-settings-218/source/scripts/my/HitTest.as'
    shutil.copyfile(hit,WORK/'my/HitTest.as')
    probe=ROOT/'tools/air-collision/Dragon23Probe.as'
    shutil.copyfile(probe,WORK/'Dragon23Probe.as')
    shutil.copyfile(probe,out/'probe.as.txt')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task219.collisionprobe</id><versionNumber>1.0.0</versionNumber><filename>Dragon23Probe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>Dragon23Probe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''',encoding='utf-8')
    compile_args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
                  '-debug=true','-default-frame-rate=24','-default-size=940,590','-output=Dragon23Probe.swf','Dragon23Probe.as']
    result=subprocess.run(compile_args,cwd=WORK,capture_output=True,timeout=60)
    (out/'compile.log').write_bytes(result.stdout+result.stderr)
    if result.returncode: raise RuntimeError((result.stdout+result.stderr).decode(errors='replace'))
    args=[str(SDK/'bin/adl.exe'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    runtime=ROOT/'local-resources/regima/source/unpacked'
    if original: args[1:1]=['-runtime',str(runtime)]
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=600)
    (out/'stdout.log').write_bytes(result.stdout);(out/'stderr.log').write_bytes(result.stderr)
    lines=(result.stdout+b'\n'+result.stderr).decode('utf-8',errors='replace').splitlines()
    expected_cases=0 if geometry_only else 1280 if edge_only else 304 if roots_only else 4864
    if result.returncode or f'COMPLETE {expected_cases} 76' not in lines:
        raise RuntimeError('Native probe incomplete: '+str(result.returncode)+'\n'+'\n'.join(lines[-10:]))
    actual=[json.loads(line[5:]) for line in lines if line.startswith('CASE ')]
    trees=[json.loads(line[5:]) for line in lines if line.startswith('TREE ')]
    fields=[json.loads(line[5:]) for line in lines if line.startswith('MASK ')]
    if geometry_only:
        assert len(trees)==76
        (out/'measurement.json').write_text(json.dumps(dict(trees=trees,command=args,probeSha256=sha(probe)),indent=2)+'\n',encoding='utf-8')
        translations=[json.loads(line[12:]) for line in lines if line.startswith('TRANSLATION ')]
        assert len(translations)==1
        artifact_hashes={}
        for name in ['original.png','bitmap-source.png','colored-source.png']:
            shutil.copyfile(WORK/'diagnostic'/name,out/name)
            artifact_hashes[name]=sha(out/name)
        from PIL import Image,ImageChops
        reference=OUT/'air-original/buffers/PetDragon3Bullet1-3-right-t0-phase-3.png'
        assert reference.exists(), 'Run the full original oracle before this diagnostic.'
        difference=ImageChops.difference(Image.open(out/'original.png').convert('RGB'),Image.open(reference).convert('RGB'))
        assert not difference.getbbox(), 'Source-only diagnostic must equal the original HitTest fixture.'
        experiment=dict(status='measured-not-promoted',caseId='PetDragon3Bullet1-3-right-t0-phase-3',
            geometryProbe=sha(probe),translationExperiments=translations[0],sourceOnlyVsHitTestBufferDifferentPixels=0,
            conclusion='Integer translation of a rasterized rotated source is not bitwise invariant in original AIR. A fractional-phase mask plus integer crop is not an exact general collision sampler.',
            unresolved=['Texture sampling after inverse-transform quantization; no runtime rule promoted.'],artifacts=artifact_hashes)
        (out/'translation-experiment.json').write_text(json.dumps(experiment,indent=2)+'\n',encoding='utf-8')
        print('219 geometry probe: 76 native recursive trees')
        return
    if edge_only or roots_only:
        assert len(actual)==expected_cases and len(trees)==76 and not fields
        (out/'buffers').mkdir(exist_ok=True)
        hashes={}
        for item in actual:
            if item['intersection']['width']<1 or item['intersection']['height']<1:continue
            name=item['id']+'.png';shutil.copyfile(WORK/'buffers'/name,out/'buffers'/name)
            hashes[name]=sha(out/'buffers'/name)
        report=dict(status='measured-not-promoted',actual=actual,assets=assets,trees=trees,command=args,
                    probeSha256=sha(probe),sourceSubsetSha256=sha(LOCAL/'source.swf'),artifactHashes=hashes)
        (out/'measurement.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
        print(f'219 held-out {"roots" if roots_only else "edge"} probe: {expected_cases} original HitTest cases')
        return
    assert len(actual)==4864 and len(trees)==76
    assert len(fields)==len(groups)*2
    expected_buffers={r['id']+'.png' for r in actual if r['intersection']['width']>=1 and r['intersection']['height']>=1}
    hashes={}
    for folder,names in [('buffers',expected_buffers),('stage-baselines',{f'{t["symbol"]}-{t["frame"]}-{d}.png' for t in trees for d in ['left','right']})]:
        (out/folder).mkdir(exist_ok=True)
        hashes[folder]={}
        for name in sorted(names):
            shutil.copyfile(WORK/folder/name,out/folder/name)
            hashes[folder][name]=sha(out/folder/name)
    (out/'mask-fields').mkdir(exist_ok=True)
    for field in fields:
        name=field['id']+'.deflate'
        shutil.copyfile(WORK/'mask-fields'/name,out/'mask-fields'/name)
        field['sha256']=sha(out/'mask-fields'/name)
    report=dict(status='measured-not-promoted',exitCode=result.returncode,command=args,compileCommand=compile_args,
                environment=[json.loads(line[4:]) for line in lines if line.startswith('ENV ')],
                probeSha256=sha(probe),probeSwfSha256=sha(WORK/'Dragon23Probe.swf'),sourceSubsetSha256=sha(LOCAL/'source.swf'),
                originalHitTestPath=hit.relative_to(ROOT).as_posix(),originalHitTestSha256=sha(hit),
                assets=assets,trees=trees,maskFields=fields,actual=actual,artifactHashes=hashes)
    if original:report['runtimeDllSha256']=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll')
    (out/'measurement.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    differences=sum(r['actual']!=r['productionActual'] for r in actual)
    print(f'219 native: {len(trees)} frames, {len(actual)} cases, source/production boolean differences={differences}')


if __name__=='__main__':main()
