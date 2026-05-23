package export.huodong
{
   import config.*;
   import event.CommonEvent;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.text.TextField;
   import user.User;
   
   public class ExchangeScore extends Sprite
   {
      
      private var gc:Config;
      
      private var sellbsList:Array;
      
      private var sellcwList:Array;
      
      private var sellszList:Array;
      
      private var selldjList:Array;
      
      private var selectTag:uint = 1;
      
      private var pageNum:uint = 1;
      
      private var curPage:uint = 1;
      
      public var st0:ESShopThing;
      
      public var st1:ESShopThing;
      
      public var st2:ESShopThing;
      
      public var st3:ESShopThing;
      
      public var st4:ESShopThing;
      
      public var st5:ESShopThing;
      
      public var st6:ESShopThing;
      
      public var st7:ESShopThing;
      
      public var st8:ESShopThing;
      
      public var btn_back:SimpleButton;
      
      public var btn_buyall:SimpleButton;
      
      public var btn_buybs:SimpleButton;
      
      public var btn_buysz:SimpleButton;
      
      public var btn_buycw:SimpleButton;
      
      public var btn_buydj:SimpleButton;
      
      private var lastBtn:String = "";
      
      private var btnState:*;
      
      private var lastBtn2:String = "";
      
      private var btnState2:*;
      
      public var btn_upPage:SimpleButton;
      
      public var btn_nextPage:SimpleButton;
      
      public var txt_page:TextField;
      
      public var txt_money:TextField;
      
      public var hdbtn:SimpleButton;
      
      public var p1btn:SimpleButton;
      
      public var p2btn:SimpleButton;
      
      private var player:User;
      
      private var seller:Object;
      
      public function ExchangeScore()
      {
         this.seller = new Object();
         this.sellbsList = new Array();
         this.sellcwList = new Array();
         this.sellszList = new Array();
         this.selldjList = new Array();
         super();
         this.gc = Config.getInstance();
         this.seller.one_thousand = 800;
         this.seller.one_hundred = 80;
         this.seller.three_hundred_fifty = 260;
         this.seller.one_thousand_two_hun = 960;
         this.seller.six_hundred = 480;
         this.seller.two_thousand_two = 1760;
         this.seller.three_thousand = 2400;
         this.seller.three_thousand_five = 2800;
         this.seller.ten_thousand = 8000;
         this.seller.five_thousand = 4000;
         this.seller.two_thousand = 1600;
         this.seller.four_thousand = 3200;
         this.seller.fifty = 40;
         this.seller.night_hundred = 720;
         this.seller.one_thousand_five = 1200;
         this.seller.five_hundred = 400;
         this.seller.eight_hundred = 640;
         this.seller.one_thousand_e_e_e = 1666;
         this.seller.score_wpqhs1_1 = "score_wpqhs1_1";
         this.seller.score_wpqhs1_4 = "score_wpqhs1_4";
         this.seller.score_gjs2_4 = "score_gjs2_4";
         this.seller.score_mfs3_3 = "score_mfs3_3";
         this.seller.score_wpqhs3_2 = "score_wpqhs3_2";
         this.seller.score_gjs3_3 = "score_gjs3_3";
         this.seller.score_wpqhs3_4 = "score_wpqhs3_4";
         this.seller.score_wpllz_4 = "score_wpllz_4";
         this.seller.score_wpflz_4 = "score_wpflz_4";
         this.seller.score_wpqhs4_8 = "score_wpqhs4_8";
         this.seller.score_cw_huwan = "score_cw_huwan";
         this.seller.score_cw_guibu = "score_cw_guibu";
         this.seller.score_cw_quedan = "score_cw_quedan";
         this.seller.score_cw_huowan = "score_cw_huowan";
         this.seller.score_cw_xueqiu = "score_cw_xueqiu";
         this.seller.score_cw_longzai = "score_cw_longzai";
         this.seller.score_cw_zishu = "score_cw_zishu";
         this.seller.score_cw_yuetu = "score_cw_yuetu";
         this.seller.score_ptzlwsz_1 = "score_ptzlwsz_1";
         this.seller.score_exp_2500 = "score_exp_2500";
         this.seller.score_mpyj_1 = "score_mpyj_1";
         this.seller.score_llyzzs_1 = "score_llyzzs_1";
         this.seller.score_rls_1 = "score_rls_1";
         this.seller.score_wpsmd1_3 = "score_wpsmd1_3";
         this.seller.score_wpsmd2_3 = "score_wpsmd2_3";
         this.seller.score_wpsmd3_3 = "score_wpsmd3_3";
         this.seller.score_wptm_500 = "score_wptm_500";
         this.seller.score_wpxt_500 = "score_wpxt_500";
         this.seller.score_wpsc_500 = "score_wpsc_500";
         this.seller.score_wplvdyl_50 = "score_wplvdyl_50";
         this.seller.score_yjp_1 = "score_yjp_1";
         this.seller.score_qljfb_1 = "score_qljfb_1";
         this.seller.score_nmwdnh_1 = "score_nmwdnh_1";
         this.seller.score_zlwdah_1 = "score_zlwdah_1";
         this.seller.score_jyhl_1 = "score_jyhl_1";
         this.seller.score_ptsmsrsz_1 = "score_ptsmsrsz_1";
         this.seller.score_mdhf_1 = "score_mdhf_1";
         this.seller.score_stlp_1 = "score_stlp_1";
         this.addEventListener(Event.ADDED_TO_STAGE,this.added,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.removed,false,0,true);
         this.sellbsList = [{"cname":"熔炼石"},{"cname":"1级强化石"},{"cname":"1级强化石"},{"cname":"2级攻击石"},{"cname":"3级魔法石"},{"cname":"3级攻击石"},{"cname":"雷灵珠"},{"cname":"风灵珠"},{"cname":"4级强化石"}];
         this.seller.sellbsScoreList = [this.seller.one_thousand,this.seller.one_hundred,this.seller.three_hundred_fifty,this.seller.one_thousand,this.seller.one_thousand_two_hun,this.seller.two_thousand_two,this.seller.three_thousand,this.seller.three_thousand_five,10000];
         this.seller.sellbsImgList = [this.seller.score_rls_1,this.seller.score_wpqhs1_1,this.seller.score_wpqhs1_4,this.seller.score_gjs2_4,this.seller.score_mfs3_3,this.seller.score_gjs3_3,this.seller.score_wpllz_4,this.seller.score_wpflz_4,this.seller.score_wpqhs4_8];
         this.sellcwList = [{"cname":"虎丸"},{"cname":"龟布"},{"cname":"雀蛋"},{"cname":"火丸"},{"cname":"雪球"},{"cname":"龙仔"},{"cname":"子鼠元帅"},{"cname":"月兔"}];
         this.seller.sellcwScoreList = [4000,4000,4000,4000,4000,5000,13000,5000];
         this.seller.sellcwImgList = [this.seller.score_cw_huwan,this.seller.score_cw_guibu,this.seller.score_cw_quedan,this.seller.score_cw_huowan,this.seller.score_cw_xueqiu,this.seller.score_cw_longzai,this.seller.score_cw_zishu,this.seller.score_cw_yuetu];
         this.sellszList = [{"cname":"转轮王装"},{"cname":"青龙剑"},{"cname":"神秘商人装"},{"cname":"九佑魂莲"},{"cname":"摩多魂帆"},{"cname":"奢天化雪令"}];
         this.seller.sellszScoreList = [this.seller.two_thousand,this.seller.one_thousand_e_e_e,this.seller.one_thousand_five,this.seller.ten_thousand,this.seller.ten_thousand,7888];
         this.seller.sellszImgList = [this.seller.score_ptzlwsz_1,this.seller.score_qljfb_1,this.seller.score_ptsmsrsz_1,this.seller.score_jyhl_1,this.seller.score_mdhf_1,this.seller.score_stlp_1];
         this.selldjList = [{"cname":"孟婆药剂"},{"cname":"玲珑玉制作书"},{"cname":"檀木"},{"cname":"玄铁"},{"cname":"丝绸"},{"cname":"龙女的眼泪"}];
         this.seller.selldjScoreList = [this.seller.one_thousand,this.seller.four_thousand,this.seller.five_hundred,this.seller.five_hundred,this.seller.five_hundred,this.seller.two_thousand];
         this.seller.selldjImgList = [this.seller.score_mpyj_1,this.seller.score_llyzzs_1,this.seller.score_wptm_500,this.seller.score_wpxt_500,this.seller.score_wpsc_500,this.seller.score_wplvdyl_50];
      }
      
      private function added(param1:Event) : void
      {
         this.btn_back.addEventListener(MouseEvent.CLICK,this.backClick);
         this.btn_buycw.addEventListener(MouseEvent.CLICK,this.buycwClick);
         this.btn_buyall.addEventListener(MouseEvent.CLICK,this.buyallClick);
         this.btn_buysz.addEventListener(MouseEvent.CLICK,this.buyszClick);
         this.btn_buybs.addEventListener(MouseEvent.CLICK,this.buybsClick);
         this.btn_buydj.addEventListener(MouseEvent.CLICK,this.buydjClick);
         if(this.gc.playNum == 1)
         {
            this.p1btn.addEventListener(MouseEvent.CLICK,this.play1Click);
            this.p2btn.visible = false;
         }
         else
         {
            this.p2btn.visible = true;
            this.p1btn.addEventListener(MouseEvent.CLICK,this.play1Click);
            this.p2btn.addEventListener(MouseEvent.CLICK,this.play2Click);
         }
         this.p1btn.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
         this.btn_upPage.addEventListener(MouseEvent.CLICK,this.upPageClick);
         this.btn_nextPage.addEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.gc.eventManger.addEventListener("ExchangeShopSuccess",this.exchangeSuccess);
         this.hdbtn.addEventListener(MouseEvent.CLICK,this.hdClick);
         this.setTxt();
         this.btn_buyall.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
      }
      
      private function removed(param1:Event) : void
      {
         this.btn_back.removeEventListener(MouseEvent.CLICK,this.backClick);
         this.btn_buycw.removeEventListener(MouseEvent.CLICK,this.buycwClick);
         this.btn_buyall.removeEventListener(MouseEvent.CLICK,this.buyallClick);
         this.btn_buysz.removeEventListener(MouseEvent.CLICK,this.buyszClick);
         this.btn_buybs.removeEventListener(MouseEvent.CLICK,this.buybsClick);
         this.btn_upPage.removeEventListener(MouseEvent.CLICK,this.upPageClick);
         this.btn_nextPage.removeEventListener(MouseEvent.CLICK,this.nextPageClick);
         this.hdbtn.removeEventListener(MouseEvent.CLICK,this.hdClick);
         this.p1btn.removeEventListener(MouseEvent.CLICK,this.play1Click);
         this.p2btn.removeEventListener(MouseEvent.CLICK,this.play2Click);
         this.gc.eventManger.removeEventListener("ExchangeShopSuccess",this.exchangeSuccess);
         this.btnState = null;
      }
      
      private function setPlayer() : void
      {
         var _loc1_:uint = 0;
         while(_loc1_ < 9)
         {
            this["st" + _loc1_].setPlayer(this.player);
            _loc1_++;
         }
      }
      
      private function play1Click(param1:MouseEvent) : void
      {
         this.player = this.gc.player1;
         this.setPlayer();
         if(this.btnState2)
         {
            if(this.lastBtn2 != "")
            {
               this[this.lastBtn2].upState = this.btnState2;
            }
         }
         this.lastBtn2 = "p1btn";
         this.btnState2 = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function play2Click(param1:MouseEvent) : void
      {
         this.player = this.gc.player2;
         this.setPlayer();
         if(this.btnState2)
         {
            if(this.lastBtn2 != "")
            {
               this[this.lastBtn2].upState = this.btnState2;
            }
         }
         this.lastBtn2 = "p2btn";
         this.btnState2 = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function exchangeSuccess(param1:CommonEvent) : void
      {
         this.setTxt();
      }
      
      private function hdClick(param1:MouseEvent) : void
      {
         this.gc.ts.setTxt("挑战 昆仑山无尽副本 即可获得积分！");
         this.gc.stage.addChild(this.gc.ts);
      }
      
      private function setTxt() : void
      {
         this.txt_page.text = this.curPage + "/" + this.pageNum;
         this.txt_money.text = this.gc.Objectdata.turntableScore + " ";
      }
      
      private function backClick(param1:MouseEvent) : void
      {
         if(this.parent)
         {
            this.parent.removeChild(this);
         }
      }
      
      private function buyallClick(param1:MouseEvent) : void
      {
         this.selectTag = 1;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buyall";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buybsClick(param1:MouseEvent) : void
      {
         this.selectTag = 2;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buybs";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buydjClick(param1:MouseEvent) : void
      {
         this.selectTag = 5;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buydj";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buycwClick(param1:MouseEvent) : void
      {
         this.selectTag = 3;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buycw";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function buyszClick(param1:MouseEvent) : void
      {
         this.selectTag = 4;
         this.curPage = 1;
         this.setShopThingEquipment();
         if(this.btnState)
         {
            if(this.lastBtn != "")
            {
               this[this.lastBtn].upState = this.btnState;
            }
         }
         this.lastBtn = "btn_buysz";
         this.btnState = param1.target.upState;
         param1.target.upState = param1.target.downState;
      }
      
      private function upPageClick(param1:MouseEvent) : void
      {
         if(this.curPage > 1)
         {
            --this.curPage;
            this.setShopThingEquipment();
            this.setTxt();
         }
      }
      
      private function nextPageClick(param1:MouseEvent) : void
      {
         if(this.curPage < this.pageNum)
         {
            ++this.curPage;
            this.setShopThingEquipment();
            this.setTxt();
         }
      }
      
      private function setShopThingEquipment() : void
      {
         var _loc1_:Array = [];
         var _loc2_:Array = [];
         var _loc3_:Array = [];
         switch(this.selectTag)
         {
            case 1:
               if(this.sellbsList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.sellbsList);
                  _loc2_ = _loc2_.concat(this.seller.sellbsScoreList);
                  _loc3_ = _loc3_.concat(this.seller.sellbsImgList);
               }
               if(this.selldjList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.selldjList);
                  _loc2_ = _loc2_.concat(this.seller.selldjScoreList);
                  _loc3_ = _loc3_.concat(this.seller.selldjImgList);
               }
               if(this.sellcwList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.sellcwList);
                  _loc2_ = _loc2_.concat(this.seller.sellcwScoreList);
                  _loc3_ = _loc3_.concat(this.seller.sellcwImgList);
               }
               if(this.sellszList.length > 0)
               {
                  _loc1_ = _loc1_.concat(this.sellszList);
                  _loc2_ = _loc2_.concat(this.seller.sellszScoreList);
                  _loc3_ = _loc3_.concat(this.seller.sellszImgList);
               }
               break;
            case 2:
               _loc1_ = this.sellbsList;
               _loc2_ = this.seller.sellbsScoreList;
               _loc3_ = this.seller.sellbsImgList;
               break;
            case 3:
               _loc1_ = this.sellcwList;
               _loc2_ = this.seller.sellcwScoreList;
               _loc3_ = this.seller.sellcwImgList;
               break;
            case 4:
               _loc1_ = this.sellszList;
               _loc2_ = this.seller.sellszScoreList;
               _loc3_ = this.seller.sellszImgList;
               break;
            case 5:
               _loc1_ = this.selldjList;
               _loc2_ = this.seller.selldjScoreList;
               _loc3_ = this.seller.selldjImgList;
         }
         var _loc4_:uint = 0;
         while(_loc4_ < 9)
         {
            this["st" + _loc4_].visible = false;
            this["st" + _loc4_].clearEquipment();
            if(_loc1_[_loc4_ + (this.curPage - 1) * 9])
            {
               this["st" + _loc4_].visible = true;
               this["st" + _loc4_].setEquipment(_loc1_[_loc4_ + (this.curPage - 1) * 9]);
               this["st" + _loc4_].setScore(_loc2_[_loc4_ + (this.curPage - 1) * 9]);
               this["st" + _loc4_].setImg(_loc3_[_loc4_ + (this.curPage - 1) * 9]);
            }
            _loc4_++;
         }
         var _loc5_:uint = _loc1_.length;
         this.pageNum = Math.ceil(_loc5_ / 9);
         if(this.pageNum == 0)
         {
            this.pageNum = 1;
         }
         this.setTxt();
      }
   }
}

