"""Recompile frozen observer sources and reproduce every effects capture."""
import json
import shutil
import subprocess
from run import ROOT, BASE, OUT, SDK, sha
from pack import encoded


def main():
    old=BASE/'effects';work=BASE/'effects-replay';work.mkdir(exist_ok=True)
    recorded=json.loads((OUT/'effects-run.json').read_text())
    assert sha(old/'RasterCapture.as')==recorded['observerSha256']
    assert sha(old/'layers.json')==recorded['layersSha256']
    assert sha(old/'fixtures.json')==recorded['fixtureSha256']
    sources={}
    for name in ('VisualProbe.as','RasterCapture.as','fixtures.json','application.xml'):
        shutil.copyfile(old/name,work/name);sources[name]=sha(work/name)
    command=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-frame-rate=24','-default-size=940,590','-output=VisualProbe.swf','VisualProbe.as']
    compiled=subprocess.run(command,cwd=work,capture_output=True,timeout=60)
    (work/'compile.log').write_bytes(compiled.stdout+compiled.stderr)
    assert compiled.returncode==0
    swf=sha(work/'VisualProbe.swf')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(work/'application.xml'),str(work)]
    with (work/'stdout.log').open('wb') as out,(work/'stderr.log').open('wb') as err:
        result=subprocess.run(command,cwd=work,stdout=out,stderr=err,timeout=1200)
    log=(work/'stdout.log').read_text(errors='replace')+(work/'stderr.log').read_text(errors='replace')
    assert result.returncode==0 and 'COMPLETE ' in log
    assert all(sha(work/n)==h for n,h in sources.items()) and sha(work/'VisualProbe.swf')==swf
    before=json.loads((old/'layers.json').read_text());after=json.loads((work/'layers.json').read_text())
    assert before==after,'Replayed capture metadata changed'
    paths=[]
    def walk(value):
        if isinstance(value,dict):
            if str(value.get('path','')).endswith('.png'):paths.append(value['path'])
            for item in value.values():walk(item)
        elif isinstance(value,list):
            for item in value:walk(item)
    walk(before)
    for path in sorted(set(paths)):assert sha(old/path)==sha(work/path),path
    report=dict(status='passed',states=len(before['rows']),captures=len(set(paths)),sourceHashes=sources,compiledProbeSha256=swf,
        originalRunSha256=sha(OUT/'effects-run.json'),layersSha256=sha(work/'layers.json'),runtimeSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
        work=work.relative_to(ROOT).as_posix(),command=command,validatorSha256=sha(__file__ and ROOT/'tools/turtle-projection/replay_effects.py'),
        meaning='New execution of frozen observer source reproduces all archived effects capture bytes; does not retroactively add a hash to the historical run.')
    (OUT/'effects-replay.json').write_bytes(encoded(report))
    print('effects source replay passed:',report['states'],'states;',report['captures'],'captures')


if __name__=='__main__':main()
