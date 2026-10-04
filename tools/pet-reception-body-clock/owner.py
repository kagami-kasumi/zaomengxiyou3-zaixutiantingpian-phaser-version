"""Isolated restored body definitions and actual/reversed load-order witnesses."""
import json,subprocess
import capture
WORK=capture.WORK.parent/'owner'
def run():
 WORK.mkdir(exist_ok=True,parents=True)
 packages={n:str(capture.ROOT/f'local-resources/regima/source/restored-swfs/assets/{n}.swf') for n in ['20120203','pet1']}
 fixtures=[dict(id='patch-only',packages=[packages['20120203']]),dict(id='base-only',packages=[packages['pet1']]),dict(id='actual-order',packages=[packages['20120203'],packages['pet1']]),dict(id='reversed-order',packages=[packages['pet1'],packages['20120203']])]
 (WORK/'fixtures.json').write_text(json.dumps(fixtures),encoding='utf-8')
 (WORK/'OwnerProbe.as').write_text((capture.HERE/'OwnerProbe.as').read_text(encoding='utf-8'),encoding='utf-8')
 (WORK/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task254.owner</id><versionNumber>1</versionNumber><filename>owner254</filename><initialWindow><content>OwnerProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>',encoding='utf-8')
 for phase,command in [('compile',['java','-Dflexlib='+str(capture.SDK/'frameworks'),'-jar',str(capture.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=OwnerProbe.swf','OwnerProbe.as']),('run',[str(capture.SDK/'bin/adl.exe'),'-runtime',str(capture.ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)])]:
  r=subprocess.run(command,cwd=WORK,capture_output=True,timeout=60);log=(r.stdout+r.stderr).decode(errors='replace');(WORK/(phase+'.log')).write_text(log,encoding='utf-8')
  if r.returncode:raise RuntimeError(log[-4000:])
 assert 'COMPLETE' in log
 print('Isolated patch/base and actual/reversed owner observations captured.')
if __name__=='__main__':run()
