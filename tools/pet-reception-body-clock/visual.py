"""254 native bitmap observations. Corpus is read-only, output is local."""
import json
import subprocess
import capture

WORK = capture.WORK.parent/'visual'


def prepare(mutation=None):
    inventory = json.loads((WORK.parent/'source-inventory.json').read_text(encoding='utf-8'))
    observations = json.loads((WORK.parent/'clock/observations.json').read_text(encoding='utf-8'))
    forms = {f['id']: f for f in inventory['forms']}
    coordinates = sorted({(v['id'].split(':')[0], s['action'], s['y'], s['x'])
        for v in observations for s in v['states'] if s['action'] in ['hurt', 'dead'] and not s['dead']})
    fixtures = []
    for name, action, row, x in coordinates:
        for direct in [0, 1]:
            f = forms[name]
            fixtures.append(dict(id=f'{name}-{action}-r{row}-x{x}-d{direct}', form=name,
                symbol=f['symbol'], row=row, x=x, direct=direct, cell=f['cell'], action=action))
    WORK.mkdir(parents=True, exist_ok=True)
    (WORK/'png').mkdir(exist_ok=True)

    def put(name, text):
        (WORK/name).write_text(text, encoding='utf-8', newline='\n')

    put('fixtures.json', json.dumps(fixtures))
    packages = ['20120203', '20120808', 'StageCommon', 'pet1', 'mouse']
    put('packages.json', json.dumps([dict(name=n, path=str(capture.ROOT/
        f'local-resources/regima/source/restored-swfs/assets/{n}.swf')) for n in packages]))
    methods = ['getCurFrameBitmapData', 'setXYByDirect', 'setOffsetXY']
    frame = '''package {import flash.display.*;import flash.geom.*;
public class NativeFrame extends Sprite {
public var isAnimation:Boolean=false,bmWidth:int,bmHeight:int,bmdArray:Array,curPoint:Point=new Point(),direct:int=0,frameCountMaxLen:uint,offsetX:int,offsetY:int;
public function render():BitmapData{return getCurFrameBitmapData();}
'''
    snippets = [capture.take(capture.Path('base/BaseBitmapDataClip.as'), m) for m in methods]
    snippets[0] = snippets[0][:-1]+'return null;}' # unreachable animation=true branch only
    frame += '\n'.join(snippets)+'}}'
    mutations = {
        'origin': ('this.x = -Number(this.bmWidth) / 2 - Number(this.offsetX);', 'this.x = -Number(this.bmWidth) / 2 - Number(this.offsetX) + 1;'),
        'direction': ('if(this.direct == 1)', 'if(this.direct == 0)'),
        'row': ('Number(this.bmHeight) * Number(this.curPoint.y)', 'Number(this.bmHeight) * Number(this.curPoint.y + 1)'),
    }
    if mutation:
        before, after = mutations[mutation]
        assert before in frame, mutation
        frame = frame.replace(before, after)
    put('NativeFrame.as', frame)
    pool = '''package {import flash.display.*;import flash.geom.*;
public class Pool {public static var infoDict:Object={};
public static function hasRegisteredData(name:String):Boolean{return infoDict[name]!=null;}
'''+capture.take(capture.Path('base/BaseBitmapDataPool.as'), 'analysisMcToBitmapDataArrayByString')+capture.take(capture.Path('base/BaseBitmapDataPool.as'), 'registerData')+'}}'
    put('Pool.as', pool)
    put('AUtils.as', '''package {import flash.system.ApplicationDomain;public class AUtils {
public static var domain:ApplicationDomain;
public static function getNewObj(name:String):Object{var type:Class=domain.getDefinition(name) as Class;return new type();}
}}''')
    put('VisualProbe.as', (capture.HERE/'VisualProbe.as').read_text(encoding='utf-8'))
    put('sources.json', json.dumps(dict(records=capture.records, adaptations=[
        'Original getCurFrameBitmapData/setOffsetXY/setXYByDirect/registerData methods; explicit null return for unused isAnimation=true compiler branch',
        'AUtils resolves the explicit sequential ApplicationDomain, same no-argument constructor',
        'Clock-derived coordinate fixtures are controlled states, not a reachability assertion',
        'NativeFrame is a display fixture; root=(470,350), no modern renderer involved']), indent=2))
    put('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task254.visual</id><versionNumber>1</versionNumber><filename>visual254</filename><initialWindow><content>VisualProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
    return len(fixtures)


def run(mutation=None):
    count = prepare(mutation)
    for phase, command in [('compile', ['java', '-Dflexlib='+str(capture.SDK/'frameworks'), '-jar',
        str(capture.SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=VisualProbe.swf', 'VisualProbe.as']),
        ('run', [str(capture.SDK/'bin/adl.exe'), '-runtime', str(capture.ROOT/'local-resources/regima/source/unpacked'),
        str(WORK/'application.xml'), str(WORK)])]:
        result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=180)
        log = (result.stdout+result.stderr).decode(errors='replace')
        (WORK/(phase+'.log')).write_text(log, encoding='utf-8')
        if result.returncode:
            raise RuntimeError(log[-5000:])
    rows = json.loads((WORK/'observations.json').read_text(encoding='utf-8'))
    assert len(rows) == count and 'COMPLETE' in log
    print(f'{count} native visual coordinates captured; independent pixel verification pending.')


if __name__ == '__main__':
    run()
