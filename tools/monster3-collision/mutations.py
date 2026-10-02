"""Execute real compiled source and loaded display-tree mutants in isolated fixtures."""
import hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-248'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def main():
 results=[]
 for attack in [1,2]:
  original=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-248/attack{attack}/air'
  baseline={r['id']:r for r in read(OUT/f'attack{attack}/native.json')['cases']}
  for variant in ['source-predicate','remove-child']:
   work=original.parent/'mutants'/variant;work.mkdir(parents=True,exist_ok=True)
   for name in ['source.swf','common.swf','my/HitTest.as','AUtils.as']:
    (work/name).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original/name,work/name)
   config=read(original/'fixtures.json');config['cases']=[c for c in config['cases'] if c['id'] in ['center','disjoint','grid-0-0-0','grid-40-60-0.5','left-8-0']];config.pop('diagnostics',None)
   (work/'fixtures.json').write_text(json.dumps(config),encoding='utf-8')
   probe=(HERE/'Probe.as').read_text(encoding='utf-8')
   probe=probe.replace("trace('MASK '+JSON.stringify(Spatial.field(wrapper,id,frame,sign)));",'')
   probe=probe.replace("trace('MASK '+JSON.stringify(Spatial.field(target,profile.id,0,profile.scaleX)));",'')
   if variant=='remove-child':probe=probe.replace("trace('TREE '+JSON.stringify({frame:frame,tree:Spatial.tree(movie)}));", "trace('TREE '+JSON.stringify({frame:frame,tree:Spatial.tree(movie)})); if(movie.numChildren)movie.removeChildAt(0);")
   else:
    p=work/'my/HitTest.as';s=p.read_text(encoding='utf-8');assert s.count('.width != 0;')==1;p.write_text(s.replace('.width != 0;','.width == 0;'),encoding='utf-8')
   (work/'Probe.as').write_text(probe,encoding='utf-8')
   (work/'application.xml').write_text(f'<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task248.mutation.a{attack}.{variant}</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>',encoding='utf-8')
   commands=[['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-size=940,590','-output=Probe.swf','Probe.as'],[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]]
   for label,cmd in zip(['compile','run'],commands):
    p=subprocess.run(cmd,cwd=work,capture_output=True,timeout=180);log=(p.stdout+p.stderr).decode(errors='replace');(work/f'{label}.log').write_text(log,encoding='utf-8');assert p.returncode==0,log[-1500:]
   assert 'COMPLETE' in log and '51,1,1,5' in log
   rows=[json.loads(s[5:]) for s in log.splitlines() if s.startswith('CASE ')];assert len(rows)==config['frames']*2*4*len(config['cases'])
   changed=[r['id'] for r in rows if r['hit']!=baseline[r['id']]['hit']];assert changed,(attack,variant)
   results.append(dict(attack=attack,variant=variant,cases=len(rows),hitChanges=len(changed),witness=changed[0],compileExit=0,runExit=0,probeSha256=hashlib.sha256(probe.encode()).hexdigest(),hitTestSha256=hashlib.sha256((work/'my/HitTest.as').read_bytes()).hexdigest()))
 (OUT/'native-mutations.json').write_text(json.dumps(dict(status='passed',results=results),indent=2)+'\n',encoding='utf-8');print(json.dumps(results))
if __name__=='__main__':main()
