package export.pet
{
   import base.*;
   import flash.display.Sprite;
   import flash.events.*;
   import flash.geom.*;
   
   public class PetHeadSprite extends Sprite
   {
      
      private var bbdc:BaseBitmapDataClip;
      
      private var petName:String;
      
      public function PetHeadSprite(param1:String)
      {
         super();
         this.petName = param1;
         this.initBBC();
      }
      
      private function initBBC() : void
      {
         var _loc1_:* = null;
         var _loc2_:String = "";
         if(this.petName == "monkey1")
         {
            _loc2_ = "PetMonkeyBmd1";
         }
         else if(this.petName == "monkey2")
         {
            _loc2_ = "PetMonkeyBmd2";
         }
         else if(this.petName == "monkey3")
         {
            _loc2_ = "PetMonkeyBmd3";
         }
         else if(this.petName == "monkey4")
         {
            _loc2_ = "PetMonkeyBmd4";
         }
         else if(this.petName == "horse1")
         {
            _loc2_ = "PetHorseBmd1";
         }
         else if(this.petName == "horse2")
         {
            _loc2_ = "PetHorseBmd2";
         }
         else if(this.petName == "horse3")
         {
            _loc2_ = "PetHorseBmd3";
         }
         else if(this.petName == "horse4")
         {
            _loc2_ = "PetHorseBmd4";
         }
         else if(this.petName == "ufo1")
         {
            _loc2_ = "PetKabuBmd1";
         }
         else if(this.petName == "ufo2")
         {
            _loc2_ = "PetKabuBmd2";
         }
         else if(this.petName == "ufo3")
         {
            _loc2_ = "PetKabuBmd3";
         }
         else if(this.petName == "tigress1")
         {
            _loc2_ = "PetTigerBmd1";
         }
         else if(this.petName == "tigress2")
         {
            _loc2_ = "PetTigerBmd2";
         }
         else if(this.petName == "tigress3")
         {
            _loc2_ = "PetTigerBmd3";
         }
         else if(this.petName == "tigress4")
         {
            _loc2_ = "PetTigerBmd4";
         }
         else if(this.petName == "turtle1")
         {
            _loc2_ = "PetTurtleBmd1";
         }
         else if(this.petName == "turtle2")
         {
            _loc2_ = "PetTurtleBmd2";
         }
         else if(this.petName == "turtle3")
         {
            _loc2_ = "PetTurtleBmd3";
         }
         else if(this.petName == "turtle4")
         {
            _loc2_ = "PetTurtleBmd4";
         }
         else if(this.petName == "phoenix1")
         {
            _loc2_ = "PetPhoenixBmd1";
         }
         else if(this.petName == "phoenix2")
         {
            _loc2_ = "PetPhoenixBmd2";
         }
         else if(this.petName == "phoenix3")
         {
            _loc2_ = "PetPhoenixBmd3";
         }
         else if(this.petName == "phoenix4")
         {
            _loc2_ = "PetPhoenixBmd4";
         }
         else if(this.petName == "dragon1")
         {
            _loc2_ = "PetDragonBmd1";
         }
         else if(this.petName == "dragon2")
         {
            _loc2_ = "PetDragonBmd2";
         }
         else if(this.petName == "dragon3")
         {
            _loc2_ = "PetDragonBmd3";
         }
         else if(this.petName == "dragon4")
         {
            _loc2_ = "PetDragonBmd4";
         }
         else if(this.petName == "rabbit1")
         {
            _loc2_ = "PetPetRabbitBmd1";
         }
         else if(this.petName == "rabbit2")
         {
            _loc2_ = "PetPetRabbitBmd2";
         }
         else if(this.petName == "rabbit3")
         {
            _loc2_ = "PetPetRabbitBmd3";
         }
         else if(this.petName == "rabbit4")
         {
            _loc2_ = "PetPetRabbitBmd4";
         }
         else if(this.petName == "roomhorse1" || this.petName == "roomhorse2" || this.petName == "roomhorse3")
         {
            _loc2_ = "PetRoomHorseBmd1";
         }
         else if(this.petName == "roomhorse4")
         {
            _loc2_ = "PetRoomHorseBmd4";
         }
         else if(this.petName == "mouse1" || this.petName == "mouse2" || this.petName == "mouse3")
         {
            _loc2_ = "PetMouseBmd1";
         }
         else if(this.petName == "mouse4")
         {
            _loc2_ = "PetMouseBmd2";
         }
         else if(this.petName == "neat1" || this.petName == "neat2" || this.petName == "neat3")
         {
            _loc2_ = "PetNeatBmd1";
         }
         else if(this.petName == "neat4")
         {
            _loc2_ = "PetNeatBmd4";
         }
         else if(this.petName == "terribletiger1" || this.petName == "terribletiger2" || this.petName == "terribletiger3")
         {
            _loc2_ = "PetYinTaigerBmd1";
         }
         else if(this.petName == "terribletiger4")
         {
            _loc2_ = "PetYinTaigerBmd2";
         }
         else if(this.petName == "nian1" || this.petName == "nian2" || this.petName == "nian3")
         {
            _loc2_ = "Monster1551";
         }
         else if(this.petName == "nian4")
         {
            _loc2_ = "Monster155";
         }
         else if(this.petName == "nian5")
         {
            _loc2_ = "PetNianBmd5";
         }
         var _loc3_:Array = BaseBitmapDataPool.getBitmapDataArrayByName(_loc2_);
         if(_loc3_)
         {
            _loc1_ = {
               "name":"body",
               "source":_loc3_
            };
            if(this.petName == "monkey1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],70,70,new Point(0,0));
               this.bbdc.setOffsetXY(-8,-10);
               this.bbdc.setFrameStopCount([[2,2,2,2],[8],[2,2,2,2,1,1],[2,2,2,10],[1,1,1,12]]);
               this.bbdc.setFrameCount([4,1,6,4,4]);
            }
            else if(this.petName == "monkey2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
               this.bbdc.setOffsetXY(-8,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,8],[1,1],[10]]);
               this.bbdc.setFrameCount([6,4,1,5,3,12,1]);
            }
            else if(this.petName == "monkey3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(-8,5);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,8],[2,9,15],[10],[1,1]]);
               this.bbdc.setFrameCount([6,4,1,5,3,3,1,20]);
            }
            else if(this.petName == "monkey4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(-8,-5);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,8],[2,9,15],[10],[1,1],[2,2,2]]);
               this.bbdc.setFrameCount([6,4,1,5,3,3,1,20,3]);
            }
            else if(this.petName == "horse1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],80,80,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,1,2],[2,2,1,1,8],[2,2,2,8]]);
               this.bbdc.setFrameCount([6,1,6,5,4]);
               this.addChild(this.bbdc);
            }
            else if(this.petName == "horse2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,4,20],[15],[2,2,1,1,8]]);
               this.bbdc.setFrameCount([6,4,1,4,3,1,5]);
            }
            else if(this.petName == "horse3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(12,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,8],[1,1],[10]]);
               this.bbdc.setFrameCount([6,4,1,5,3,12,1]);
            }
            else if(this.petName == "horse4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-25);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,8],[1,1],[10]]);
               this.bbdc.setFrameCount([6,4,1,5,3,12,1]);
            }
            else if(this.petName == "ufo1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],80,80,new Point(0,0));
               this.bbdc.setOffsetXY(12,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,2,10]]);
               this.bbdc.setFrameCount([6,1,5,4,4]);
            }
            else if(this.petName == "ufo2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
               this.bbdc.setOffsetXY(12,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,2,10]]);
               this.bbdc.setFrameCount([6,1,5,4,4]);
            }
            else if(this.petName == "ufo3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(12,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,2,10]]);
               this.bbdc.setFrameCount([6,1,5,4,4]);
            }
            else if(this.petName == "tigress1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
               this.bbdc.setOffsetXY(12,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,2,10]]);
               this.bbdc.setFrameCount([6,1,4,4,4]);
            }
            else if(this.petName == "tigress2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(12,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,2,10],[2,2,2,10]]);
               this.bbdc.setFrameCount([6,1,5,4,3,3]);
            }
            else if(this.petName == "tigress3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(20,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,4,3,5]);
            }
            else if(this.petName == "tigress4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
               this.bbdc.setOffsetXY(30,-15);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,4,3,5]);
            }
            else if(this.petName == "turtle1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,1,5,3,3]);
            }
            else if(this.petName == "turtle2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "turtle3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
               this.bbdc.setOffsetXY(21,5);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "turtle4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
               this.bbdc.setOffsetXY(21,-17);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "phoenix1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,1,5,3,3]);
            }
            else if(this.petName == "phoenix2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "phoenix3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "phoenix4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
               this.bbdc.setOffsetXY(1,-40);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2],[2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "dragon1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(1,-5);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,10],[2,2,2,10],[2,2,2,2,10]]);
               this.bbdc.setFrameCount([6,1,4,4,5]);
            }
            else if(this.petName == "dragon2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-5);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,2,2,10],[30]]);
               this.bbdc.setFrameCount([6,4,1,5,4,5,1]);
            }
            else if(this.petName == "dragon3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
               this.bbdc.setOffsetXY(1,-15);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,7,2,2,10],[2,2,2,2,10],[30],[2,2,30]]);
               this.bbdc.setFrameCount([6,4,1,5,6,5,1,3]);
            }
            else if(this.petName == "dragon4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],300,250,new Point(0,0));
               this.bbdc.setOffsetXY(31,-15);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,7,2,2,10],[2,2,2,2,10],[30],[2,2,30]]);
               this.bbdc.setFrameCount([6,4,1,5,6,5,1,3]);
            }
            else if(this.petName == "rabbit1")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],100,100,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[8],[2,2,2,2,10],[2,2,2,10],[2,10]]);
               this.bbdc.setFrameCount([6,1,5,4,2]);
            }
            else if(this.petName == "rabbit2")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,2,10],[2,10],[10]]);
               this.bbdc.setFrameCount([6,4,1,5,5,2,1]);
            }
            else if(this.petName == "rabbit3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-28);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,2,10],[2,10],[10]]);
               this.bbdc.setFrameCount([6,4,1,5,5,2,1]);
            }
            else if(this.petName == "rabbit4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],250,250,new Point(0,0));
               this.bbdc.setOffsetXY(1,-48);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,2,2],[2,10],[10],[1,1,1,7,1,40]]);
               this.bbdc.setFrameCount([6,4,1,5,5,2,1,6]);
            }
            else if(this.petName == "roomhorse1" || this.petName == "roomhorse2" || this.petName == "roomhorse3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,10],[3,3,10],[2,2,2,2]]);
               this.bbdc.setFrameCount([6,4,1,6,3,4]);
            }
            else if(this.petName == "roomhorse4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-18);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,10],[3,3,10],[2,2,2],[3,3,10]]);
               this.bbdc.setFrameCount([6,4,1,6,3,3,3]);
            }
            else if(this.petName == "mouse1" || this.petName == "mouse2" || this.petName == "mouse3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(-20,-25);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[2,2,2,2]]);
               this.bbdc.setFrameCount([6,4,1,5,3,4]);
            }
            else if(this.petName == "mouse4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(-20,-25);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[2,2,1,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,3,4,3]);
            }
            else if(this.petName == "neat1" || this.petName == "neat2" || this.petName == "neat3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(10,-25);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[30]]);
               this.bbdc.setFrameCount([6,4,1,5,3,1]);
            }
            else if(this.petName == "neat4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(10,-25);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,10],[30],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,3,1,3]);
            }
            else if(this.petName == "nian1" || this.petName == "nian2" || this.petName == "nian3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],150,150,new Point(0,0));
               this.bbdc.setOffsetXY(1,-10);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,10]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3]);
            }
            else if(this.petName == "nian4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],300,200,new Point(0,0));
               this.bbdc.setOffsetXY(-15,5);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,2,10],[30]]);
               this.bbdc.setFrameCount([6,4,1,5,4,3,1]);
               this.bbdc.scaleX = 0.8;
               this.bbdc.scaleY = 0.8;
            }
            else if(this.petName == "nian5")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],300,300,new Point(0,0));
               this.bbdc.setOffsetXY(-15,0);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,10],[2,2,2,10],[2,10],[30],[30]]);
               this.bbdc.setFrameCount([6,4,1,5,4,2,1,1]);
               this.bbdc.scaleX = 0.8;
               this.bbdc.scaleY = 0.8;
            }
            else if(this.petName == "terribletiger1" || this.petName == "terribletiger2" || this.petName == "terribletiger3")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],160,160,new Point(0,0));
               this.bbdc.setOffsetXY(1,-25);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,10],[3,3,10],[2,2,2,2]]);
               this.bbdc.setFrameCount([6,4,1,6,3,4]);
            }
            else if(this.petName == "terribletiger4")
            {
               this.bbdc = new BaseBitmapDataClip([_loc1_],200,200,new Point(0,0));
               this.bbdc.setOffsetXY(1,-23);
               this.bbdc.setFrameStopCount([[2,2,2,3,2,4],[4,4,4,4],[8],[2,2,2,2,2,10],[3,3,3,3,10],[3,3,10],[3,3,3,30]]);
               this.bbdc.setFrameCount([6,4,1,6,5,3,4]);
            }
            this.addChild(this.bbdc);
            this.addEventListener(Event.ENTER_FRAME,this.__enterFrame);
            return;
         }
         throw new Error("HeadSprite---" + _loc2_ + "---type Error");
      }
      
      private function __enterFrame(param1:Event) : void
      {
         if(this.bbdc)
         {
            this.bbdc.step();
         }
      }
      
      public function destroy() : void
      {
         this.bbdc.destroy();
         this.removeEventListener(Event.ENTER_FRAME,this.__enterFrame);
      }
   }
}

