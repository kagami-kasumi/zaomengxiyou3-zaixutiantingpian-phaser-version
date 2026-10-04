"""Control branch roster: execute source Config.getPlayerArray, never a hand-written filter."""
import hashlib,json,shutil,subprocess
import selection
from pathlib import Path
ROOT=selection.ROOT;HERE=selection.HERE;OUT=selection.OUT

def run():
 work,records=selection.prepare('roster')
 shutil.copyfile(HERE/'RosterProbe.as',work/'Probe.as')
 commands=[['java','-Dflexlib='+str(selection.body.base.SDK/'frameworks'),'-jar',str(selection.body.base.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],[str(selection.body.base.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]]
 for label,cmd in zip(['compile','run'],commands):
  r=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60);log=(r.stdout+r.stderr).decode(errors='replace');(work/(label+'.log')).write_text(log,encoding='utf-8');assert r.returncode==0,log[-2200:]
 assert 'COMPLETE' in log and '51,1,1,5' in log
 rows=json.loads((work/'rows.json').read_text(encoding='utf-8'));assert len(rows)==102
 for r in rows:
  if r.get('kind')=='door':
   assert r['visible']==(r['boss'] and r['other']!='alive');continue
  expected=[dict(tick=7,target=p,duration=1,x=300,y=150) for p in ['p1','p2'] if r[p] in ['alive','ready']]
  assert r['tweens']==expected and r['created']==0 and r['visuals']==1,r
 report=dict(status='passed',rows=rows,sources=records,commands=commands,generatedHashes={p.name:selection.sha(p) for p in work.glob('*.as')},swfSha256=selection.sha(work/'Probe.swf'),runtime='AIR 51.1.1.5')
 (OUT/'roster.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('96 player-array control and 6 boss-door cases passed')
if __name__=='__main__':run()
