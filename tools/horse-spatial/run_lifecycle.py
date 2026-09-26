"""Native host sampling for horse-specific source constructor/setter variants."""
import hashlib
import json
import shutil
import subprocess
import sys
from prepare_lifecycle import ROOT,WORK,OUT

SDK=ROOT.__class__('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def specs():
    rows=[]
    for symbol,kind,hurt in [('PetHorse1Bullet1','special',False),('PetHorse1Bullet2','follow',True),
      ('PetHorse1Bullet2','special',False),('PetHorse2Bullet1','special',False),('PetHorse2Bullet2','follow',False),
      ('PetHorse3Bullet1','special',False),('PetHorse3Bullet2','follow',False),('PetHorse3Bullet3','special',False),
      ('PetHorse3Bullet4','special',False),('PetHorse4Bullet5','enemy',False),
      ('PetHorse4Bullet5','tracking',False),('PetHorse4Bullet5Explode','special',False),('AoyiBuff','follow',True)]:
        rows.append(dict(id=symbol+'_'+kind,symbol=symbol,kind=kind,follow=kind=='follow',cut=hurt,disabled=symbol=='AoyiBuff'))
    return rows

def driver():
    source=ROOT/'tools/monkey-spatial/LifecycleProbe.as'
    text=source.read_text(encoding='utf-8')
    def replace(old,new):
        nonlocal text
        assert old in text,old
        text=text.replace(old,new)
    replace('var loader:Loader=new Loader();','trace("LOAD "+config.sources[index].path);var loader:Loader=new Loader();')
    replace('loader.unload();index++;next();','if(config.sources[index].isolated){for each(var n:String in ["PetHorse4Bullet5","PetHorse4Bullet5Explode"])AUtils.sourceClasses[n]=loader.contentLoaderInfo.applicationDomain.getDefinition(n);}loader.unload();index++;next();')
    replace('new LoaderContext(false,ApplicationDomain.currentDomain)','new LoaderContext(false,config.sources[index].isolated?new ApplicationDomain(null):ApplicationDomain.currentDomain)')
    replace('var bullet:BaseBullet=spec.follow?', 'var bullet:BaseBullet=(spec.kind=="enemy"||spec.kind=="tracking")?new EnemyMoveBullet(spec.symbol):spec.follow?')
    replace('if(spec.xj){bullet.setDestroyWhenLastFrame(false);bullet.setHurtCanCutDownEffect(false);bullet.setDestroyInCount(config.fps*4);}', '''bullet.setHurtCanCutDownEffect(spec.cut);
                var target:BaseObject=new BaseObject();target.id="target-"+owner;target.x=source.x+80;target.y=350;
                if(bullet is EnemyMoveBullet){
                    bullet.y=50;bullet.setDirect(0);bullet.setDestroyWhenLastFrame(false);bullet.setDestroyInCount(config.fps*10);
                    EnemyMoveBullet(bullet).setDistance(2000);EnemyMoveBullet(bullet).setSpeed(0,1);EnemyMoveBullet(bullet).setAddSpeed(0,1);
                    if(spec.kind=="tracking")EnemyMoveBullet(bullet).setMoveTarget(target);
                }''')
    replace('id:spec.symbol+"-"','id:spec.id+"-"')
    replace('spec:spec,source:source,bullet:bullet,mode:mode','spec:spec,source:source,bullet:bullet,mode:mode,target:target')
    replace('var before:Object=bullet.snapshot();','''if(tick==6){item.target.x-=160;item.target.y-=60;}
                if(tick==9)item.target.dead=true;
                var before:Object=bullet.snapshot();''')
    replace('source:{x:source.x,y:source.y,a:source.scaleX,action:source.curAction},before:',
            'target:{x:item.target.x,y:item.target.y,dead:item.target.dead},source:{x:source.x,y:source.y,a:source.scaleX,action:source.curAction},before:')
    replace('config.fps*4+8','config.fps*10+8')
    return source,text

def main():
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    source,text=driver();probe=WORK/'LifecycleProbe.as';probe.write_text(text,encoding='utf-8')
    shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',WORK/'NativeTree.as')
    data=json.loads((OUT/'source-definitions.json').read_text())
    fixture=dict(fps=fps,sources=[dict(path=str(ROOT/s['path']),sha256=s['sha256'],isolated=s['id']=='pet1') for s in data['sources']],effects=specs())
    (WORK/'fixtures.json').write_text(json.dumps(fixture),encoding='utf-8')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.lifecycle</id><versionNumber>1.0.0</versionNumber><filename>LifecycleProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>LifecycleProbe.swf</content><visible>false</visible><width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-size=940,590','-output=LifecycleProbe.swf','LifecycleProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:
        result=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=180)
    lines=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    assert result.returncode==0 and any(line.startswith('COMPLETE ') for line in lines),'\n'.join(lines[-12:])
    rows=json.loads((WORK/'rows.json').read_text());phases=json.loads((WORK/'native-phases.json').read_text())
    assert len(rows)==len(specs())*16*(1+2*(fps*10+8))
    for phase in phases.values():phase['sha256']=sha(WORK/phase['path'])
    report=dict(status='measured-not-promoted',fixtures=fixture,rows=rows,nativePhases=phases,
        environment=[json.loads(line[4:]) for line in lines if line.startswith('ENV ')],
        probeSha256=sha(probe),templateSha256=sha(source),compiledSha256=sha(WORK/'LifecycleProbe.swf'),methodsSha256=sha(OUT/'lifecycle-methods.json'),command=command,compileCommand=args,
        scope='Actual native stage host; original bullet lifecycle with controlled source/target. Actual horse body creation, collision, damage and delayed explosions require separate evidence.')
    (WORK/f'measurement-{fps}.json').write_text(json.dumps(report,separators=(',',':'))+'\n',encoding='utf-8')
    print('229 lifecycle',fps,'fps',len(rows),'rows',len(phases),'recursive phases')

if __name__=='__main__':main()
