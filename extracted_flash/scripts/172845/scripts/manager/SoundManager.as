package manager
{
   import flash.media.*;
   
   public class SoundManager
   {
      
      public static var loopChannel:SoundChannel;
      
      private static var xz:Sound = AUtils.getNewObj("SD_xz");
      
      private static var Role1_hit1AndHit2:Sound = AUtils.getNewObj("Role1_hit1AndHit2");
      
      private static var Role1_hit3AndHit4:Sound = AUtils.getNewObj("Role1_hit3AndHit4");
      
      private static var Role1_beAttack:Sound = AUtils.getNewObj("Role1_beAttack");
      
      private static var Role1_hit5:Sound = AUtils.getNewObj("Role1_hit5");
      
      private static var Role1_hit6:Sound = AUtils.getNewObj("Role1_hit6");
      
      private static var Role1_hit7:Sound = AUtils.getNewObj("Role1_hit7");
      
      private static var Role1_hit8:Sound = AUtils.getNewObj("Role1_hit8");
      
      private static var Role1_hit9:Sound = AUtils.getNewObj("Role1_hit9");
      
      private static var Role1_hit10_2:Sound = AUtils.getNewObj("Role1_hit10_2");
      
      private static var Role1_hit10_4:Sound = AUtils.getNewObj("Role1_hit10_4");
      
      private static var Role1_hit11:Sound = AUtils.getNewObj("Role1_hit11");
      
      private static var Role1_hit12_1:Sound = AUtils.getNewObj("Role1_hit12_1");
      
      private static var Role1_hit12_2:Sound = AUtils.getNewObj("Role1_hit12_2");
      
      private static var Role1_hit13_1:Sound = AUtils.getNewObj("Role1_hit13_1");
      
      private static var Role1_hit13_2:Sound = AUtils.getNewObj("Role1_hit13_2");
      
      private static var Role1_hit14:Sound = AUtils.getNewObj("Role1_hit14");
      
      private static var Role1_dead:Sound = AUtils.getNewObj("Role1_dead");
      
      private static var Role1_jump:Sound = AUtils.getNewObj("Role1_jump");
      
      private static var Role2_hit1:Sound = AUtils.getNewObj("Role2_hit1");
      
      private static var Role2_hit2:Sound = AUtils.getNewObj("Role2_hit2");
      
      private static var Role2_hit3:Sound = AUtils.getNewObj("Role2_hit3");
      
      private static var Role2_hit4:Sound = AUtils.getNewObj("Role2_hit4");
      
      private static var Role2_hit5:Sound = AUtils.getNewObj("Role2_hit5");
      
      private static var Role2_hit6:Sound = AUtils.getNewObj("Role2_hit6");
      
      private static var Role2_hit7:Sound = AUtils.getNewObj("Role2_hit7");
      
      private static var Role2_hit8:Sound = AUtils.getNewObj("Role2_hit8");
      
      private static var Role2_hit9:Sound = AUtils.getNewObj("Role2_hit9");
      
      private static var Role2_hit10:Sound = AUtils.getNewObj("Role2_hit10");
      
      private static var Role2_dead:Sound = AUtils.getNewObj("Role2_dead");
      
      private static var Role2_jump:Sound = AUtils.getNewObj("Role2_jump");
      
      private static var Role2_beAttack:Sound = AUtils.getNewObj("Role2_beAttack");
      
      private static var Role3_hit1:Sound = AUtils.getNewObj("Role3_hit1");
      
      private static var Role3_hit2:Sound = AUtils.getNewObj("Role3_hit2");
      
      private static var Role3_hit3:Sound = AUtils.getNewObj("Role3_hit3");
      
      private static var Role3_hit4:Sound = AUtils.getNewObj("Role3_hit4");
      
      private static var Role3_hit5:Sound = AUtils.getNewObj("Role3_hit5");
      
      private static var Role3_hit6:Sound = AUtils.getNewObj("Role3_hit6");
      
      private static var Role3_hit7:Sound = AUtils.getNewObj("Role3_hit7");
      
      private static var Role3_hit8:Sound = AUtils.getNewObj("Role3_hit8");
      
      private static var Role3_hit9:Sound = AUtils.getNewObj("Role3_hit9");
      
      private static var Role3_hit10:Sound = AUtils.getNewObj("Role3_hit10");
      
      private static var Role3_hit11:Sound = AUtils.getNewObj("Role3_hit11");
      
      private static var Role3_hit12_1:Sound = AUtils.getNewObj("Role3_hit12_1");
      
      private static var Role3_hit12_2:Sound = AUtils.getNewObj("Role3_hit12_2");
      
      private static var Role3_dead:Sound = AUtils.getNewObj("Role3_dead");
      
      private static var Role3_jump:Sound = AUtils.getNewObj("Role3_jump");
      
      private static var Role3_beAttack:Sound = AUtils.getNewObj("Role3_beAttack");
      
      private static var Role4_hit1:Sound = AUtils.getNewObj("Role4_hit1");
      
      private static var Role4_hit2:Sound = AUtils.getNewObj("Role4_hit2");
      
      private static var Role4_hit3:Sound = AUtils.getNewObj("Role4_hit3");
      
      private static var Role4_hit1Arrow:Sound = AUtils.getNewObj("Role4_hit1Arrow");
      
      private static var Role4_hit2Arrow:Sound = AUtils.getNewObj("Role4_hit2Arrow");
      
      private static var Role4_hit4:Sound = AUtils.getNewObj("Role4_hit4");
      
      private static var Role4_hit4Arrow:Sound = AUtils.getNewObj("Role4_hit4Arrow");
      
      private static var Role4_hit5:Sound = AUtils.getNewObj("Role4_hit5");
      
      private static var Role4_hit6:Sound = AUtils.getNewObj("Role4_hit6");
      
      private static var Role4_hit7:Sound = AUtils.getNewObj("Role4_hit7");
      
      private static var Role4_hit8:Sound = AUtils.getNewObj("Role4_hit8");
      
      private static var Role4_hit8Arrow:Sound = AUtils.getNewObj("Role4_hit8Arrow");
      
      private static var Role4_hit9:Sound = AUtils.getNewObj("Role4_hit9");
      
      private static var Role4_hit9Arrow:Sound = AUtils.getNewObj("Role4_hit9Arrow");
      
      private static var Role4_hit10:Sound = AUtils.getNewObj("Role4_hit10");
      
      private static var Role4_hit10Arrow:Sound = AUtils.getNewObj("Role4_hit10Arrow");
      
      private static var Role4_hit11:Sound = AUtils.getNewObj("Role4_hit11");
      
      private static var Role4_hit12:Sound = AUtils.getNewObj("Role4_hit12");
      
      private static var Role4_hit12Arrow:Sound = AUtils.getNewObj("Role4_hit12Arrow");
      
      private static var Role4_mds:Sound = AUtils.getNewObj("Role4_mds");
      
      private static var begin:Sound = AUtils.getNewObj("begin");
      
      private static var over:Sound = AUtils.getNewObj("over");
      
      private static var stage0:Sound = AUtils.getNewObj("bg0");
      
      private static var stage1:Sound = AUtils.getNewObj("bg1");
      
      private static var stage2:Sound = AUtils.getNewObj("bg2");
      
      private static var stage3:Sound = AUtils.getNewObj("bg3");
      
      private static var stage4:Sound = AUtils.getNewObj("bg4");
      
      private static var stage5:Sound = AUtils.getNewObj("bg5");
      
      private static var stage6:Sound = AUtils.getNewObj("bg6");
      
      private static var stage7:Sound = AUtils.getNewObj("bg7");
      
      private static var stage12:Sound = AUtils.getNewObj("m_bg12");
      
      private static var stage13:Sound = AUtils.getNewObj("m_bg13");
      
      private static var stage21:Sound = AUtils.getNewObj("m_bg21");
      
      private static var stage22:Sound = AUtils.getNewObj("m_bg22");
      
      private static var stage26:Sound = AUtils.getNewObj("music_bg26");
      
      private static var Game_Victory:Sound = AUtils.getNewObj("Game_Victory");
      
      private static var BeattackByRole1:Sound = AUtils.getNewObj("BeattackByRole1");
      
      private static var BeattackByRole2:Sound = AUtils.getNewObj("BeattackByRole2");
      
      private static var pickup:Sound = AUtils.getNewObj("pickup");
      
      private static var Stage221MMMM1:Sound = AUtils.getNewObj("stage221mmmm1");
      
      private static var Stage221MMMM2:Sound = AUtils.getNewObj("stage221mmmm2");
      
      private static var Stage221MMMM3:Sound = AUtils.getNewObj("stage221mmmm3");
      
      private static var Stage221MMMM4:Sound = AUtils.getNewObj("stage221mmmm4");
      
      private static var Stage221MMMM5:Sound = AUtils.getNewObj("stage221mmmm5");
      
      private static var Stage221MMMM6:Sound = AUtils.getNewObj("stage221mmmm6");
      
      private static var Stage221MMMM7:Sound = AUtils.getNewObj("stage221mmmm7");
      
      public static var playing:String = "";
      
      public static var bgmStay:Boolean = true;
      
      public static var skillStay:Boolean = true;
      
      public static var soundStay:Boolean = true;
      
      public function SoundManager()
      {
         super();
      }
      
      public static function play(param1:String) : void
      {
         if(skillStay)
         {
            switch(param1)
            {
               case "xz":
                  xz.play();
                  break;
               case "Role1_dead":
                  Role1_dead.play();
                  break;
               case "Role1_jump":
                  Role1_jump.play();
                  break;
               case "Role1_hit1AndHit2":
                  Role1_hit1AndHit2.play();
                  break;
               case "Role1_hit3AndHit4":
                  Role1_hit3AndHit4.play();
                  break;
               case "Role1_hit5":
                  Role1_hit5.play();
                  break;
               case "Role1_hit6":
                  Role1_hit6.play();
                  break;
               case "Role1_hit7":
                  Role1_hit7.play();
                  break;
               case "Role1_hit8":
                  Role1_hit8.play();
                  break;
               case "Role1_hit9":
                  Role1_hit9.play();
                  break;
               case "Role1_hit11":
                  Role1_hit11.play();
                  break;
               case "Role1_hit12_1":
                  Role1_hit12_1.play();
                  break;
               case "Role1_hit12_2":
                  Role1_hit12_2.play();
                  break;
               case "Role1_hit13_1":
                  Role1_hit13_1.play();
                  break;
               case "Role1_hit13_2":
                  Role1_hit13_2.play();
                  break;
               case "Role1_hit14":
                  Role1_hit14.play();
                  break;
               case "Role1_hit10_2":
                  Role1_hit10_2.play();
                  break;
               case "Role1_hit10_4":
                  Role1_hit10_4.play();
                  break;
               case "Role1_beAttack":
                  Role1_beAttack.play();
                  break;
               case "Role2_beAttack":
                  Role2_beAttack.play();
                  break;
               case "Role3_beAttack":
                  Role3_beAttack.play();
                  break;
               case "BeattackByRole1":
                  BeattackByRole1.play();
                  break;
               case "BeattackByRole2":
                  BeattackByRole2.play();
                  break;
               case "Role2_dead":
                  Role2_dead.play();
                  break;
               case "Role2_jump":
                  Role2_jump.play();
                  break;
               case "Role2_hit1":
                  Role2_hit1.play();
                  break;
               case "Role2_hit2":
                  Role2_hit2.play();
                  break;
               case "Role2_hit3":
                  Role2_hit3.play();
                  break;
               case "Role2_hit4":
                  Role2_hit4.play();
                  break;
               case "Role2_hit5":
                  Role2_hit5.play();
                  break;
               case "Role2_hit6":
                  Role2_hit6.play();
                  break;
               case "Role2_hit7":
                  Role2_hit7.play();
                  break;
               case "Role2_hit8":
                  Role2_hit8.play();
                  break;
               case "Role2_hit9":
                  Role2_hit9.play();
                  break;
               case "Role2_hit10":
                  Role2_hit10.play();
                  break;
               case "Role3_dead":
                  Role3_dead.play();
                  break;
               case "Role3_jump":
                  Role3_jump.play();
                  break;
               case "Role3_hit1":
                  Role3_hit1.play();
                  break;
               case "Role3_hit2":
                  Role3_hit2.play();
                  break;
               case "Role3_hit3":
                  Role3_hit3.play();
                  break;
               case "Role3_hit4":
                  Role3_hit4.play();
                  break;
               case "Role3_hit5":
                  Role3_hit5.play();
                  break;
               case "Role3_hit6":
                  Role3_hit6.play();
                  break;
               case "Role3_hit7":
                  Role3_hit7.play();
                  break;
               case "Role3_hit8":
                  Role3_hit8.play();
                  break;
               case "Role3_hit9":
                  Role3_hit9.play();
                  break;
               case "Role3_hit10":
                  Role3_hit10.play();
                  break;
               case "Role3_hit11":
                  Role3_hit11.play();
                  break;
               case "Role3_hit12_1":
                  Role3_hit12_1.play();
                  break;
               case "Role3_hit12_2":
                  Role3_hit12_2.play();
                  break;
               case "Role4_hit1":
                  Role4_hit1.play();
                  break;
               case "Role4_hit2":
                  Role4_hit2.play();
                  break;
               case "Role4_hit3":
                  Role4_hit3.play();
                  break;
               case "Role4_hit1Arrow":
                  Role4_hit1Arrow.play();
                  break;
               case "Role4_hit2Arrow":
                  Role4_hit2Arrow.play();
                  break;
               case "Role4_hit4":
                  Role4_hit4.play();
                  break;
               case "Role4_hit4Arrow":
                  Role4_hit4Arrow.play();
                  break;
               case "Role4_hit5":
                  Role4_hit5.play();
                  break;
               case "Role4_hit6":
                  Role4_hit6.play();
                  break;
               case "Role4_hit7":
                  Role4_hit7.play();
                  break;
               case "Role4_hit8":
                  Role4_hit8.play();
                  break;
               case "Role4_hit8Arrow":
                  Role4_hit8Arrow.play();
                  break;
               case "Role4_hit9Arrow":
                  Role4_hit9Arrow.play();
                  break;
               case "Role4_hit10":
                  Role4_hit10.play();
                  break;
               case "Role4_hit10Arrow":
                  Role4_hit10Arrow.play();
                  break;
               case "Role4_hit11":
                  Role4_hit11.play();
                  break;
               case "Role4_hit12":
                  Role4_hit12.play();
                  break;
               case "Role4_hit12Arrow":
                  Role4_hit12Arrow.play();
                  break;
               case "Role4_mds":
                  Role4_mds.play();
                  break;
               case "Game_Victory":
                  Game_Victory.play();
                  break;
               case "pickup":
                  pickup.play();
                  break;
               case "stage221mmmm1":
                  Stage221MMMM1.play();
                  break;
               case "stage221mmmm2":
                  Stage221MMMM2.play();
                  break;
               case "stage221mmmm3":
                  Stage221MMMM3.play();
                  break;
               case "stage221mmmm4":
                  Stage221MMMM4.play();
                  break;
               case "stage221mmmm5":
                  Stage221MMMM5.play();
                  break;
               case "stage221mmmm6":
                  Stage221MMMM6.play();
                  break;
               case "stage221mmmm7":
                  Stage221MMMM7.play();
            }
         }
         if(bgmStay)
         {
            switch(param1)
            {
               case "begin":
                  if(playing != "begin")
                  {
                     playing = "begin";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = begin.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "over":
                  if(playing != "over")
                  {
                     playing = "over";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = over.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage0":
                  if(playing != "stage0")
                  {
                     playing = "stage0";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage0.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage1":
                  if(playing != "stage1")
                  {
                     playing = "stage1";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage1.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage2":
                  if(playing != "stage2")
                  {
                     playing = "stage2";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage2.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage3":
                  if(playing != "stage3")
                  {
                     playing = "stage3";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage3.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage4":
                  if(playing != "stage4")
                  {
                     playing = "stage4";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage4.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage5":
                  if(playing != "stage5")
                  {
                     playing = "stage5";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage5.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage6":
                  if(playing != "stage6")
                  {
                     playing = "stage6";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage6.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage7":
                  if(playing != "stage7")
                  {
                     playing = "stage7";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage7.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage12":
                  if(playing != "stage12")
                  {
                     playing = "stage12";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage12.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage13":
                  if(playing != "stage13")
                  {
                     playing = "stage13";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage13.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage21":
                  if(playing != "stage21")
                  {
                     playing = "stage21";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage21.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage22":
                  if(playing != "stage22")
                  {
                     playing = "stage22";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage22.play(0,9999);
                     setVom(loopChannel);
                  }
                  break;
               case "stage26":
                  if(playing != "stage26")
                  {
                     playing = "stage26";
                     if(loopChannel)
                     {
                        loopChannel.stop();
                     }
                     loopChannel = stage26.play(0,9999);
                     setVom(loopChannel);
                  }
            }
         }
      }
      
      public static function clearLoop() : void
      {
         loopChannel.stop();
         playing = "";
      }
      
      public static function setVom(param1:SoundChannel, param2:Number = 1) : void
      {
         var _loc3_:SoundTransform = param1.soundTransform;
         _loc3_.volume = param2;
         param1.soundTransform = _loc3_;
      }
      
      public static function controlSound() : *
      {
         if(soundStay)
         {
            soundStay = false;
            SoundMixer.soundTransform = new SoundTransform(0);
         }
         else
         {
            soundStay = true;
            SoundMixer.soundTransform = new SoundTransform(1);
         }
      }
   }
}

