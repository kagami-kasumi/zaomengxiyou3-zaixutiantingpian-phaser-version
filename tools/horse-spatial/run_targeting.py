"""Original doHit5 over empty, reordered, multi-target and dead-target arrays."""
import json
import shutil
import subprocess
import sys
from prepare_explosion import ROOT,BASE,OUT
from run_lifecycle import SDK,sha

WORK=BASE/'targeting-air'

def main():
    WORK.mkdir(parents=True,exist_ok=True)
    for source in (BASE/'joint-air').rglob('*.as'):
        if source.name.endswith('Probe.as'):continue
        dest=WORK/source.relative_to(BASE/'joint-air');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    template=ROOT/'tools/horse-spatial/JointProbe.as';code=template.read_text().replace('JointProbe','TargetingProbe')
    a=code.index('            for each(var spec:Object in config.bodies.forms)');b=code.index('            trace("ENV',a)
    code=code[:a]+'''for(var skills:int=0;skills<8;skills++)for each(var owner:int in [1,2])for each(var mode:String in ["empty","three","reordered","dead-target"])addCase(config.bodies.forms[3],"hit5",owner,skills,mode);
'''+code[b:]
    code=code.replace('owner:int,skills:int):void','owner:int,skills:int,mode:String):void')
    a=code.index('            var target:FixtureTarget=');b=code.index('            if(skills>=0)',a)
    code=code[:a]+'''var targets:Array=[],ids:Array=[];var names:Array=mode=="reordered"?["C","A","B"]:["A","B","C"];
for each(var name:String in names){if(mode=="empty")break;var target:FixtureTarget=new FixtureTarget();target.x=name=="A"?100:name=="B"?470:900;target.y=350;target.id="P"+owner+name;target.dead=mode=="dead-target"&&name=="B";actor.gc.gameSence.addChild(target);targets.push(target);ids.push(target.id);}
actor.gc.pWorld.monsterArray=targets;
'''+code[b:]
    code=code.replace('+"-"+skills,actor:', '+"-"+skills+"-"+mode,mode:mode,inputIds:ids,actor:')
    code=code.replace('body:{row:', 'inputIds:item.inputIds,attackInfo:actor.attackBackInfoDict["hit5_1"],body:{row:')
    code=code.replace('if(tick==160)','if(tick==8)')
    probe=WORK/'TargetingProbe.as';probe.write_text(code)
    sources=json.loads((OUT/'source-definitions.json').read_text())['sources'];paths=[str(ROOT/s['path']) for s in sources]+[str(BASE/'body-air/body-source.swf')]
    (WORK/'fixtures.json').write_text(json.dumps(dict(fps=fps,sources=[dict(path=p) for p in paths],bodies=json.loads((OUT/'body-inputs.json').read_text()))))
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.targeting</id><versionNumber>1.0.0</versionNumber><filename>TargetingProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>TargetingProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=TargetingProbe.swf','TargetingProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=90)
    lines=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    assert result.returncode==0 and any(l.startswith('COMPLETE ') for l in lines),'\n'.join(lines[-10:])
    rows=json.loads((WORK/'rows.json').read_text());assert len(rows)==64*16
    report=dict(status='measured-not-promoted',fps=fps,rows=rows,probeSha256=sha(probe),compiledSha256=sha(WORK/'TargetingProbe.swf'),methodsSha256=sha(OUT/'joint-methods.json'),scope='Original doHit5 allocation and first EnemyMove steps against controlled array identities/order/dead flags; no target selection AI, actual hit or damage claim.')
    (WORK/f'measurement-{fps}.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('229 targeting',fps,len(rows),'rows')

if __name__=='__main__':main()
