"""251 draft native receiver fixture. No verified contract until verifier passes."""
import json
import re
import subprocess
from pathlib import Path
from source import ROOT, SRC, RECORDS, methods, take

HERE = Path(__file__).parent
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-251/baseline'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def prepare():
    WORK.mkdir(parents=True, exist_ok=True)
    RECORDS.clear()
    def put(name, text):
        (WORK / name).write_text(text, encoding='utf-8')
    def cls(name, base, body):
        put(name + '.as', 'package {import flash.display.*;import flash.geom.*;import flash.events.*;'
            + 'public dynamic class ' + name + (' extends ' + base if base else '') + '{' + body + '}}')
    obj = '''public var gc:Config=Config.instance,sid:int=1,colipse:Sprite=new Sprite(),curAction:String='wait',
      magicBulletArray:Array=[],beAttackIdArray:Array=[],attackBackInfoDict:Object={},curAddEffect:BaseAddEffect,
      fatherCount:int=-1,istouming:Boolean=false,hp:int=1000,bbdc:Object={setFramePointX:function(v:*):void{}};
      public function setHp(v:int):void{hp=v;} public function setSHp(v:int):void{this.maxHp=v;} public function reduceHp(v:int,h:Boolean=false):void{hp-=v;}
      public function beMagicAttack(b:BaseBullet,s:BaseObject,force:Boolean=false):Boolean{return false;}
      public function getRealPower(a:String,b:Boolean=true):Object{return {};}
      public function setAction(a:String):void{curAction=a;}
      public function getCurAddEffect(a:String):Boolean{return curAddEffect!=null && curAddEffect.curDebuff(a);}
      public function addCurAddEffect(a:*):void{} public function cureHp(v:int):void{hp+=v;}
      public function getBeattackBackSpeed(b:*,a:*):Point{return new Point(a.attackBackSpeed[0],a.attackBackSpeed[1]);}
      public function setAttackBack(p:Point):void{this.observedKnockback=p;}
    ''' + 'public var attackId:int=1;' + methods('base/BaseObject.as', ['setYourFather','getNumAttackId'])
    cls('BaseObject', 'Sprite', obj)
    monster_defaults=re.search(r'this.protectedParamsObject = (\{.*?\});',take('base/BaseMonster.as','BaseMonster'),re.S).group(1)
    cls('BaseMonster', 'BaseObject', '''public var protectedParamsObject:Object={Critical:0,Hit:0,ReduceMagicDef:0},isBoss:Boolean=false;
      public function addMonHurtMc(...a):void{}
    ''' + 'public function BaseMonster(){protectedParamsObject='+monster_defaults+';}' + methods('base/BaseMonster.as', ['getRealPower','Hit','ReduceMagicDef']))
    cls('Monster3','BaseMonster',take('export/monster/Monster3.as','Monster3'))
    cls('BaseHero', 'BaseObject', '''public var roleProperies:Properties,player:User=new User(),myPet:BasePet;
      public var isGXP:Boolean=false,canBati:Boolean=false,hmzCharge:int=0,doubleCount:int=0,lastHurtTime:int=0,isAlreadyDead:Boolean=false,
        curbeattacktime:int=0,lastbeattacktime:int=-1000,beattackedtimes:Number=0;
      public function BaseHero(){roleProperies=new Properties(this);}
      public function getPlayer():User{return player;} public function getPet():BasePet{return myPet;}
      public function getRoleId():int{return 1;} public function addMissMc():void{this.missed=true;}
      public function addBingoMc():void{} public function addHeroHurtMc(v:int):void{this.lastHurt=v;}
      public function reduceMp(v:int):void{} public function cureMp(v:int):void{}
      public function destroy():void{this.destroyed=true;} public function resetGraity():void{}
      public function addBeAttackEffect(s:*):void{}
    ''' + methods('base/BaseHero.as', ['beMagicAttack', 'countHurt', 'reduceHp', 'beAttackDoing']))
    cls('BasePet', 'BaseObject', '''public var _petInfo:PetInfo=new PetInfo(),sourceRole:BaseHero,
      isGXP:Boolean=false,lastBeAttackedTarget:BaseObject,curAttackTarget:BaseObject;
      public function getSourceRole():BaseHero{return sourceRole;}
      public function addMissMc():void{this.missed=true;} public function addBingoMc():void{}
      public function showHpSlip():void{} public function drawPetHp():void{}
      public function addMonHurtMc(v:int,b:Boolean):void{this.lastHurt=v;}
      public function addBeAttackEffect(s:*):void{} public function normalHit():void{this.setAction('hit1');}
    ''' + methods('base/BasePet.as', ['beMagicAttack', 'countHurt', 'reduceHp']))
    cls('Properties', 'EventDispatcher', '''public var who:BaseHero,dataObject:Object={hhp:1000},
      miss:int=0,defense:int=0,magicDefense:int=0;
      public function Properties(h:BaseHero){who=h;addEventListener('SetHHp',setHHPEvent);}
      public function getSHHP():int{return 1000;} public function getTotalMiss():int{return miss;}
      public function getTotalDefense():int{return defense;} public function getMagicDefWhenCountHurt():int{return magicDefense;}
    ''' + methods('base/BaseRoleProperies.as', ['setHHPEvent', 'setHHP', 'getHHP']))
    cls('PetInfo', '', '''public var name:String='PetMonkey1',qlfj:Number=NaN,_anti:Object={hp:1000,miss:0,mDef:0,def:0,lifetime:10};
      public function gethpQuality():int{return 100;} public function getdefQuality():int{return 100;} public function getPetName():String{return name;} public function getSHp():int{return 1000;}
      public function findHasStudySkill(s:String):Boolean{return s=="qlfj" && !isNaN(qlfj);}
      public function getPetHarmObj(s:String):Object{return {first:qlfj};}
      public function getlifetime():int{return _anti.lifetime;} public function setlifetime(v:int):void{_anti.lifetime=v;}
    ''' + methods('petInfo/PetInfo.as', ['setHp', 'getHp', 'getMiss', 'getMDef', 'getDef']))
    for name in ['Role1','Role2','Role3','Role4','Role5']: cls(name,'BaseHero',methods('export/hero/'+name+'.as',['reduceHp']))
    side=json.loads((ROOT/'docs/reverse-engineering/reference/monster3-attack-collision-contract.json').read_text(encoding='utf-8'))
    pet_names=[n for profile in side['profiles'] for n in profile['types'] if n.startswith('Pet')]
    for name in pet_names:
        body='' if name in ['PetMouse2','PetMouse3'] else methods('export/pet/'+name+'.as',['reduceHp'])
        cls(name,'PetMouse1' if name in ['PetMouse2','PetMouse3'] else 'BasePet',body)
    cls('TargetFactory','', 'public static function create(n:String):BaseObject{switch(n){'+''.join('case '+json.dumps(n)+':return new '+n+'();' for n in ['Role1','Role2','Role3','Role4','Role5']+pet_names)+'}throw new Error(n);}')
    for name in ['Monster6','Monster16','Monster34','Monster1007']: cls(name,'BaseMonster','')
    from world import install
    install(cls)
    cls('User','', '''public var sd:int=0;public function getCurEquipByType(s:String):Object{return null;}
      public function getSkillBySkillName(s:String):Object{return null;} public function returnSkillLevelBySkillName(s:String):int{return s=='sd'?sd:0;}
    ''')
    cls('MutiUser','','')
    cls('CommonEvent','Event','public var data:*;public function CommonEvent(s:String,d:*){super(s);data=d;}')
    effect_methods=methods('base/BaseAddEffect.as',['reduceMagicUmbDef','reducetjglShieldDef','getBuffByName','curDebuff'])
    remove=take('base/BaseAddEffect.as','remove');remove=remove[:remove.index('         if(param1.name')]+ '}'
    RECORDS[-1]['fragment']='Array removal prefix; only sampled shield hide hooks omitted as display-only services.'
    all_text='\n'.join(p.read_text(encoding='utf-8') for p in WORK.glob('*.as'))+effect_methods
    constants=sorted(set(re.findall(r'BaseAddEffect\.(\w+)',all_text)))
    cls('BaseAddEffect','', '\n'.join('public static const '+n+':String="'+n+'";' for n in constants)+'''
      public var sourceRole:BaseObject,curEffectArray:Array=[];
      public function updateFather():void{} public function add(a:*):void{}
    '''+effect_methods+remove)
    cls('HitTest','','public static function complexHitTestObject(a:*,b:*):Boolean{return Config.geometry;}')
    cls('AUtils','','public static function testIntersects(...a):Boolean{return Config.geometry;} public static function GetDisBetweenTwoObj(a:*,b:*):Number{return 0;} public static function clone(a:*):*{return a;}')
    cls('TweenMax','','public static function to(...a):void{} public static function delayedCall(...a):void{}')
    cls('SoundManager','','public static function play(s:String):void{}')
    cls('Config','', '''public static var instance:Config=new Config(),now:int=1000,geometry:Boolean=true,
      rolls:Array=[],randomCalls:Array=[];
      public static function random():Number{var v:Number=rolls.length?Number(rolls.shift()):0.9;randomCalls.push(v);return v;}
      public var sid:int=1,difficulity:int=0,frameClips:int=30,curStage:int=1,curLevel:int=1,gameSence:Sprite=new Sprite(),eventManger:EventDispatcher=new EventDispatcher();
      public var protectedPerproty:Object={getProperty:function(o:*,k:String):*{return o[k];},setProperty:function(o:*,k:String,v:*):void{o[k]=v;}};
      public var gameInfo:Object={getRoleInfoByPlayer:function(p:*):Object{return {herobeattacktimes:{ruler:new MovieClip()}};}};
      public var isPK:Boolean=false,players:Array=[],pWorld:Object={monsterArray:[],likeMonsterArray:[]}; public function getPlayerArray():Array{return players;} public function getRivalPlayer(o:*):*{return null;} public function isSingleGame():Boolean{return true;}public function isInRoom():Boolean{return false;}
      public function getMutiUserBySidAndRoleId(...a):Object{return null;}
    ''')
    from fixtures import generate
    put('fixtures.json',json.dumps(generate(),separators=(',',':')))
    put('Probe.as',(HERE/'Probe.as').read_text(encoding='utf-8'))
    put('WorldProbe.as',(HERE/'WorldProbe.as').read_text(encoding='utf-8'))
    put('application.xml','''<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task251.reception</id><versionNumber>1</versionNumber><filename>probe251</filename><initialWindow><content>Probe-patched.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>''')
    (WORK/'sources.json').write_text(json.dumps(RECORDS,indent=2),encoding='utf-8')


