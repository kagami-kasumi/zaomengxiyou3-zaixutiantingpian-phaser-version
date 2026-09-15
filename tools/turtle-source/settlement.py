"""Extend 215's source-slice harness with bilateral cure and finite integer cases."""
import importlib.util
from prepare import ROOT, SRC, method

def prepare(work):
    spec=importlib.util.spec_from_file_location('incoming_prepare',ROOT/'tools/incoming-number/prepare_behavior.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    records=module.prepare(work,SRC)
    import hashlib
    for file,source,names,extra in [
        ('BaseHero.as','base/BaseHero.as',['cureHp'],'public function isDead():Boolean{return roleProperies.getHHP()<=0;}'),
        ('BasePet.as','base/BasePet.as',['cureHp'],'public function isDead():Boolean{return _petInfo.getHp()<=0;}')]:
        p=work/file;t=p.read_text(encoding='utf-8');s=(SRC/source).read_text(encoding='utf-8')
        for name in names:
            m=method(s,name);extra+=m
            records.append(dict(path=str((SRC/source).relative_to(ROOT)).replace('\\','/'),method=name,sha256=hashlib.sha256((SRC/source).read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(m.encode()).hexdigest()))
        p.write_text(t[:-2]+extra+'}}',encoding='utf-8')
    p=work/'PetInfo.as';t=p.read_text();p.write_text(t[:-2]+'public function getSHp():int{return 1000;}}}')
    return records
