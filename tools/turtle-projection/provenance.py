"""Freeze exact executed observer sources and verify native/source fingerprints."""
import gzip
import json
import re
from pathlib import Path
from run import ROOT, BASE, OUT, SDK, sha
from pack import encoded
from verify_pixels import load


def main():
    # The interrupted transfer experiment has no complete run and is not evidence.
    labels=['body','effects','dynamic','buff','dynamic-colors','dynamic-components','buff-components','dynamic-paint','dynamic-viewport','dynamic-prefix','dynamic-joint']
    records=[];archive={};unresolved=[]
    for label in labels:
        report=load(OUT/(label+'-run.json'));work=ROOT/report['work'] if 'work' in report else Path(report['command'][-1]);mode=report['mode']
        name={'body':'BodyProbe','effects':'VisualProbe'}.get(mode,'DynamicProbe')
        if 'instrumentedProbeSha256' in report:
            assert sha(work/(name+'.as'))==report['instrumentedProbeSha256']
        else:
            replay_path=OUT/'effects-replay.json'
            if label=='effects' and replay_path.exists():
                replay=load(replay_path);replay_work=ROOT/replay['work']
                assert replay['status']=='passed' and replay['states']==2440
                assert replay['originalRunSha256']==sha(OUT/'effects-run.json')
                assert replay['validatorSha256']==sha(ROOT/'tools/turtle-projection/replay_effects.py')
                assert replay['layersSha256']==sha(replay_work/'layers.json')
                assert load(replay_work/'layers.json')==load(work/'layers.json')
                assert replay['compiledProbeSha256']==sha(replay_work/'VisualProbe.swf')
                assert replay['sourceHashes']['VisualProbe.as']==sha(work/'VisualProbe.as')
                assert all(sha(replay_work/path)==digest for path,digest in replay['sourceHashes'].items())
                archive['effects-replay']={p.name:p.read_text(encoding='utf-8') for p in replay_work.glob('*.as')}
            else:
                unresolved.append(dict(label=label,reason='Executed instrumented probe source hash was not recorded; a full frozen-source replay is required.'))
        assert sha(work/(name+'.swf'))==report['compiledProbeSha256']
        assert sha(work/'measurement.json')==report['measurementSha256']
        assert sha(work/'layers.json')==report['layersSha256']
        assert sha(work/'fixtures.json')==report['fixtureSha256']
        assert sha(ROOT/'tools/turtle-visual'/(name+'.as'))==report['sourceProbeSha256']
        for path,digest in report['copiedSourceHashes'].items():
            if path==name+'.as':continue
            assert sha(work/path)==digest,(label,path)
        for source in load(work/'fixtures.json').get('sources',[]):assert sha(ROOT/source['path'])==source['sha256']
        assert sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll')==report['runtimeSha256']
        files={p.relative_to(work).as_posix():p.read_text(encoding='utf-8') for p in work.rglob('*.as')}
        files['application.xml']=(work/'application.xml').read_text(encoding='utf-8')
        for extra in ['paint-requests.json','transfer-requests.json','projection-requests.json']:
            if (work/extra).exists():files[extra]=(work/extra).read_text(encoding='utf-8')
        assert any(sha(p)==report['observerSha256'] for p in work.glob('*Capture.as'))
        archive[label]=files
        records.append(dict(label=label,runSha256=sha(OUT/(label+'-run.json')),sourceFiles={path:__import__('hashlib').sha256(text.encode()).hexdigest() for path,text in files.items()}))
    log=(BASE/'effects/stderr.log').read_text(encoding='utf-8',errors='replace')
    environment=json.loads(re.search(r'^ENV (\{[^\n]+\})',log,re.M).group(1))
    (OUT/'native-probes.json.gz').write_bytes(gzip.compress(encoded(archive),mtime=0))
    result=dict(status='unresolved' if unresolved else 'passed',unresolved=unresolved,environment=environment,runs=records,archiveSha256=sha(OUT/'native-probes.json.gz'),compilerSha256=sha(SDK/'lib/mxmlc-cli.jar'),
        sourcePolicy='Original restored SWFs, AS3 extraction and222A baselines are read-only. Only observer fixtures are generated.',visualExceptions=[])
    (OUT/'provenance.json').write_bytes(encoded(result))
    print('225 native provenance:',result['status'],len(records),'runs;',environment)
    if unresolved:raise SystemExit(1)


if __name__=='__main__':main()
