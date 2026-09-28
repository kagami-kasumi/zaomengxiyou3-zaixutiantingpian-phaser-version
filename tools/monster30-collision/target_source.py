"""Independently reconstruct the actual target colipse display lists from restored tags."""
import hashlib,json,subprocess,xml.etree.ElementTree as ET
from source import ROOT, LOCAL, OUT, I, timeline

def main():
 source=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf';xml=LOCAL/'targets.xml'
 run=subprocess.run(['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-swf2xml',str(source),str(xml)],capture_output=True,timeout=60)
 assert run.returncode==0
 tags=list(ET.parse(xml).getroot().find('tags'));defs={int(t.get('spriteId') or t.get('shapeId') or t.get('characterID')):t for t in tags if t.get('spriteId') or t.get('shapeId') or t.get('characterID')};names={}
 for t in tags:
  if t.get('type')=='SymbolClassTag': names.update(zip([x.text for x in t.find('names')],[int(x.text) for x in t.find('tags')]))
 profiles=json.loads((ROOT/'tools/monster30-collision/profiles.json').read_text(encoding='utf-8'))
 native=json.loads((OUT/'native.json').read_text(encoding='utf-8'));actual={x['id']:x for x in native['targets']}
 def expand(cid):
  d=defs[cid];node=dict(characterId=cid,kind=d.get('type'),frame=1,children=[])
  if d.get('type')=='DefineSpriteTag':
   # Sound stream metadata does not alter display-list placements.
   for tag in list(d.find('subTags')):
    if tag.get('type') in ['SoundStreamHead2Tag','SoundStreamBlockTag']:d.find('subTags').remove(tag)
   frames=timeline(d);assert len(frames)==1
   node['children']=[{**expand(c['characterId']),**c} for c in frames[0]]
  return node
 def compare(e,a):
  assert len(e['children'])==len(a['children']) and a['alpha']==1
  if 'matrix' in e:assert all(abs(e['matrix'][k]-a['matrix'][k])<1e-9 for k in I)
  for x,y in zip(e['children'],a['children']):compare(x,y)
 states=[]
 for p in profiles:
  t=expand(names[p['symbol']]);a=actual[p['id']]['tree'];compare(t,a)
  assert a['matrix']['a']==round(p['scaleX']*65536)/65536 and a['matrix']['d']==p['scaleY']
  assert a['matrix']['tx']==p['x'] and a['matrix']['ty']==p['y'] and not a['visible']
  states.append(dict(id=p['id'],tree=t))
 result=dict(status='source-tree-matched',source=source.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(source.read_bytes()).hexdigest(),states=states)
 (OUT/'target-display-list.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print('241 actual target source/native trees agree:',len(states),'profiles')
if __name__=='__main__':main()
