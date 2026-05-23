package task
{
   import my.*;
   
   public class GameTask
   {
      
      private var dayTask:Array;
      
      private var actTask:Array;
      
      private var dtask1:Task;
      
      private var dtask2:Task;
      
      private var dtask3:Task;
      
      private var dtask4:Task;
      
      private var dtask5:Task;
      
      private var dtask6:Task;
      
      private var dtask7:Task;
      
      private var dtask8:Task;
      
      private var dtask9:Task;
      
      private var dtask10:Task;
      
      private var dtask11:Task;
      
      private var dtask12:Task;
      
      private var dtask13:Task;
      
      private var dtask14:Task;
      
      private var dtask15:Task;
      
      private var dtask16:Task;
      
      private var dtask17:Task;
      
      private var dtask18:Task;
      
      private var dtask19:Task;
      
      private var dtask20:Task;
      
      private var dtask21:Task;
      
      private var dtask22:Task;
      
      private var dtask23:Task;
      
      private var dtask24:Task;
      
      private var dtask25:Task;
      
      private var dtask26:Task;
      
      private var dtask27:Task;
      
      private var dtask28:Task;
      
      private var dtask29:Task;
      
      private var dtask30:Task;
      
      private var dtask31:Task;
      
      private var dtask32:Task;
      
      private var dtask33:Task;
      
      private var dtask34:Task;
      
      private var dtask35:Task;
      
      private var dtask36:Task;
      
      private var dtask37:Task;
      
      private var dtask38:Task;
      
      private var dtask39:Task;
      
      private var dtask40:Task;
      
      private var dtask41:Task;
      
      private var dtask42:Task;
      
      private var dtask43:Task;
      
      public function GameTask()
      {
         super();
         this.newAllTask();
      }
      
      public function newAllTask() : void
      {
         var atask1:* = undefined;
         var atask2:* = undefined;
         var atask3:* = undefined;
         var atask4:* = undefined;
         var _loc1_:int = 0;
         this.dayTask = null;
         this.actTask = null;
         this.dayTask = new Array();
         this.actTask = new Array();
         this.dtask1 = new Task(1,"袭天的妖怪1","击杀黑龟20只！",[{
            "name":"黑龟",
            "mname":"Monster8",
            "neednum":20,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"whgzzs",
            "cname":"尾火棍制作书"
         },{
            "type":"lh",
            "value":"250",
            "cname":"灵魂"
         }]);
         this.dtask2 = new Task(2,"袭天的妖怪2","击杀黑虎20只！",[{
            "name":"黑虎",
            "mname":"Monster7",
            "neednum":20,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"jmczzs",
            "cname":"角木铲制作书"
         },{
            "type":"lh",
            "value":"250",
            "cname":"灵魂"
         }]);
         this.dtask3 = new Task(3,"袭天的妖怪3","击杀黑龟25只与巫鹰10只！",[{
            "name":"黑龟",
            "mname":"Monster8",
            "neednum":25,
            "curhas":0
         },{
            "name":"巫鹰",
            "mname":"Monster3",
            "neednum":10,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"bspzzs",
            "cname":"壁水袍制作书"
         },{
            "type":"lh",
            "value":"250",
            "cname":"灵魂"
         }]);
         this.dtask4 = new Task(4,"袭天的妖怪4","击杀黑虎25只与巫鹰10只！",[{
            "name":"黑虎",
            "mname":"Monster7",
            "neednum":25,
            "curhas":0
         },{
            "name":"巫鹰",
            "mname":"Monster3",
            "neednum":10,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"dtkzzs",
            "cname":"氐土铠制作书"
         },{
            "type":"lh",
            "value":"250",
            "cname":"灵魂"
         }]);
         this.dtask5 = new Task(5,"反叛的天兵1","击杀天兵(斧)与天兵(刀)各25只！",[{
            "name":"天兵(斧)",
            "mname":"Monster18",
            "neednum":25,
            "curhas":0
         },{
            "name":"天兵(刀)",
            "mname":"Monster9",
            "neednum":25,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"wtpzzs",
            "cname":"胃土耙制作书"
         },{
            "type":"exp",
            "value":"600",
            "cname":"经验"
         }]);
         this.dtask6 = new Task(6,"反叛的天兵2","击杀天兵(棒)与天兵(枪)各25只！",[{
            "name":"天兵(棒)",
            "mname":"Monster17",
            "neednum":25,
            "curhas":0
         },{
            "name":"天兵(枪)",
            "mname":"Monster10",
            "neednum":25,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"yhjzzs",
            "cname":"翼火甲制作书"
         },{
            "type":"exp",
            "value":"600",
            "cname":"经验"
         }]);
         this.dtask7 = new Task(7,"反叛的天兵3","击杀天兵(斧)与天兵(弓)各25只！",[{
            "name":"天兵(斧)",
            "mname":"Monster18",
            "neednum":25,
            "curhas":0
         },{
            "name":"天兵(弓)",
            "mname":"Monster19",
            "neednum":25,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"jmyzzs",
            "cname":"井木衣制作书"
         },{
            "type":"exp",
            "value":"600",
            "cname":"经验"
         }]);
         this.dtask8 = new Task(8,"梅山的余党1","击杀牛妖与蛇妖各30只！",[{
            "name":"牛妖",
            "mname":"Monster1",
            "neednum":30,
            "curhas":0
         },{
            "name":"蛇妖",
            "mname":"Monster13",
            "neednum":30,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"hljhzzs",
            "cname":"红莲教皇制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask9 = new Task(9,"梅山的余党2","击杀狗妖与蜈蚣精各35只！",[{
            "name":"狗妖",
            "mname":"Monster11",
            "neednum":35,
            "curhas":0
         },{
            "name":"蜈蚣精",
            "mname":"Monster14",
            "neednum":35,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"wsjgzzs",
            "cname":"顽石金刚制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask10 = new Task(10,"梅山的余党3","击杀羊妖与蜈蚣精各35只！",[{
            "name":"羊妖",
            "mname":"Monster12",
            "neednum":35,
            "curhas":0
         },{
            "name":"蜈蚣精",
            "mname":"Monster14",
            "neednum":35,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"ydjgzzs",
            "cname":"银弹金弓制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask11 = new Task(11,"挑战心魔1","战胜邪·沙僧5次！",[{
            "name":"邪·沙僧",
            "mname":"Monster32",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"lssp_1",
            "cname":"流石碎片1"
         },{
            "type":"dj",
            "value":"lssp_2",
            "cname":"流石碎片2"
         },{
            "type":"dj",
            "value":"lssp_3",
            "cname":"流石碎片3"
         }]);
         this.dtask12 = new Task(12,"挑战心魔2","战胜邪·八戒5次！",[{
            "name":"邪·八戒",
            "mname":"Monster33",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"lssp_2",
            "cname":"流石碎片2"
         },{
            "type":"dj",
            "value":"lssp_3",
            "cname":"流石碎片3"
         },{
            "type":"dj",
            "value":"lssp_4",
            "cname":"流石碎片4"
         }]);
         this.dtask13 = new Task(13,"挑战心魔3","战胜邪·唐僧5次！",[{
            "name":"邪·唐僧",
            "mname":"Monster31",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"lssp_5",
            "cname":"流石碎片5"
         },{
            "type":"dj",
            "value":"lssp_6",
            "cname":"流石碎片6"
         },{
            "type":"dj",
            "value":"lssp_7",
            "cname":"流石碎片7"
         }]);
         this.dtask14 = new Task(14,"挑战心魔4","战胜邪·悟空6次！",[{
            "name":"邪·悟空",
            "mname":"Monster34",
            "neednum":6,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"lssp_6",
            "cname":"流石碎片6"
         },{
            "type":"dj",
            "value":"lssp_7",
            "cname":"流石碎片7"
         },{
            "type":"dj",
            "value":"lssp_8",
            "cname":"流石碎片8"
         }]);
         this.dtask15 = new Task(15,"挑战心魔5","战胜邪·后羿7次！",[{
            "name":"邪·后羿",
            "mname":"Monster172",
            "neednum":7,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"lssp_7",
            "cname":"流石碎片7"
         },{
            "type":"dj",
            "value":"lssp_8",
            "cname":"流石碎片8"
         },{
            "type":"dj",
            "value":"lssp_9",
            "cname":"流石碎片9"
         }]);
         this.dtask16 = new Task(16,"大闹凌霄","战胜二郎神5次！",[{
            "name":"二郎神",
            "mname":"Monster22",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"wpflz",
            "cname":"风灵珠"
         },{
            "type":"lh",
            "value":"10000",
            "cname":"灵魂"
         }]);
         this.dtask17 = new Task(17,"冲上宝塔1","击杀6次土行孙！",[{
            "name":"土行孙",
            "mname":"Monster35",
            "neednum":6,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"xltczzs",
            "cname":"天残制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask18 = new Task(18,"冲上宝塔2","击杀6次土行孙！",[{
            "name":"土行孙",
            "mname":"Monster35",
            "neednum":6,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"xlyjzzs",
            "cname":"犹绝制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask19 = new Task(19,"冲上宝塔3","击杀5次雷震子！",[{
            "name":"雷震子",
            "mname":"Monster36",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"xlthzzs",
            "cname":"天荒制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask20 = new Task(20,"冲上宝塔4","击杀5次雷震子！",[{
            "name":"雷震子",
            "mname":"Monster36",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"xlryzzs",
            "cname":"如狱制作书"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask21 = new Task(21,"冲上宝塔5","击杀5次哪吒！",[{
            "name":"哪吒",
            "mname":"Monster38",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"rls",
            "cname":"熔炼石"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask22 = new Task(22,"冲上宝塔6","击杀5次李靖！",[{
            "name":"李靖",
            "mname":"Monster37",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"tss",
            "cname":"天枢石"
         },{
            "type":"dj",
            "value":"yhs",
            "cname":"玉衡石"
         },{
            "type":"exp",
            "value":"2000",
            "cname":"经验"
         }]);
         this.dtask23 = new Task(23,"铲除凶兽","在神兽森林击杀梼杌2次！",[{
            "name":"梼杌",
            "mname":"Monster47",
            "neednum":2,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"wplvdyl",
            "cname":"龙女的眼泪"
         }]);
         this.dtask24 = new Task(24,"勇闯兜率宫1","在兜率宫击杀银角大王4次！",[{
            "name":"银角大王",
            "mname":"Monster53",
            "neednum":4,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"wpdd",
            "cname":"毒丹"
         }]);
         this.dtask25 = new Task(25,"勇闯兜率宫2","在兜率宫击杀金角大王4次！",[{
            "name":"金角大王",
            "mname":"Monster54",
            "neednum":4,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"qljzzs",
            "cname":"虬龙甲制作书"
         },{
            "type":"zzs",
            "value":"plpzzs",
            "cname":"蟠龙袍制作书"
         },{
            "type":"zzs",
            "value":"ylkzzs",
            "cname":"应龙凯制作书"
         },{
            "type":"zzs",
            "value":"jljzzs",
            "cname":"蛟龙甲制作书"
         }]);
         this.dtask26 = new Task(26,"勇闯兜率宫3","在兜率宫击杀青牛精4次！",[{
            "name":"青牛精",
            "mname":"Monster58",
            "neednum":4,
            "curhas":0
         }],[{
            "type":"zzs",
            "value":"qlgzzs",
            "cname":"虬龙棍制作书"
         },{
            "type":"zzs",
            "value":"plzzzs",
            "cname":"蟠龙杖制作书"
         },{
            "type":"zzs",
            "value":"ylfzzs",
            "cname":"应龙斧制作书"
         },{
            "type":"zzs",
            "value":"jlczzs",
            "cname":"蛟龙铲制作书"
         }]);
         this.dtask27 = new Task(27,"九龙汇元","在九龙岛击杀1次高友乾",[{
            "name":"花豹圣者",
            "mname":"Monster118",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly4",
            "cname":"4级昆仑玉"
         }]);
         this.dtask28 = new Task(28,"兽藏龙脊","在龙脊山击杀1次杨森",[{
            "name":"狻猊圣者",
            "mname":"Monster120",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly4",
            "cname":"4级昆仑玉"
         }]);
         this.dtask29 = new Task(29,"匿隐尾妖","在尾妖林击杀1次王魔",[{
            "name":"狴犴圣者",
            "mname":"Monster125",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly4",
            "cname":"4级昆仑玉"
         }]);
         this.dtask30 = new Task(30,"仙音渺渺","在仙音岛击杀1次碧霄",[{
            "name":"碧霄",
            "mname":"Monster131",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly5",
            "cname":"5级昆仑玉"
         }]);
         this.dtask31 = new Task(31,"仙幻扑朔","在仙幻岛击杀1次琼霄",[{
            "name":"琼霄",
            "mname":"Monster135",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly5",
            "cname":"5级昆仑玉"
         }]);
         this.dtask32 = new Task(32,"仙树万丈","在仙树岛击杀1次云霄",[{
            "name":"云霄",
            "mname":"Monster139",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly5",
            "cname":"5级昆仑玉"
         }]);
         this.dtask33 = new Task(33,"寒暑易节","在寒暑水击杀5次毗摩智多罗",[{
            "name":"毗摩智多罗",
            "mname":"Monster1008",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly5",
            "cname":"5级昆仑玉"
         }]);
         this.dtask34 = new Task(34,"镬汤地狱","在火龙岛击杀5次罗宣",[{
            "name":"罗宣",
            "mname":"Monster111",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"roomhorse",
            "value":"1",
            "cname":"炎马"
         }]);
         this.dtask35 = new Task(35,"玉石俱焚·壹","击败1000只飞鹰",[{
            "name":"飞鹰",
            "mname":"Monster30",
            "neednum":1000,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly4",
            "cname":"4级昆仑玉"
         }]);
         this.dtask36 = new Task(36,"玉石俱焚·贰","击败1000只飞鹰",[{
            "name":"飞鹰",
            "mname":"Monster30",
            "neednum":1000,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"kly5",
            "cname":"5级昆仑玉"
         }]);
         this.dtask37 = new Task(37,"勇闯兜率宫6","在兜率宫击杀太上老君5次！",[{
            "name":"太上老君",
            "mname":"Monster65",
            "neednum":5,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"zy",
            "cname":"紫炎"
         }]);
         this.dtask38 = new Task(38,"真假六耳猕猴","在蟠桃园击杀六耳猕猴3次！",[{
            "name":"六耳猕猴",
            "mname":"Monster1007",
            "neednum":3,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"les",
            "cname":"六耳衫"
         },{
            "type":"dj",
            "value":"leg",
            "cname":"六耳棍"
         }]);
         _loc1_ = 0;
         this.dtask39 = new Task(39,"通天赦令","击杀蝉妖蚊妖千年蜈蚣各1只！",[{
            "name":"蚊妖",
            "mname":"Monster186",
            "neednum":1,
            "curhas":0
         },{
            "name":"蝉妖",
            "mname":"Monster189",
            "neednum":1,
            "curhas":0
         },{
            "name":"千年蜈蚣",
            "mname":"Monster203",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"ttsl",
            "cname":"通天赦令"
         }]);
         this.dtask40 = new Task(40,"头衔升级1","击杀雷震子1次",[{
            "name":"雷震子",
            "mname":"Monster36",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"yxqyzstx",
            "cname":"优秀七曜战神头衔"
         }]);
         this.dtask41 = new Task(41,"头衔升级2","击杀六耳猕猴1次",[{
            "name":"六耳猕猴",
            "mname":"Monster1007",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"jlqyzstx",
            "cname":"精良七曜战神头衔"
         }]);
         this.dtask42 = new Task(42,"头衔升级3","击杀太白金星1次",[{
            "name":"太白金星",
            "mname":"Monster64",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"ssqyzstx",
            "cname":"史诗七曜战神头衔"
         }]);
         this.dtask43 = new Task(43,"头衔升级4","击杀花豹圣者1次",[{
            "name":"花豹圣者",
            "mname":"Monster118",
            "neednum":1,
            "curhas":0
         }],[{
            "type":"dj",
            "value":"csqyzstx",
            "cname":"传说七曜战神头衔"
         }]);
         _loc1_ = 0;
         while(_loc1_ < 99)
         {
            try
            {
               this.dayTask.push(this["dtask" + (_loc1_ + 1)]);
            }
            catch(e:Error)
            {
               break;
            }
            _loc1_++;
         }
         atask1 = new Task(101,"参悟阴阳","拥有法宝：太极八卦",[],[{
            "type":"dj",
            "value":"kly5",
            "cname":"5级昆仑玉"
         }]);
         atask2 = new Task(102,"我不入地狱","存活在最后的魔，做了救世主!",[],[{
            "type":"dj",
            "value":"yxqyzstx",
            "cname":"七曜战神头衔"
         }]);
         atask3 = new Task(103,"天庭守护者","通关天庭主线关卡",[],[{
            "type":"exp",
            "value":"4000",
            "cname":"4k经验"
         },{
            "type":"lh",
            "value":"50000",
            "cname":"5w灵魂"
         }]);
         atask4 = new Task(104,"截教使者","通关截教天境",[],[{
            "type":"dj",
            "value":"yxqyzstx",
            "cname":"七曜战神头衔"
         }]);
         if(AllConsts.GAME_CONFIG_VERSION < 0.91)
         {
            return;
         }
      }
      
      public function getTaskByTaskName() : Task
      {
         return null;
      }
      
      public function hasReciveTaskByName() : Boolean
      {
         return false;
      }
      
      public function getdayTask() : Array
      {
         return this.dayTask;
      }
      
      public function getactTask() : Array
      {
         return this.actTask;
      }
      
      public function killMonster(param1:String) : void
      {
         var _loc2_:uint = uint(this.dayTask.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.dayTask[_loc3_].judgeNeed(param1))
            {
            }
            _loc3_++;
         }
         var _loc4_:uint = uint(this.actTask.length);
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_)
         {
            if(this.actTask[_loc5_].judgeNeed(param1))
            {
            }
            _loc5_++;
         }
      }
      
      public function saveAllTask() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = uint(this.dayTask.length);
         while(_loc2_-- > 0)
         {
            _loc1_ += Task(this.dayTask[_loc2_]).getSave();
            if(_loc2_ != 0)
            {
               _loc1_ += "}";
            }
         }
         return _loc1_;
      }
      
      public function saveActionTask() : String
      {
         var _loc1_:* = "";
         var _loc2_:uint = uint(this.actTask.length);
         while(_loc2_-- > 0)
         {
            _loc1_ += Task(this.actTask[_loc2_]).getSave();
            if(_loc2_ != 0)
            {
               _loc1_ += "}";
            }
         }
         return _loc1_;
      }
      
      public function setAllTask(param1:String) : void
      {
         var _loc2_:* = 0;
         var _loc3_:Array = param1.split("}");
         var _loc4_:uint = _loc3_.length;
         while(_loc4_-- > 0)
         {
            _loc2_ = uint(this.dayTask.length);
            while(_loc2_-- > 0)
            {
               if(Task(this.dayTask[_loc2_]).setSave(_loc3_[_loc4_]))
               {
                  break;
               }
            }
         }
      }
      
      public function setActTask(param1:String) : void
      {
         var _loc2_:* = 0;
         var _loc3_:Array = param1.split("}");
         var _loc4_:uint = _loc3_.length;
         while(_loc4_-- > 0)
         {
            _loc2_ = uint(this.actTask.length);
            while(_loc2_-- > 0)
            {
               if(Task(this.actTask[_loc2_]).setSave(_loc3_[_loc4_]))
               {
                  break;
               }
            }
         }
      }
   }
}

