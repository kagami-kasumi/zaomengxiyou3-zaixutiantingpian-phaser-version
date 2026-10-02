"""247 restored-SWF tags and independent real ENTER_FRAME clock."""
import hashlib,json,shutil,subprocess,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-247/timeline'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-247/timeline.json'

def main():
 WORK.mkdir(parents=True,exist_ok=True)
 source=ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf'
 shutil.copyfile(source,WORK/'source.swf');shutil.copyfile(HERE/'Timeline.as',WORK/'Timeline.as')
 xml=WORK/'source.xml'
 p=subprocess.run(['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-swf2xml',str(source),str(xml)],capture_output=True,timeout=60)
 assert p.returncode==0,p.stderr[-1500:]
 tags=list(ET.parse(xml).getroot().find('tags'));names={}
 for tag in tags:
  if tag.get('type')=='SymbolClassTag':names.update(zip([x.text for x in tag.find('names')],[int(x.text) for x in tag.find('tags')]))
 identities={}
 for symbol in ['Monster3Bullet1','Monster3Bullet2']:
  cid=names[symbol];tag=next(t for t in tags if t.get('spriteId')==str(cid))
  identities[symbol]=dict(characterId=cid,totalFrames=int(tag.get('frameCount')),tagSha256=hashlib.sha256(ET.tostring(tag)).hexdigest(),locator='DefineSprite/'+str(cid))
 assert identities['Monster3Bullet1']['totalFrames']==5 and identities['Monster3Bullet2']['totalFrames']==10
 (WORK/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task247.timeline</id><versionNumber>1.0.0</versionNumber><filename>Timeline</filename><initialWindow><content>Timeline.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>',encoding='utf-8')
 commands=[['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Timeline.swf','Timeline.as'],[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)]]
 for label,cmd in zip(['compile','run'],commands):
  p=subprocess.run(cmd,cwd=WORK,capture_output=True,timeout=60);log=(p.stdout+p.stderr).decode(errors='replace');(WORK/(label+'.log')).write_text(log,encoding='utf-8');assert p.returncode==0,log[-3000:]
 assert 'COMPLETE' in log and '51,1,1,5' in log
 rows=json.loads(next(s[5:] for s in log.splitlines() if s.startswith('ROWS ')))
 assert len(rows)==288
 for fps in [20,24,30]:
  for symbol in ['Monster3Bullet1','Monster3Bullet2']:
   for mode in ['free','stop-play']:
    group=[r for r in rows if r['fps']==fps and r['symbol']==symbol and r['mode']==mode];assert len(group)==24
    total=identities[symbol]['totalFrames'];assert all(r['total']==total for r in group)
    for i in range(1,24):
     held=mode=='stop-play' and 5<=i<=7
     assert group[i]['frame']==(group[i-1]['frame'] if held else group[i-1]['frame']%total+1),(fps,symbol,mode,i,group)
 report=dict(status='verified-bounded-native-clock',runtime='AIR 51.1.1.5',source=source.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),identities=identities,rows=rows,commands=commands,fixtureSha256=hashlib.sha256((HERE/'Timeline.as').read_bytes()).hexdigest(),limitations='Real restored MovieClip clock at 20/24/30fps, free loop and explicit stop/play. Free loop also models skipped world callbacks: it does not prove game menu or PhysicsWorld clock phase. No visual geometry/pixel/HP equivalence.')
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('247 native clock: 288 observations, two symbols, free/stop-play; source tag totals agree')
if __name__=='__main__':main()
