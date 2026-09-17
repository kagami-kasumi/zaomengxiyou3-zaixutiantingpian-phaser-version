"""225 pixel-only observation on the unchanged 222A source-method fixtures."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OLD = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-222A'
BASE = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-225'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-225'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['body', 'effects', 'dynamic', 'buff'])
    parser.add_argument('--colors', action='store_true', help='Only five frozen dynamic colour-composition witnesses.')
    parser.add_argument('--components', action='store_true', help='Independent unfiltered owner observations.')
    parser.add_argument('--viewport', action='store_true', help='Original-origin isolated views of all offscreen groups.')
    parser.add_argument('--paint', action='store_true', help='Source filter/mask-preserving paint boundaries.')
    parser.add_argument('--transfer', action='store_true', help='Native finite SLD blend response sampling.')
    parser.add_argument('--prefix', action='store_true', help='Four bounded source depth-prefix witnesses.')
    parser.add_argument('--joint', action='store_true', help='Adjacent same-family Aoyi/SLD source follower draw groups.')
    args = parser.parse_args()
    mode = args.mode
    assert not args.colors or mode == 'dynamic'
    assert not args.components or mode in ('dynamic','buff')
    assert sum([args.colors,args.components,args.viewport,args.paint,args.transfer,args.prefix,args.joint])<=1
    assert not args.transfer or mode=='dynamic'
    assert not args.paint or mode=='dynamic'
    assert not args.viewport or mode=='dynamic'
    label = mode + ('-colors' if args.colors else '-components' if args.components else '-viewport' if args.viewport else '-paint' if args.paint else '-transfer' if args.transfer else '-prefix' if args.prefix else '-joint' if args.joint else '')
    work = BASE / label
    work.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    source = OLD / (mode + '-air')
    copied = {}
    for path in sorted(source.rglob('*.as')):
        relative = path.relative_to(source)
        target = work / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)
        copied[relative.as_posix()] = sha(path)
    fixture = json.loads((source / ('inputs.json' if mode == 'body' else 'fixtures.json')).read_text(encoding='utf-8'))
    for s in fixture.get('sources', []):
        assert sha(Path(s['path'])) == s['sha256']
    (work / 'fixtures.json').write_text(json.dumps(fixture), encoding='utf-8')
    if mode == 'body':
        shutil.copyfile(source / 'inputs.json', work / 'inputs.json')
        shutil.copyfile(source / 'body-source.swf', work / 'body-source.swf')
        copied['body-source.swf'] = sha(source / 'body-source.swf')
    helper = Path(__file__).with_name('ColorCapture.as' if args.colors else 'ComponentCapture.as' if args.components else 'ViewportCapture.as' if args.viewport else 'PaintCapture.as' if args.paint else 'TransferCapture.as' if args.transfer else 'PrefixCapture.as' if args.prefix else 'JointCapture.as' if args.joint else 'RasterCapture.as')
    shutil.copyfile(helper, work / helper.name)
    if args.components or args.paint or args.joint:
        shutil.copyfile(Path(__file__).with_name('RasterCapture.as'), work / 'RasterCapture.as')
    if args.paint:
        from paint_requests import requests
        (work/'paint-requests.json').write_text(json.dumps(requests()),encoding='utf-8')
    if args.transfer:
        from transfer_requests import requests
        (work/'transfer-requests.json').write_text(json.dumps(requests()),encoding='utf-8')
    if args.viewport:
        requests={}
        for row in json.loads((BASE/mode/'layers.json').read_text())['rows']:
            groups=[g['depth'] for g in row['groups'] if not g['primary']['empty'] and 'canonical' not in g['primary']]
            if groups:requests[row['id']]=groups
        (work/'projection-requests.json').write_text(json.dumps(requests),encoding='utf-8')
    name = {'effects': 'VisualProbe', 'body': 'BodyProbe'}.get(mode, 'DynamicProbe')
    original = ROOT / 'tools/turtle-visual' / (name + '.as')
    text = original.read_text(encoding='utf-8')
    if mode == 'effects':
        old = 'var id:String=item.spec.symbol+"-"+tick+"-s"+scale+"-d"+sign;'
        assert old in text
        text = text.replace(old, old + '\nRasterCapture.effect(clip,matrix,id,{symbol:item.spec.symbol,tick:tick,scale:scale,sign:sign,owner:item.spec.owner,tree:tree(clip,clip,"root")});')
        old = 'trace("COMPLETE "+tick+" "+objects.length);'
        text = text.replace(old, 'RasterCapture.finish();' + old)
    elif mode == 'body':
        old = 'save(id,canvas);'
        assert old in text
        text = text.replace(old, old + '\nRasterCapture.effect(clip,new Matrix(1,0,0,1,owner.x+clip.x,owner.y+clip.y),id,{form:spec.form,row:row.row,column:cell.column,direct:direct,owner:owner.id});')
        text = text.replace('trace("COMPLETE "+total);', 'RasterCapture.finish();trace("COMPLETE "+total);')
    else:
        old = 'rows.push(r);'
        assert old in text
        text = text.replace(old, 'RasterCapture.world(c.world,c.id+"-"+tick);' + old)
        old = "trace('COMPLETE '+rows.length);"
        text = text.replace(old, 'RasterCapture.finish();' + old)
    if args.colors:
        text = text.replace('RasterCapture.', 'ColorCapture.')
    if args.components:
        text = text.replace('RasterCapture.', 'ComponentCapture.')
    if args.viewport:
        text = text.replace('RasterCapture.', 'ViewportCapture.')
    if args.paint:
        text = text.replace('RasterCapture.', 'PaintCapture.')
    if args.transfer:
        text = text.replace('RasterCapture.', 'TransferCapture.')
    if args.prefix:
        text = text.replace('RasterCapture.', 'PrefixCapture.')
    if args.joint:
        text = text.replace('RasterCapture.', 'JointCapture.')
    (work / (name + '.as')).write_text(text, encoding='utf-8')
    descriptor = (source / 'application.xml').read_text(encoding='utf-8')
    descriptor = descriptor.replace('regima.task222a', 'regima.task225.' + label)
    (work / 'application.xml').write_text(descriptor, encoding='utf-8')
    compile_command = ['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'),
                       '+configname=air', '-debug=true', '-default-frame-rate=24', '-default-size=940,590',
                       '-output=' + name + '.swf', name + '.as']
    result = subprocess.run(compile_command, cwd=work, capture_output=True, timeout=60)
    (work / 'compile.log').write_bytes(result.stdout + result.stderr)
    assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
    runtime = ROOT / 'local-resources/regima/source/unpacked'
    command = [str(SDK / 'bin/adl.exe'), '-runtime', str(runtime), '-profile', 'desktop',
               str(work / 'application.xml'), str(work)]
    with (work / 'stdout.log').open('wb') as stdout, (work / 'stderr.log').open('wb') as stderr:
        result = subprocess.run(command, cwd=work, stdout=stdout, stderr=stderr, timeout=1200)
    log = (work / 'stdout.log').read_text(encoding='utf-8', errors='replace') + (work / 'stderr.log').read_text(encoding='utf-8', errors='replace')
    assert result.returncode == 0 and 'COMPLETE ' in log, log[-4000:]
    layers = json.loads((work / 'layers.json').read_text(encoding='utf-8'))
    if mode == 'effects':
        original_rows = [json.loads(line[6:]) for line in log.splitlines() if line.startswith('STATE ')]
        (work / 'measurement.json').write_text(json.dumps(dict(states=original_rows)), encoding='utf-8')
    elif mode == 'body':
        cells = [json.loads(line[5:]) for line in log.splitlines() if line.startswith('CELL ')]
        clocks = [json.loads(line[6:]) for line in log.splitlines() if line.startswith('CLOCK ')]
        (work / 'measurement.json').write_text(json.dumps(dict(cells=cells, clocks=clocks)), encoding='utf-8')
    report = dict(mode=mode, exitCode=result.returncode, compileCommand=compile_command, command=command,
                  sourceProbeSha256=sha(original), observerSha256=sha(work / helper.name), compiledProbeSha256=sha(work / (name + '.swf')),
                  copiedSourceHashes=copied, runtimeSha256=sha(runtime / 'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
                  fixtureSha256=sha(work / 'fixtures.json'), rows=len(layers['rows']),
                  layersSha256=sha(work / 'layers.json'), measurementSha256=sha(work / 'measurement.json'))
    report['work'] = work.relative_to(ROOT).as_posix()
    report['instrumentedProbeSha256'] = sha(work / (name + '.as'))
    (OUT / (label + '-run.json')).write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(label, 'completed:', len(layers['rows']), 'states')


if __name__ == '__main__':
    main()
