"""Audit every SymbolClass in the selected display dependency closures."""
import hashlib
import json
import re
import struct
import subprocess
import zlib
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
LOCAL=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/symbol-scripts'


def symbols(path):
    raw=path.read_bytes();data=zlib.decompress(raw[8:]) if raw[:3]==b'CWS' else raw[8:]
    pos=(5+4*(data[0]>>3)+7)//8+4;result={}
    while pos<len(data):
        header=struct.unpack_from('<H',data,pos)[0];pos+=2;kind,size=header>>6,header&63
        if size==63:size=struct.unpack_from('<I',data,pos)[0];pos+=4
        body=data[pos:pos+size];pos+=size
        if kind!=76:continue
        p=2
        for _ in range(struct.unpack_from('<H',body)[0]):
            cid=struct.unpack_from('<H',body,p)[0];p+=2;end=body.index(0,p)
            result[cid]=body[p:end].decode();p=end+1
    return result


def main():
    inputs=json.loads((OUT/'source-definitions.json').read_text())
    records=[];unknown=[]
    for source in inputs['sources']:
        path=ROOT/source['path'];all_symbols=symbols(path)
        names={cid:name for cid,name in all_symbols.items() if str(cid) in source['definitions']}
        destination=LOCAL/path.stem
        args=['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-selectclass',','.join(names.values()),'-export','script',str(destination),str(path)]
        result=subprocess.run(args,capture_output=True,timeout=60)
        assert result.returncode==0
        for cid,name in names.items():
            script=destination/'scripts'/Path(name.replace('.','/')+'.as')
            text=script.read_text(encoding='utf-8')
            bodies=re.findall(r'function\s+([^\s(]+)\([^)]*\)\s*(?::\s*\w+)?\s*\{([^{}]*)\}',text)
            # Empty generated constructors, including BitmapData width/height forwarding.
            trivial=len(bodies)==1 and bodies[0][0]==name.split('.')[-1] and bool(re.fullmatch(r'\s*super\([^;]*\);\s*',bodies[0][1]))
            if not trivial:unknown.append(dict(owner=path.stem,symbol=name,reason='nontrivial constructor/method requires source execution'))
            records.append(dict(owner=path.stem,characterId=cid,symbol=name,path=script.relative_to(ROOT).as_posix(),
                                sha256=hashlib.sha256(script.read_bytes()).hexdigest(),trivialConstructorOnly=trivial,
                                sourcePath=source['path'],sourceSha256=source['sha256']))
    report=dict(status='passed' if not unknown else 'unresolved',records=records,unresolved=unknown,
                scope='All SymbolClass entries within the chosen display closure; nontrivial code blocks promotion.')
    (OUT/'symbol-script-audit.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A closure scripts:',len(records),'nontrivial:',len(unknown))
    assert not unknown,unknown


if __name__=='__main__':main()
