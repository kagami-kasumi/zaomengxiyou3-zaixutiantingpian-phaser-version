"""243 reuses 235 source fragments, in a separate output tree; original corpus is read-only."""
import importlib.util
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('passive235', ROOT/'tools/pet-passive-source/capture.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-243'
base.WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-243/air'
OUT = base.OUT
original_prepare = base.prepare

def prepare(mutation='baseline'):
    work, records = original_prepare('baseline' if mutation != 'refresh-value' else mutation)
    # Each run is serial; output reports keep mutation identity, source workspace is regenerated.
    p = work/'base/Info.as'
    code = p.read_text(encoding='utf-8')
    code = code.replace('public function gettechnique():int{return technique;}', '')
    code = code.replace('public function getwarpower():int{return power;}', '')
    source = base.SRC/'petInfo/PetInfo.as'
    full = source.read_text(encoding='utf-8')
    methods = ''
    for name in ['gettechnique', 'getwarpower', 'settechnique', 'setwarpower']:
        method = base.old.method(full, name)
        methods += method
        records.append(dict(path=source.relative_to(ROOT).as_posix(), method=name,
            startLine=full[:full.index(method)].count('\n')+1,
            fileSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
            sliceSha256=hashlib.sha256(method.encode()).hexdigest()))
    if mutation == 'getter-cap': methods = methods.replace('> 8', '> 800')
    code = code[:-2] + 'public var _anti:Object={technique:3,warpower:1};' + methods + '}}'
    p.write_text(code, encoding='utf-8')
    p = work/'base/BasePet.as'; code = p.read_text(encoding='utf-8')
    if mutation == 'duration-after-fps':
        code = code.replace(').second);', ').second * gc.frameClips);').replace('"time":_loc1_ * gc.frameClips', '"time":_loc1_')
    if mutation == 'skip-zero': code = code.replace('protected function checkBuffSkill() : void\n      {', 'protected function checkBuffSkill() : void\n      { if(this._petInfo.getwarpower()==0)return;')
    p.write_text(code, encoding='utf-8')
    if mutation == 'expiry-late':
        p=work/'base/BaseAddEffect.as'; code=p.read_text(encoding='utf-8')
        code=code.replace('>= _loc10_.time', '> _loc10_.time'); p.write_text(code,encoding='utf-8')
    (work/'Probe.as').write_text(Path(__file__).with_name('Probe.as').read_text(encoding='utf-8'), encoding='utf-8')
    return work, records

base.prepare = prepare
def run(mutation='baseline'):
    import subprocess, json
    work, records=prepare(mutation)
    out=OUT/mutation;out.mkdir(parents=True,exist_ok=True)
    command=['java','-Dflexlib='+str(base.SDK/'frameworks'),'-jar',str(base.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as']
    result=subprocess.run(command,cwd=work,capture_output=True,timeout=60)
    (out/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=[str(base.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]
    try: result=subprocess.run(runtime,cwd=work,capture_output=True,timeout=60)
    except subprocess.TimeoutExpired as error:
        (out/'timeout.log').write_bytes((error.stdout or b'')+(error.stderr or b''));raise
    log=(result.stdout+result.stderr).decode(errors='replace');(out/'runtime.log').write_text(log,encoding='utf-8')
    assert result.returncode==0 and 'COMPLETE 997' in log,log[-2000:]
    report=dict(task='TASK-SETTINGS-243',mutation=mutation,sources=records,cases=[json.loads(l[5:]) for l in log.splitlines() if l.startswith('CASE ')],
      compileCommand=command,runtimeCommand=runtime,runtime='bundled AIR 51.1.1.5',
      generatedHashes={p.relative_to(work).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in work.rglob('*.as')})
    (out/'trace.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(mutation,len(report['cases']),'native cases',flush=True)
    return report

if __name__ == '__main__': run()
