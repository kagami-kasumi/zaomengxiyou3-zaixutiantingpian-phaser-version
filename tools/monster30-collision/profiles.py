"""Extract 241 target profiles from the actual constructors, including inheritance."""
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

def source(path):
 return dict(path=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(path.read_bytes()).hexdigest())

def constructor(path):
 text=path.read_text(encoding='utf-8')
 match=re.search(r'function newColipse\(\)[\s\S]*?getNewObj\("([^"]+)"\)',text)
 if match:return match.group(1),path,text[:match.start()].count('\n')+1
 parent=re.search(r'class \w+ extends (\w+)',text).group(1)
 assert parent not in ('BaseObject','BasePet'),path
 return constructor(path.with_name(parent+'.as'))

def generate():
 groups={};mappings=[];writes=[]
 paths=[SRC/'export/hero'/f'Role{i}.as' for i in range(1,6)]
 for family,count in [('Monkey',4),('Horse',4),('Kabu',3),('Tiger',4),('Turtle',4),('Phoenix',4),('Dragon',4),('Rabbit',4),('Mouse',4)]:
  paths.extend(SRC/'export/pet'/f'Pet{family}{i}.as' for i in range(1,count+1))
 for path in paths:
  symbol,origin,line=constructor(path);kind='hero' if path.stem.startswith('Role') else 'pet';key=kind+'-'+symbol
  groups.setdefault(key,dict(id=key,kind=kind,symbol=symbol,scaleX=1.2 if kind=='hero' else 1,scaleY=1,x=0,y=0,parentScaleX=1,parentScaleY=1,types=[]))['types'].append(path.stem)
  mappings.append(dict(type=path.stem,profile=key,source=source(path),constructorSource=source(origin),line=line))
 for path in [*paths,SRC/'base/BaseHero.as',SRC/'base/BasePet.as',SRC/'base/BaseObject.as']:
  text=path.read_text(encoding='utf-8')
  for n,line in enumerate(text.splitlines(),1):
   if re.search(r'(?:this\.)?colipse\.(?:scaleX|scaleY|x|y|width|height)\s*=',line):
    writes.append(dict(source=source(path),line=n,text=line.strip()))
 assert len(mappings)==40 and len(groups)==4
 hero=(SRC/'base/BaseHero.as').read_text(encoding='utf-8')
 assert 'this.colipse.scaleX = 1.2;' in hero
 # The identity parent mapping is a static source conclusion; retained write scan is audited.
 profile_path=Path(__file__).with_name('profiles.json')
 profile_path.write_text(json.dumps(list(groups.values()),indent=2)+'\n',encoding='utf-8')
 out=ROOT/'docs/tasks/evidence/TASK-SETTINGS-241';out.mkdir(parents=True,exist_ok=True)
 (out/'profile-source-map.json').write_text(json.dumps(dict(types=mappings,colipseWrites=writes,
  commonSources=[source(SRC/'base'/f'{n}.as') for n in ['BaseObject','BaseHero','BasePet']]),indent=2)+'\n',encoding='utf-8')
 print('241 profiles: 40 actual types, 4 profiles;',len(writes),'coordinate/scale writes for audit')
if __name__=='__main__':generate()
