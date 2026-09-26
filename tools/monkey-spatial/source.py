"""228: byte-preserved monkey effect/target dependency closures.

Source SWFs and legacy extraction remain read-only. Only bounded copies are
parsed/exported. Display scripts are audited before native playback promotion.
"""
import hashlib
import json
import re
import runpy
import struct
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCAL = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/source'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
EFFECTS = ['PetMonkey1Bullet1','PetMonkey1Bullet2','PetMonkey2Bullet1','PetMonkey2Bullet2_1',
           'PetMonkey2Bullet2_2','PetMonkey3Bullet1','PetMonkey3Bullet2','PetMonkey3Bullet3_1','PetMonkey3Bullet3_2']
TARGETS = ['ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7']


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    LOCAL.mkdir(parents=True,exist_ok=True)
    OUT.mkdir(parents=True,exist_ok=True)
    binary = runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    traversal = runpy.run_path(str(ROOT/'tools/dragon23-collision-source.py'))
    symbol_map = runpy.run_path(str(ROOT/'tools/turtle-visual/symbol_scripts.py'))['symbols']
    sources, scripts, unresolved = [], [], []
    for name, names in [('20120203',EFFECTS),('StageCommon',TARGETS+['ObjectBaseSprite3','ObjectBaseSprite4','FireBuff'])]:
        path=ROOT/f'local-resources/regima/source/restored-swfs/assets/{name}.swf'
        symbols=symbol_map(path)
        roots={symbol:next(cid for cid,label in symbols.items() if label==symbol) for symbol in names}
        tags=binary['source_tags'](path)
        def write_subset(ids,suffix,place_roots=False):
            chunks=[binary['tag'](69,struct.pack('<I',8))]
            chunks += [binary['tag'](*tags[cid]) for cid in sorted(ids)]
            if place_roots:
                chunks += [binary['place'](cid,index+1,dict(tx=0,ty=0),transformed=False) for index,cid in enumerate(roots.values())]
            chunks += [binary['tag'](1,b''),binary['tag'](0,b'')]
            body=binary['rectangle'](940,590)+struct.pack('<HH',24*256,1)+b''.join(chunks)
            output=LOCAL/(name+suffix+'.swf')
            output.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
            return output
        bootstrap=write_subset([cid for cid in tags if cid<=max(roots.values())],'-bootstrap')
        xml=LOCAL/(name+'.xml')
        args=['java','-Xmx2g','-jar','C:/Program Files (x86)/FFDec/ffdec.jar','-swf2xml',str(bootstrap),str(xml)]
        result=subprocess.run(args,capture_output=True,timeout=90)
        (LOCAL/(name+'-xml.log')).write_bytes(result.stdout+result.stderr)
        assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
        defs={int(node.get('spriteId') or node.get('shapeId') or node.get('characterID')):node for node in ET.parse(xml).getroot().find('tags')
              if node.get('spriteId') or node.get('shapeId') or node.get('characterID')}
        pending,used=list(roots.values()),set()
        while pending:
            cid=pending.pop()
            if cid in used:continue
            assert cid in defs,f'Forward definition {cid} requires explicit bootstrap expansion'
            used.add(cid)
            for node in defs[cid].iter():
                if node.get('type','').startswith('PlaceObject') and node.get('placeFlagHasCharacter')=='true':
                    pending.append(int(node.get('characterId')))
                if node.get('bitmapId') and int(node.get('bitmapId')) not in (0,65535):pending.append(int(node.get('bitmapId')))
        closure=write_subset(used,'-closure',True)
        timelines=traversal['timelines']({cid:defs[cid] for cid in used},allow_clip_depth=True)
        definitions={str(cid):dict(tagCode=tags[cid][0],tagBodySha256=hashlib.sha256(tags[cid][1]).hexdigest(),
                     structure=traversal['tree_data'](defs[cid]) if tags[cid][0] not in (6,20,21,35,36,90) else None) for cid in sorted(used)}
        relevant={cid:label for cid,label in symbols.items() if cid in used}
        destination=LOCAL/name/'scripts-audit'
        args2=['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-selectclass',','.join(relevant.values()),'-export','script',str(destination),str(path)]
        result=subprocess.run(args2,capture_output=True,timeout=90)
        assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
        for cid,label in relevant.items():
            script=destination/'scripts'/Path(label.replace('.','/')+'.as')
            text=script.read_text(encoding='utf-8')
            bodies=re.findall(r'function\s+([^\s(]+)\([^)]*\)\s*(?::\s*\w+)?\s*\{([^{}]*)\}',text)
            trivial=len(bodies)==1 and bodies[0][0]==label.split('.')[-1] and bool(re.fullmatch(r'\s*super\([^;]*\);\s*',bodies[0][1]))
            record=dict(owner=name,characterId=cid,symbol=label,path=script.relative_to(ROOT).as_posix(),sha256=sha(script),trivialConstructorOnly=trivial)
            scripts.append(record)
            if not trivial:unresolved.append(record)
        sources.append(dict(id=name,path=path.relative_to(ROOT).as_posix(),sha256=sha(path),roots=roots,
                            closurePath=closure.relative_to(ROOT).as_posix(),closureSha256=sha(closure),
                            xmlPath=xml.relative_to(ROOT).as_posix(),xmlSha256=sha(xml),commands=[args,args2],
                            definitions=definitions,timelines=timelines))
    result=dict(taskId='TASK-SETTINGS-228',status='extracted-not-promoted',sources=sources,scripts=scripts,
                unresolved=unresolved,scope='Nine primary effects, three target collision shapes, two additional pet colliders and inherited FireBuff; body/actual bullet lifecycle not claimed')
    (OUT/'source-definitions.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('228 closures:',[(s['id'],len(s['definitions'])) for s in sources],'; script count:',len(scripts),'; unresolved scripts:',len(unresolved))


if __name__=='__main__':main()
