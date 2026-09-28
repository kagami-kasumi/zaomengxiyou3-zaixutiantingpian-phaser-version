"""241 temporal adapter: unchanged 232 source-method harness on actual ENTER_FRAME."""
from pathlib import Path
import importlib.util,json,hashlib,subprocess,shutil,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-241'
WORK=ROOT/'local-resources/regima/task-outputs/task-settings-241-monster30-attack-collision/phase'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
def main():
 spec=importlib.util.spec_from_file_location('source232',ROOT/'tools/monster-body-order-source/capture.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 module.WORK=WORK;module.OUT=OUT
 work=module.prepare(None)
 code=(work/'BaseBullet.as').read_text(encoding='utf-8')
 code=code.replace('public function checkAttack() : void\n      {','public function checkAttack() : void\n      {trace("CHECK "+JSON.stringify({tick:Config.tick,phase:inspectPhase()}));')
 code=code.replace('public function checkHitWall():void{}','public function checkHitWall():void{} public function inspectPhase():Object{return {uid:uid,frame:imgMc?imgMc.currentFrame:0,childFrame:imgMc?MovieClip(imgMc.getChildAt(0)).currentFrame:0,ready:isReadyToDestroy};}')
 (work/'BaseBullet.as').write_text(code,encoding='utf-8')
 shutil.copyfile(Path(__file__).with_name('PhaseProbe.as'),work/'Probe.as')
 logs={}
 for label,cmd in [('compile',['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as']),('run',[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)])]:
  result=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60);logs[label]=(result.stdout+result.stderr).decode(errors='replace');(OUT/('phase-'+label+'.log')).write_text(logs[label],encoding='utf-8');assert result.returncode==0,logs[label][-5000:]
 log=logs['run'];assert 'COMPLETE' in log and '51,1,1,5' in log
 rows=[json.loads(s[6:]) for s in log.splitlines() if s.startswith('PHASE ')]
 checks=[json.loads(s[6:]) for s in log.splitlines() if s.startswith('CHECK ')]
 (OUT/'phase.json').write_text(json.dumps(dict(status='captured-not-yet-verified',rows=rows,checks=checks,sources=module.RECORDS,limitations='Original world/body/bullet methods, live MovieClip clock. Collision/HP are existing 232 explicit sinks; spatial oracle is separate.'),indent=2)+'\n',encoding='utf-8')
 print('241 live source phase:',len(rows),'observations;',len(checks),'actual checkAttack calls')
if __name__=='__main__':main()
