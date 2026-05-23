package myanalysis
{
   public class MyAllEquipId
   {
      
      private static var instance:MyAllEquipId;
      
      private var idAndFillNameAry:Array;
      
      public function MyAllEquipId()
      {
         this.idAndFillNameAry = [{
            "name":"kyg",
            "id":"186"
         },{
            "name":"kyz",
            "id":"187"
         },{
            "name":"kys",
            "id":"188"
         },{
            "name":"xhc",
            "id":"189"
         },{
            "name":"xhp",
            "id":"190"
         },{
            "name":"whg",
            "id":"191"
         },{
            "name":"jmc",
            "id":"192"
         },{
            "name":"bsp",
            "id":"193"
         },{
            "name":"dtk",
            "id":"194"
         },{
            "name":"qybd",
            "id":"195"
         },{
            "name":"qyfp",
            "id":"196"
         },{
            "name":"hylk",
            "id":"197"
         },{
            "name":"hylc",
            "id":"198"
         },{
            "name":"hylz",
            "id":"199"
         },{
            "name":"wtp",
            "id":"200"
         },{
            "name":"yhj",
            "id":"201"
         },{
            "name":"jmy",
            "id":"202"
         },{
            "name":"zjksf",
            "id":"203"
         },{
            "name":"zjqj",
            "id":"204"
         },{
            "name":"zjbtg",
            "id":"205"
         },{
            "name":"jllm",
            "id":"206"
         },{
            "name":"smz",
            "id":"207"
         },{
            "name":"ydjg",
            "id":"208"
         },{
            "name":"wsjg",
            "id":"209"
         },{
            "name":"hljh",
            "id":"210"
         },{
            "name":"dtkzzs",
            "id":"250"
         },{
            "name":"xhz",
            "id":"211"
         },{
            "name":"ydjgzzs",
            "id":"256"
         },{
            "name":"mgzhzzs",
            "id":"257"
         },{
            "name":"tdlzjzzs",
            "id":"258"
         },{
            "name":"qysz",
            "id":"212"
         },{
            "name":"shsjt",
            "id":"213"
         },{
            "name":"tflj",
            "id":"214"
         },{
            "name":"mgzh",
            "id":"215"
         },{
            "name":"tdlzj",
            "id":"216"
         },{
            "name":"kyl",
            "id":"217"
         },{
            "name":"xhhl",
            "id":"218"
         },{
            "name":"qyj",
            "id":"219"
         },{
            "name":"hyzzs",
            "id":"220"
         },{
            "name":"zjld",
            "id":"221"
         },{
            "name":"fys1",
            "id":"234"
         },{
            "name":"gjs1",
            "id":"235"
         },{
            "name":"mfs1",
            "id":"236"
         },{
            "name":"sms1",
            "id":"237"
         },{
            "name":"ptdxzf",
            "id":"238"
         },{
            "name":"ptdxzg",
            "id":"239"
         },{
            "name":"ptdjs",
            "id":"240"
         },{
            "name":"ptdcz",
            "id":"241"
         },{
            "name":"ptddp",
            "id":"242"
         },{
            "name":"ptdcs",
            "id":"243"
         },{
            "name":"ptdyyc",
            "id":"244"
         },{
            "name":"ptdcp",
            "id":"245"
         },{
            "name":"whgzzs",
            "id":"246"
         },{
            "name":"jmczzs",
            "id":"247"
         },{
            "name":"bspzzs",
            "id":"248"
         },{
            "name":"tfljzzs",
            "id":"249"
         },{
            "name":"wtpzzs",
            "id":"251"
         },{
            "name":"yhjzzs",
            "id":"252"
         },{
            "name":"jmyzzs",
            "id":"253"
         },{
            "name":"hljhzzs",
            "id":"254"
         },{
            "name":"wsjgzzs",
            "id":"255"
         },{
            "name":"scgjs2",
            "id":"230"
         },{
            "name":"scsms2",
            "id":"226"
         },{
            "name":"scwpqhs2",
            "id":"223"
         },{
            "name":"scwpqhs3",
            "id":"224"
         },{
            "name":"scwpqhs4",
            "id":"225"
         },{
            "name":"scsms3",
            "id":"227"
         },{
            "name":"scmfs2",
            "id":"228"
         },{
            "name":"scmfs3",
            "id":"229"
         },{
            "name":"scgjs3",
            "id":"231"
         },{
            "name":"scfys2",
            "id":"232"
         },{
            "name":"scfys3",
            "id":"233"
         },{
            "name":"wpqhs1",
            "id":"259"
         },{
            "name":"wpsc",
            "id":"260"
         },{
            "name":"wpxt",
            "id":"261"
         },{
            "name":"wptm",
            "id":"262"
         },{
            "name":"wpqhs2",
            "id":"263"
         },{
            "name":"wpqhs3",
            "id":"264"
         },{
            "name":"wpqhs4",
            "id":"265"
         },{
            "name":"sms2",
            "id":"266"
         },{
            "name":"sms3",
            "id":"267"
         },{
            "name":"mfs2",
            "id":"268"
         },{
            "name":"mfs3",
            "id":"269"
         },{
            "name":"gjs2",
            "id":"270"
         },{
            "name":"gjs3",
            "id":"271"
         },{
            "name":"fys2",
            "id":"272"
         },{
            "name":"fys3",
            "id":"273"
         },{
            "name":"wpxh",
            "id":"274"
         },{
            "name":"wpxyf",
            "id":"275"
         },{
            "name":"wpbdf",
            "id":"276"
         },{
            "name":"mysz",
            "id":"277"
         }];
         super();
         if(!instance)
         {
            instance = this;
         }
      }
      
      public static function getInstance() : MyAllEquipId
      {
         return instance;
      }
      
      public function idTransFillName(param1:String) : String
      {
         var _loc2_:uint = uint(this.idAndFillNameAry.length);
         while(_loc2_-- > 0)
         {
            if(this.idAndFillNameAry[_loc2_].id == param1)
            {
               return this.idAndFillNameAry[_loc2_].name;
            }
         }
         return "";
      }
      
      public function fillNameTransId(param1:String) : String
      {
         var _loc2_:uint = uint(this.idAndFillNameAry.length);
         while(_loc2_-- > 0)
         {
            if(this.idAndFillNameAry[_loc2_].name == param1)
            {
               return this.idAndFillNameAry[_loc2_].id;
            }
         }
         return "";
      }
      
      public function findIsCumulativeByName(param1:String) : Boolean
      {
         if(param1 == "wpqhs" || param1 == "zbwp")
         {
            return true;
         }
         return false;
      }
   }
}