def run(label='baseline', mutation=None):
    global WORK
    WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-251'/label
    prepare()
    if mutation:mutation(WORK)
    commands=[['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],
      [str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)]]
    for phase,cmd in zip(['compile','run'],commands):
        result=subprocess.run(cmd,cwd=WORK,capture_output=True,timeout=60)
        log=(result.stdout+result.stderr).decode(errors='replace')
        (WORK/(phase+'.log')).write_text(log,encoding='utf-8')
        if result.returncode:raise RuntimeError(log[-9000:])
        if phase=='compile':
            from restore_returnvoid import restore
            restore(WORK)
    assert 'COMPLETE' in log, log[-5000:]
    print(next(line for line in log.splitlines() if line.startswith('COMPLETE')))
    out=ROOT/'docs/tasks/evidence/TASK-SETTINGS-251';out.mkdir(parents=True,exist_ok=True)
    rows=json.loads((WORK/'rows.json').read_text(encoding='utf-8'))
    import hashlib
    digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    data=dict(status='observed-unverified',label=label,rows=rows,sources=list(RECORDS),
      world=json.loads((WORK/'world.json').read_text(encoding='utf-8')),
      commands=commands,fixtureSha256=digest(WORK/'fixtures.json'),
      generatedSources={p.name:digest(p) for p in sorted(WORK.glob('*.as'))},
      nativeLogSha256=digest(WORK/'run.log'),returnvoid=json.loads((WORK/'returnvoid-proof.json').read_text(encoding='utf-8')))
    (out/(label+'.json')).write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
    return data


if __name__=='__main__':run()
