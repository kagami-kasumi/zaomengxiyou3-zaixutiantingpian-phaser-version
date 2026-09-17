"""Feed actual native collision outcomes into original BaseBullet hit-registry code."""
import importlib.util
import json
import subprocess
import sys
from run import ROOT,OUT,WORK,SDK,sha,save


def main():
    work=WORK.parent/'registry';work.mkdir(parents=True,exist_ok=True)
    sys.path.insert(0,str(ROOT/'tools/turtle-source'))
    spec=importlib.util.spec_from_file_location('turtle_hit',ROOT/'tools/turtle-source/hit.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    sources=module.prepare(work)
    native=json.loads((WORK.parent/'dynamic-call/collision-measurement.json').read_text())
    behavior=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json').read_text(encoding='utf-8'))
    groups={}
    for row in native['cases']:
        key=f"{row['scenario']}-b{row['bulletIndex']}-t{row['targetIndex']}-{row['fixture']}"
        form=int(row['scenario'].split('-')[1]);action='hit1' if row['symbol'] in ['PetTurtle1Bullet1','PetTurtle2Bullet1'] else ('hit2' if row['symbol']=='PetTurtle1Bullet2' else 'hit3')
        group=groups.setdefault(key,dict(id=key,form=form,action=action,interval=behavior['forms'][form-1]['attacksAt24Fps'][action]['attackInterval'],inputs=[]))
        group['inputs'].append(dict(id=row['id'],tick=row['tick'],hit=row['actual']))
    fixture=dict(groups=list(groups.values()),nativeSha256=sha(WORK.parent/'dynamic-call/collision-measurement.json'),sources=sources)
    save(OUT/'registry-fixtures.json',fixture);save(work/'fixtures.json',fixture)
    code='''package {import flash.display.Sprite;import flash.filesystem.*;import flash.desktop.NativeApplication;
public class RegistryProbe extends Sprite {public function RegistryProbe(){try{run();trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}catch(e:Error){trace('FAIL '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
private function run():void {var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath('fixtures.json'),FileMode.READ);var data:Object=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();
for each(var group:Object in data.groups){var b:HitBullet=new HitBullet();b.attackInterval=group.interval;var target:Object={beAttackIdArray:[],calls:0,accept:false};target.beMagicAttack=function(b:Object,p:Object):Boolean{target.calls++;return target.accept;};b.gc.pWorld.monsterArray=[target];
for each(var input:Object in group.inputs){target.accept=input.hit;b.checkAttack();trace('REGISTRY '+JSON.stringify({id:input.id,attackId:b.id,count:b.maxAttackCount,calls:target.calls,seen:target.beAttackIdArray.concat(),refresh:b.refresh}));}}}}}'''
    (work/'RegistryProbe.as').write_text(code)
    (work/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>turtle222b.registry</id><versionNumber>1.0.0</versionNumber><filename>RegistryProbe</filename><initialWindow><content>RegistryProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
    command=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=RegistryProbe.swf','RegistryProbe.as']
    result=subprocess.run(command,cwd=work,capture_output=True,timeout=60);assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    native_command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]
    result=subprocess.run(native_command,cwd=work,capture_output=True,timeout=120);log=(result.stdout+result.stderr).decode(errors='replace');(work/'native.log').write_text(log)
    assert result.returncode==0 and 'COMPLETE' in log,log[-1000:]
    rows=[json.loads(l[9:]) for l in log.splitlines() if l.startswith('REGISTRY ')]
    lookup={r['id']:r for r in rows};assert len(lookup)==len(rows)==sum(len(g['inputs']) for g in groups.values())
    hits=0
    for g in groups.values():
        seen=set();calls=0
        for index,input in enumerate(g['inputs']):
            attack_id=index//g['interval']
            if attack_id not in seen:
                calls+=1
                if input['hit']:seen.add(attack_id);hits+=1
            assert lookup[input['id']]==dict(id=input['id'],attackId=attack_id,count=99-len(seen),calls=calls,seen=['attack-'+str(i) for i in sorted(seen)],refresh=len(seen)),input['id']
    save(OUT/'registry-verification.json',dict(status='passed',groups=len(groups),cases=len(rows),acceptedHits=hits,
         fixtureSha256=sha(OUT/'registry-fixtures.json'),sources=sources,compileCommand=command,command=native_command,rows=rows,
         boundary='Actual native geometry booleans replayed through original registry; controlled sequential callbacks, not a full-game scheduler or modern damage implementation.'))
    print('Native collision -> source registry:',len(groups),'groups,',len(rows),'callbacks,',hits,'accepted hits')


if __name__=='__main__':main()
