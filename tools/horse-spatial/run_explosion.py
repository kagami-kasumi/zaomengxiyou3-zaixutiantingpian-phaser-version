"""Native original TweenMax scheduling of the original horse explosion callback."""
import json
import subprocess
import sys
from prepare_explosion import ROOT,BASE,WORK,OUT
from run_lifecycle import SDK,sha

def main():
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    template=ROOT/'tools/horse-spatial/JointProbe.as';code=template.read_text().replace('JointProbe','ExplosionProbe')
    code=code.replace('import base.*;','import base.*;import com.greensock.TweenMax;')
    marker='if(index==2){';code=code.replace(marker,marker+'TweenMax.backend=loader.contentLoaderInfo.applicationDomain.getDefinition("com.greensock.TweenMax") as Class;')
    begin=code.index('            for each(var spec:Object in config.bodies.forms)')
    end=code.index('            trace("ENV',begin)
    code=code[:begin]+'''            for(var skills:int=0;skills<8;skills++)for each(var owner:int in [1,2])for each(var mode:String in ["alive","dead-before","dead-after","ready-only","move-reference"])addCase(config.bodies.forms[3],"hit5",owner,skills,mode);
'''+code[end:]
    code=code.replace('owner:int,skills:int):void','owner:int,skills:int,mode:String):void')
    code=code.replace('actor:actor,births:', 'mode:mode,actor:actor,births:').replace('+"-"+skills,actor:', '+"-"+skills+"-"+mode,actor:')
    # The mode field is inserted before actor, so match the resulting literal.
    code=code.replace('+"-"+skills,mode:', '+"-"+skills+"-"+mode,mode:')
    code=code.replace('cases.push({id:', 'actor.auditId=spec.form+"-"+action+"-P"+owner+"-"+skills+"-"+mode;cases.push({id:')
    code=code.replace('actor.bbdc.step();','''actor.bbdc.step();
                if(tick==6){
                    if(item.mode=="dead-before")actor.dead=true;
                    var falling:BaseBullet=actor.magicBulletArray[1];item.falling=falling;
                    actor.observeSuccessfulHit(falling);falling.destroy();
                }
                if(tick==8&&item.mode=="dead-after")actor.dead=true;
                if(tick==8&&item.mode=="ready-only")actor.isReadyToDestroy=true;
                if(tick==9&&item.mode=="move-reference"){item.falling.x+=23;item.falling.y+=11;}''')
    code=code.replace('tick++;','tick++;TweenMax.tick=tick;')
    code=code.replace('state.birthTick=item.births[i];','state.birthTick=bullet.observedBirthTick>=0?bullet.observedBirthTick:item.births[i];')
    code=code.replace('if(tick==160)','if(tick==config.fps*2+15)')
    code=code.replace('trace("COMPLETE "+rows.length);','fs.open(new File(File.applicationDirectory.nativePath).resolvePath("delays.json"),FileMode.WRITE);fs.writeUTFBytes(JSON.stringify(TweenMax.events));fs.close();trace("COMPLETE "+rows.length);')
    probe=WORK/'ExplosionProbe.as';probe.write_text(code)
    sources=json.loads((OUT/'source-definitions.json').read_text())['sources']
    paths=[str(ROOT/s['path']) for s in sources]+[str(BASE/'body-air/body-source.swf')]
    (WORK/'fixtures.json').write_text(json.dumps(dict(fps=fps,sources=[dict(path=p) for p in paths],bodies=json.loads((OUT/'body-inputs.json').read_text()))))
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.explosion</id><versionNumber>1.0.0</versionNumber><filename>ExplosionProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>ExplosionProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=ExplosionProbe.swf','ExplosionProbe.as']
    r=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(r.stdout+r.stderr)
    assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:r=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=90)
    lines=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    assert r.returncode==0 and any(l.startswith('COMPLETE ') for l in lines),'\n'.join(lines[-12:])
    rows=json.loads((WORK/'rows.json').read_text());delays=json.loads((WORK/'delays.json').read_text())
    assert len(rows)==80*2*(fps*2+15)
    report=dict(status='measured-not-promoted',fps=fps,rows=rows,delays=delays,environment=[json.loads(l[4:]) for l in lines if l.startswith('ENV ')],probeSha256=sha(probe),compiledSha256=sha(WORK/'ExplosionProbe.swf'),methodsSha256=sha(OUT/'explosion-methods.json'),pet1Sha256=sha(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf'),scope='Original hit5Hit after a controlled successful-hit boundary; original pet1 TweenMax wall-clock callback, parent dead/ready flags and moved bullet reference. Actual collision/HP/death caller remain separate.')
    (WORK/f'measurement-{fps}.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('229 explosion',fps,len(rows),'rows',len(delays),'native delays')

if __name__=='__main__':main()
