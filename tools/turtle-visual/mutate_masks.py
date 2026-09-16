"""Native render mutation: remove only timeline clipDepth, with XML round-trip control."""
import hashlib
import json
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/mask-air'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
FFDEC=['java','-Xmx2g','-jar','C:/Program Files (x86)/FFDec/ffdec.jar']


def run(args):
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=90)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    frozen=json.loads((OUT/'effects-fixtures.json').read_text(encoding='utf-8'))
    sources=[];effects=[];mutations=[]
    for symbol,target in [('AoyiBuff',120),('PetTurtle1Bullet2',503)]:
        effect=next(e for e in frozen['effects'] if e['symbol']==symbol)
        original=next(s for s in frozen['sources'] if s['id']==effect['owner'])
        xml=WORK/(symbol+'.xml');run(FFDEC+['-swf2xml',original['path'],str(xml)])
        control=WORK/(symbol+'-control.swf');run(FFDEC+['-xml2swf',str(xml),str(control)])
        tree=ET.parse(xml);changes=[]
        sprite=next(n for n in tree.getroot().iter() if n.get('spriteId')==str(target))
        for node in sprite.iter():
            if node.get('placeFlagHasClipDepth')=='true':
                changes.append(dict(depth=node.get('depth'),clipDepth=node.get('clipDepth')))
                node.set('placeFlagHasClipDepth','false');node.set('clipDepth','0')
        assert changes
        changed_xml=WORK/(symbol+'-mutant.xml');tree.write(changed_xml,encoding='utf-8',xml_declaration=True)
        mutant=WORK/(symbol+'-mutant.swf');run(FFDEC+['-xml2swf',str(changed_xml),str(mutant)])
        for variant,path in [('original',Path(original['path'])),('control',control),('mutant',mutant)]:
            key=symbol+'-'+variant
            sources.append(dict(id=key,path=str(path)))
            effects.append(dict(symbol=key,owner=key,sourceIndex=effect['sourceIndex'],scales=[1]))
        mutations.append(dict(symbol=symbol,spriteId=target,changes=changes,originalSha256=original['sha256'],controlSha256=hashlib.sha256(control.read_bytes()).hexdigest(),mutantSha256=hashlib.sha256(mutant.read_bytes()).hexdigest()))
    (WORK/'fixtures.json').write_text(json.dumps(dict(sources=sources,effects=effects,ticks=31)),encoding='utf-8')
    shutil.copyfile(ROOT/'tools/turtle-visual/VisualProbe.as',WORK/'VisualProbe.as')
    app=(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/effects-air/application.xml').read_text(encoding='utf-8').replace('regima.task222a.visual','regima.task222a.maskmutation')
    (WORK/'application.xml').write_text(app,encoding='utf-8')
    run(['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-frame-rate=24','-default-size=940,590','-output=VisualProbe.swf','VisualProbe.as'])
    if '--verify' not in sys.argv:
        with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
            result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
        assert result.returncode==0
    log='\n'.join((WORK/name).read_text(encoding='utf-8',errors='replace') for name in ['stdout.log','stderr.log']);assert 'COMPLETE 31 6' in log and 'FAIL ' not in log
    states=[json.loads(line[6:]) for line in log.splitlines() if line.startswith('STATE ')]
    measured={(s['symbol'],s['tick']):s for s in states}
    checks=[]
    for symbol in ['AoyiBuff','PetTurtle1Bullet2']:
        unchanged=[];changed=[]
        for tick in range(32):
            images=[]
            for variant in ['original','control','mutant']:
                state=measured[(symbol+'-'+variant,tick)]
                images.append([(WORK/b['path']).read_bytes() for b in state['baselines']])
            if images[0]!=images[1]:unchanged.append(tick)
            if images[0]!=images[2]:changed.append(tick)
        witnesses=[]
        if changed:
            for variant in ['original','control','mutant']:
                baseline=measured[(symbol+'-'+variant,changed[0])]['baselines'][0]
                content=(WORK/baseline['path']).read_bytes();digest=hashlib.sha256(content).hexdigest()
                target_png=OUT/'native-baselines'/(digest+'.png');target_png.write_bytes(content)
                witnesses.append(dict(variant=variant,tick=changed[0],path=target_png.relative_to(ROOT).as_posix(),sha256=digest))
        checks.append(dict(symbol=symbol,roundTripMismatchTicks=unchanged,mutationChangedTicks=changed,rejected=not unchanged and bool(changed),witnesses=witnesses))
    report=dict(status='passed-bounded-check' if all(c['rejected'] for c in checks) else 'failed',mutations=mutations,checks=checks,states=len(states),probeSha256=hashlib.sha256((WORK/'VisualProbe.as').read_bytes()).hexdigest())
    (OUT/'mask-mutations.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report));assert all(c['rejected'] for c in checks)


if __name__=='__main__':main()
