"""Export complete independently reconstructed trees, including native pending children."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK=BASE/'geometry-tree-air'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    fixtures=BASE/'geometry-air/fixtures.json'
    shutil.copyfile(fixtures,WORK/'fixtures.json')
    builder=ROOT/'tools/monkey-spatial/GeometryProbe.as'
    hook='''private function run():void {
for each(var state:Object in config.states){var object:DisplayObject=build(config.sources[state.sourceIndex],state.cid,state.phase);
addChild(object);trace("TREE "+JSON.stringify({id:state.id,tree:NativeTree.tree(object,object,"root")}));removeChild(object);
for each(var entry:Object in used){if(entry.shape.parent)entry.shape.parent.removeChild(entry.shape);pools[String(entry.cid)].push(entry.shape);}used=[];}
trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}
}}'''
    code=builder.read_text().split('private function run():void {')[0]+hook
    probe=WORK/'GeometryTreeProbe.as';probe.write_text(code.replace('GeometryProbe','GeometryTreeProbe'))
    shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',WORK/'NativeTree.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.geometrytrees</id><versionNumber>1.0.0</versionNumber><filename>GeometryTreeProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>GeometryTreeProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=GeometryTreeProbe.swf','GeometryTreeProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,capture_output=True,timeout=60)
    output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-2000:]
    trees=[json.loads(line[5:]) for line in output.splitlines() if line.startswith('TREE ')]
    assert len(trees)==298
    report=dict(trees=trees,builderSha256=sha(builder),compiledSourceSha256=sha(probe),fixturesSha256=sha(fixtures),nativeTreeSha256=sha(WORK/'NativeTree.as'))
    (WORK/'measurement.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('228 reconstructed complete trees:',len(trees))


if __name__=='__main__':main()
