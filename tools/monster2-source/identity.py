"""Read identities from the restored SWF itself; no legacy visual absence inference."""
import hashlib,json,subprocess,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-256/identity'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-256'

def main():
 WORK.mkdir(parents=True,exist_ok=True)
 source=ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf'
 command=['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-swf2xml',str(source),str(WORK/'source.xml')]
 r=subprocess.run(command,capture_output=True,timeout=60);assert r.returncode==0,r.stderr[-1000:]
 tags=list(ET.parse(WORK/'source.xml').getroot().find('tags'));names={}
 for t in tags:
  if t.get('type')=='SymbolClassTag':names.update(zip([n.text for n in t.find('names')],[int(c.text) for c in t.find('tags')]))
 identities={}
 for symbol,total in [('Monster2Bullet1_1',14),('Monster2Bullet1_2',20),('Monster2Bullet2',14)]:
  cid=names[symbol];t=next(t for t in tags if t.get('spriteId')==str(cid));assert int(t.get('frameCount'))==total
  identities[symbol]=dict(characterId=cid,totalFrames=total,locator='DefineSprite/'+str(cid),tagSha256=hashlib.sha256(ET.tostring(t)).hexdigest())
 command2=['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-selectclass','Monster2Bullet2','-export','script',str(WORK/'script'),str(source)]
 r=subprocess.run(command2,capture_output=True,timeout=60);assert r.returncode==0,r.stderr[-1000:]
 scripts=list((WORK/'script').rglob('Monster2Bullet2.as'));assert len(scripts)==1
 s=scripts[0].read_text(encoding='utf-8');assert 'addFrameScript(13,this.frame14)' in s and 'removeChild' in s and 'stop();' in s
 report=dict(source=source.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),identities=identities,rawScript=dict(path=scripts[0].relative_to(ROOT).as_posix(),sha256=hashlib.sha256(scripts[0].read_bytes()).hexdigest()),commands=[command,command2],status='verified-identity-and-script-only',limitation='No geometry, pixel, full display tree or modern projection claim.')
 (OUT/'identity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(identities))
if __name__=='__main__':main()
