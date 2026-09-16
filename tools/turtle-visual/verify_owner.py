"""Independent binary SymbolClass ownership versus currentDomain native snapshots."""
import copy
import hashlib
import json
import re
from pathlib import Path

from symbol_scripts import symbols

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
SRC=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'


def compare(report,expected):
    failures=[];available=set();names=set().union(*(set(s['symbols']) for s in expected))
    if any(report['definitions'][0]['values'].values()):failures.append('initial-definitions')
    for observed,source,definition in zip(report['fixtures']['sources'],expected,report['definitions'][1:]):
        if observed['id']!=source['id'] or set(observed['symbols'])!=set(source['symbols']):failures.append('owner')
        if observed['sha256']!=source['sha256']:failures.append('source')
        available.update(source['symbols'])
        if definition['values']!={name:name in available for name in names}:failures.append('availability')
    return failures


def main():
    native=json.loads((OUT/'owner-native.json').read_text(encoding='utf-8'))
    located=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json').read_text(encoding='utf-8'))
    expected=[]
    for source in reversed(located['sources']):
        path=ROOT/source['path'];table=symbols(path);actual={name:cid for cid,name in table.items() if name in source['symbols']}
        assert actual==source['symbols']
        digest=hashlib.sha256(path.read_bytes()).hexdigest();assert digest==source['sha256']
        expected.append(dict(id=path.stem,sha256=digest,symbols=actual))
    failures=compare(native,expected);mutations={}
    for kind in ['source','owner','phase']:
        changed=copy.deepcopy(native)
        if kind=='source':changed['fixtures']['sources'][0]['sha256']='0'*64
        if kind=='owner':changed['fixtures']['sources'].reverse()
        if kind=='phase':changed['definitions'][1]['values']['PetTurtleBmd1']=True
        mutations[kind]=bool(compare(changed,expected))
    methods=[]
    for file,names in [('loader/Aloader.as',['Aloader','init','next','loadswf']),('loader/AssetsLoader.as',['loadByName','checkNext','loadSwfByName','loadCompleteHandler','__loadToLocalComplete','getRolesAndPetsAssets']),('AUtils.as',['getNewObj'])]:
        path=SRC/file;text=path.read_text(encoding='utf-8')
        for name in names:
            match=re.search(r'(?:public|private|protected) (?:static )?function '+name+r'\(',text);assert match
            start=match.start();opening=text.index('{',match.end());end=opening+1;depth=1
            while depth:depth+=(text[end]=='{')-(text[end]=='}');end+=1
            methods.append(dict(sourcePath=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:start].count('\n')+1,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(text[start:end].encode()).hexdigest()))
    report=dict(status='passed-bounded-check' if not failures else 'failed',expectedFromOriginalSymbolClass=expected,sourceMethods=methods,failures=failures,mutationRejected=mutations,
                boundary='Controlled StageCommon then pet1, matching currentDomain/getDefinitionByName and unload retention. No claim about unrelated full-game preload collisions.')
    (OUT/'owner-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A source/owner:',len(methods),'source methods;',mutations);assert not failures and all(mutations.values())


if __name__=='__main__':main()
