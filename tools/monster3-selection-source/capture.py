"""250 original natural decision methods layered on the bounded 247 body harness."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-250'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-250'
spec = importlib.util.spec_from_file_location('body247', ROOT/'tools/monster3-source/capture.py')
body = importlib.util.module_from_spec(spec)
spec.loader.exec_module(body)
MUTATIONS = ['horizontal', 'inclusive', 'cd-first', 'busy-cd', 'normal-first', 'alternating', 'random-consumption', 'normal-rate', 'skill-facing']


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def prepare(mutation=None):
    body.WORK = WORK/(mutation or 'baseline')
    work = body.prepare()
    source = body.base
    def put(n, s): (work/n).write_text(s, encoding='utf-8')
    def edit(n, old, new):
        s=(work/n).read_text(encoding='utf-8')
        assert old in s, (n, old)
        put(n, s.replace(old, new))
    def add(n, s):
        old=(work/n).read_text(encoding='utf-8');i=old.rfind('}}')
        assert i>=0,n
        put(n,old[:i]+s+'\n'+old[i:])
    def take(p, names): return '\n'.join(source.take(p,n) for n in names)
    obj='base/BaseObject.as';mon='base/BaseMonster.as';m3='export/monster/Monster3.as'
    edit('BaseObject.as', "public function isBeAttacking():Boolean{return curAction=='hit1'||curAction=='hit2';}", take(obj,['isBeAttacking','isAttacking']))
    edit('BaseObject.as', 'public function getNumAttackId():int{return 1;}', take(obj,['newAttackId','getNumAttackId']))
    add('BaseObject.as', '''public var attackId:int=0,isLeft:Boolean=false,isRight:Boolean=false,sid:int=0,speed:Point=new Point();
      protected function __added(e:Event):void{} public function setSHp(v:int):void{maxHp=v;} public var maxHp:int=100;
      protected function turnLeft():*{isLeft=true;isRight=false;bbdc.direction=0;}
      protected function turnRight():*{isRight=true;isLeft=false;bbdc.direction=1;}
      public function snapshot():Object{return {action:curAction,cd:0,direct:bbdc.direction,serial:attackId};}
    ''')
    edit('BaseObject.as','import flash.display.*;', 'import flash.display.*;import flash.geom.*;import flash.events.*;')
    # Exact turn methods; only hero-network side effects remain unreachable for this Monster3 fixture.
    edit('BaseObject.as','protected function turnLeft():*{isLeft=true;isRight=false;bbdc.direction=0;}',source.take(obj,'turnLeft'))
    edit('BaseObject.as','protected function turnRight():*{isRight=true;isLeft=false;bbdc.direction=1;}',source.take(obj,'turnRight'))
    add('Clip.as','public function turnLeft():void{direction=0;} public function turnRight():void{direction=1;}')
    put('Role2Shadow.as','package {public class Role2Shadow extends BaseHero{}}')
    edit('BaseMonster.as','package {','package {import flash.geom.*;import flash.events.*;')
    edit('BaseMonster.as','public function setStatic():void{}',source.take(obj,'setStatic'))
    edit('BaseMonster.as','public function getSHp():int{return 100;}','public function getSHp():int{return maxHp;}')
    methods=take(mon,['__added','step','addcount','IntelligenceTime','countCD','myIntelligence','hasAttackTarget','attackTarget','faceToTarget','selectTarget','beforeSkill1Start','beforeSkill2Start','beforeSkill3Start','beforeSkill4Start','beforeSkill5Start','releSkill1','releSkill2','releSkill3','releSkill4','releSkill5','normalWalk','randomWalk','followTarget','flyFollowTarget'])
    # Random is the sole algorithmic input substitution. Call order is captured, including the unused roll.
    methods=methods.replace('Math.random()','gc.random()')
    methods=methods.replace('         super.step();','         super.step();\n         Config.bodyState=this.inspect();')
    for method in ['normalWalk','selectTarget']:
        marker='protected function '+method+'() : void\n      {'
        assert marker in methods
        methods=methods.replace(marker,marker+"gc.order.push('"+method+"');")
    fields='''
      public var horizenSpeed:Number=0,attackRange:int=100,alertRange:int=1000,normalAttackRate:Number=0,
        count:int=0,timecount:int=0,beattackedtimes:Number=0,waitRateWhenNoTarget:Number=0;
      public var skillCD:Array=[0,0],skillCD1:Array=[0,0],skillCD2:Array=[0,0],skillCD3:Array=[0,0],skillCD4:Array=[0,0],skillCD5:Array=[0,0],fallList:Array=[],lastHit:String='';
      public var ddd:Boolean=false,canStun:Boolean=false,standInObj:Object=null;
      public function setFullHp():void{hp=maxHp;} public function setHue(v:*):void{}
      protected function moveLeft():void{turnLeft();setAction('walk');} protected function moveRight():void{turnRight();setAction('walk');}
      public function added():void{__added(null);}
      public function inspect():Object{return {action:curAction,cd:skillCD1[0],interval:skillCD1[1],rate:normalAttackRate,count:count,
        direct:bbdc.direction,serial:attackId,target:curAttackTarget?curAttackTarget.id:null,hp:hp,ready:isReadyToDestroy,
        frozen:curAddEffect.blocked,bodyStopped:bbdc.isStopFrame,created:BaseBullet.serial,lastHit:lastHit};}
    '''
    add('BaseMonster.as', fields+methods+source.take(mon,'isDead'))
    # Preserve the actual constructor, including boss/non-boss and skillCD1 inputs.
    text=(work/'MonsterProbe.as').read_text(encoding='utf-8')
    start=text.index('public function MonsterProbe(');end=text.index('\n      ',start+1)
    end=text.index('}',start)+1
    constructor=source.take(m3,'Monster3').replace('function Monster3()','function MonsterProbe()')
    constructor=constructor.replace('         super();','''         super();
         isFly=false;protectedParamsObject.rehp=0;
         bbdc.enterFrameFunc=enterFrameFunc;bbdc.exitFrameFunc=exitFrameFunc;
         bbdc.addFrameScriptWhenFrameOver=scriptFrameOverFunc;curAddEffect=new BaseAddEffect(this);''')
    # Old constructor contains nested attack dictionaries, so use balanced extraction.
    brace=text.index('{',start);depth=1;end=brace+1
    while depth:
        depth+=(text[end]=='{')-(text[end]=='}');end+=1
    text=text[:start]+constructor+text[end:]
    put('MonsterProbe.as',text)
    add('MonsterProbe.as',take(m3,['myIntelligence','beforeSkill1Start','releSkill1']))
    add('AUtils.as',take('AUtils.as',['GetDisBetweenTwoObj','GetNearestObj'])+'public static function clone(a:Array):Array{return a.concat();}')
    edit('Config.as','public function getPlayerArray():Array{return targets;}',source.take('config/Config.as','getPlayerArray'))
    add('Config.as', '''public var hero1:BaseHero,hero2:BaseHero,curStage:int=1,curLevel:int=1,sid:int=-1,isLWYP:Boolean=false;
      public static var bodyState:Object;public var roll:Number=0,randomCalls:Array=[],order:Array=[];
      public function random():Number{var v:Number=randomCalls.length==0?0.97:roll;randomCalls.push(v);return v;} public function sendLorRInfo(h:BaseHero):void{}
    ''')
    edit('Config.as','addBossBlood:function(...a):void{}','addBossBlood:function(...a):void{},addbeatt:function(...a):void{}')
    edit('Config.as','likeMonsterArray:[]','likeMonsterArray:[],heroArray:[]')
    add('BaseAddEffect.as', '''public static const ICE:String='ice',Pet_TIGER_SXHZ:String='tiger',STUN:String='stun',PETHORSE_ICE:String='horse';
      public var blocked:Boolean=false;public function curDebuff(n:String):Boolean{return blocked;}public function add(v:*):void{}
    ''')
    edit('BaseAddEffect.as',"if(ice=='hide')hide_pethorse_ice();", "if(ice=='hide'){hide_pethorse_ice();blocked=false;}")
    if mutation=='horizontal':edit('MonsterProbe.as','AUtils.GetDisBetweenTwoObj(this.curAttackTarget,this) < 200','Math.abs(this.curAttackTarget.x-this.x) < 200')
    if mutation=='inclusive':edit('MonsterProbe.as','< 200','<= 200')
    if mutation=='cd-first':
        edit('BaseMonster.as','         this.countCD();','')
        edit('BaseMonster.as','         this.addcount();','         this.addcount();this.countCD();')
    if mutation=='busy-cd':edit('BaseMonster.as','if(this.isReadyToDestroy)','if(this.isReadyToDestroy || this.isAttacking() || this.isBeAttacking())')
    if mutation=='normal-first':edit('BaseMonster.as','Boolean(this.beforeSkill1Start())','Boolean(this.beforeSkill1Start()) && this.count % gc.frameClips != 0')
    if mutation=='alternating':edit('BaseMonster.as','this.setAction("hit1");','this.setAction(this.attackId % 2 == 0 ? "hit2" : "hit1");')
    if mutation=='random-consumption':edit('BaseMonster.as','Math.ceil(gc.random() * 4)','1')
    if mutation=='normal-rate':edit('BaseMonster.as','this.normalAttackRate = 0.366;','this.normalAttackRate = 0.423;')
    if mutation=='skill-facing':edit('MonsterProbe.as','this.lastHit = "hit2";','this.lastHit = "hit2";this.faceToTarget();')
    put('Probe.as',(HERE/'Probe.as').read_text(encoding='utf-8'))
    edit('application.xml','regima.task247.source','regima.task250.selection')
    return work,source.RECORDS


def run(mutation=None, suffix=None):
    work,records=prepare(mutation)
    commands=[['java','-Dflexlib='+str(body.base.SDK/'frameworks'),'-jar',str(body.base.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],
      [str(body.base.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]]
    for label,cmd in zip(['compile','run'],commands):
        result=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60)
        log=(result.stdout+result.stderr).decode(errors='replace')
        (work/(label+'.log')).write_text(log,encoding='utf-8')
        assert result.returncode==0,log[-4500:]
    assert 'COMPLETE' in log and '51,1,1,5' in log,log[-2000:]
    rows=json.loads((work/'rows.json').read_text(encoding='utf-8'))
    report=dict(status='observed-unverified',runtime='AIR 51.1.1.5',mutation=mutation,rows=rows,sources=records,
      commands=commands,generatedHashes={p.name:sha(p) for p in work.glob('*.as')},swfSha256=sha(work/'Probe.swf'),
      restoredSwfSha256=sha(work/'source.swf'),harnessSha256=sha(HERE/'capture.py'),bodyHarnessSha256=sha(Path(body.__file__)),
      limitations='Actual decision/CD/constructor/added/body methods, controlled random and fixed roots. Movement endpoints are observed turn/action sinks; no paths/walls, boss counterattack, rewards, actual HP settlement or full Scene. Existing 247 controlled clip frames; native first-frame/EXIT semantics remain referenced from 247.')
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/((suffix or mutation or 'baseline')+'.json')).write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    print(json.dumps(dict(variant=suffix or mutation or 'baseline',cases=len(rows),states=sum(len(r['states']) for r in rows))),flush=True)
    return report


if __name__=='__main__':run(sys.argv[1] if len(sys.argv)>1 else None)
