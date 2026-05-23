package com.multi4399
{
   import com.multi4399.define.*;
   import com.multi4399.keys.*;
   import flash.events.*;
   import flash.net.*;
   import flash.utils.*;
   
   public class Client extends EventDispatcher
   {
      
      protected var _sock:Socket;
      
      protected var _host:String;
      
      protected var _port:int;
      
      protected var _request:RequestPacket;
      
      protected var _response:ByteArray;
      
      public function Client()
      {
         this._sock = new Socket();
         this._request = new RequestPacket();
         this._response = new ByteArray();
         super();
         this._response.endian = Endian.LITTLE_ENDIAN;
         this._sock.addEventListener(Event.CONNECT,this.onSocket,false,0,true);
         this._sock.addEventListener(Event.CLOSE,this.onSocket,false,0,true);
         this._sock.addEventListener(IOErrorEvent.IO_ERROR,this.onSocket,false,0,true);
         this._sock.addEventListener(SecurityErrorEvent.SECURITY_ERROR,this.onSocket,false,0,true);
         this._sock.addEventListener(ProgressEvent.SOCKET_DATA,this.onSocketData,false,0,true);
      }
      
      public function connect(param1:String, param2:int) : void
      {
         if(this._sock.connected)
         {
            this._sock.close();
         }
         this._host = param1;
         this._port = param2;
         this._response.position = 0;
         this._response.length = 0;
         this._sock.connect(this._host,this._port);
      }
      
      public function get connected() : Boolean
      {
         return this._sock.connected;
      }
      
      public function close() : void
      {
         this._sock.close();
      }
      
      public function get socket() : Socket
      {
         return this._sock;
      }
      
      public function submit(param1:uint) : void
      {
         if(param1 >= 4096)
         {
            throw new Error("自定义标记号码必须在4096的数值以下!");
         }
         this._request.pack(param1);
         this._sock.writeBytes(this._request);
         this._sock.flush();
         this._request.reset();
      }
      
      private function onSocket(param1:Event) : void
      {
         this.dispatchEvent(param1);
      }
      
      private function onSocketData(param1:ProgressEvent) : void
      {
         var _loc2_:* = 0;
         var _loc3_:* = null;
         var _loc4_:* = 0;
         var _loc5_:* = 0;
         var _loc6_:* = 0;
         var _loc7_:* = 0;
         var _loc8_:* = 0;
         var _loc9_:* = null;
         var _loc10_:* = 0;
         var _loc11_:* = 0;
         var _loc12_:* = 0;
         var _loc13_:* = 0;
         var _loc14_:int = 0;
         var _loc15_:int = 0;
         var _loc16_:int = 0;
         var _loc17_:int = 0;
         var _loc18_:int = 0;
         var _loc19_:int = 0;
         var _loc20_:int = 0;
         var _loc21_:* = null;
         var _loc22_:* = null;
         var _loc23_:* = null;
         this._sock.readBytes(this._response,this._response.length);
         while(true)
         {
            _loc2_ = uint(this._response.bytesAvailable);
            if(!_loc2_)
            {
               break;
            }
            if(_loc2_ < SETTING.RESPONSE_HEADER_SIZE)
            {
               break;
            }
            _loc3_ = this._response.readUTFBytes(4);
            if(_loc3_ != "YMP")
            {
               this._response.length = this._response.position = 0;
               break;
            }
            _loc4_ = uint(this._response.readUnsignedByte());
            if(_loc4_ != 65)
            {
               this._response.length = this._response.position = 0;
               break;
            }
            _loc5_ = uint(this._response.readUnsignedByte());
            _loc6_ = uint(this._response.readUnsignedShort());
            if(_loc6_ > SETTING.MAX_RESPONSE_SIZE)
            {
               this._response.length = this._response.position = 0;
               break;
            }
            if(_loc2_ < _loc6_)
            {
               this._response.position -= 8;
               break;
            }
            _loc7_ = uint(this._response.readUnsignedShort());
            _loc8_ = uint(_loc6_ - Number(SETTING.RESPONSE_HEADER_SIZE));
            _loc9_ = new ResponseEvent(ResponseEvent.PACKET);
            _loc9_.mark = _loc7_;
            while(_loc8_)
            {
               _loc10_ = uint(this._response.readByte());
               _loc8_--;
               _loc11_ = uint(_loc10_ & 0xF8);
               _loc12_ = uint(_loc10_ & 7);
               if(_loc12_ == OPRAND.SIZE_1)
               {
                  _loc9_.values.push(this._response.readUnsignedByte());
                  _loc8_--;
               }
               else if(_loc12_ == OPRAND.SIZE_2)
               {
                  _loc9_.values.push(this._response.readUnsignedShort());
                  _loc8_ = uint(_loc8_ - 2);
                  if(_loc11_ == OPRAND.TYPE_ERROR)
                  {
                     _loc9_.errors.push(_loc9_.values.length - 1);
                  }
               }
               else if(_loc12_ == OPRAND.SIZE_4)
               {
                  _loc9_.values.push(this._response.readUnsignedInt());
                  _loc8_ = uint(_loc8_ - 4);
               }
               else if(_loc12_ == OPRAND.SIZE_8)
               {
                  _loc9_.values.push(this._response.readDouble());
                  _loc8_ = uint(_loc8_ - 8);
               }
               else if(_loc12_ == OPRAND.SIZE_M)
               {
                  _loc13_ = uint(this._response.readUnsignedShort());
                  _loc8_ = uint(_loc8_ - (2 + _loc13_));
                  if(_loc11_ == OPRAND.TYPE_TIME)
                  {
                     _loc14_ = int(this._response.readUnsignedShort());
                     _loc15_ = int(this._response.readUnsignedByte());
                     _loc16_ = int(this._response.readUnsignedByte());
                     _loc17_ = int(this._response.readUnsignedByte());
                     _loc18_ = int(this._response.readUnsignedByte());
                     _loc19_ = int(this._response.readUnsignedByte());
                     _loc20_ = int(this._response.readUnsignedShort());
                     _loc21_ = new Date(_loc14_,_loc15_,_loc16_,_loc17_,_loc18_,_loc19_,_loc20_);
                     _loc9_.values.push(_loc21_);
                  }
                  else if(_loc11_ == OPRAND.TYPE_INT)
                  {
                     _loc9_.values.push(this._response.readInt());
                  }
                  else if(_loc11_ == OPRAND.TYPE_NUMBER)
                  {
                     _loc9_.values.push(this._response.readDouble());
                  }
                  else if(_loc11_ == OPRAND.TYPE_STRING)
                  {
                     _loc9_.values.push(this._response.readUTFBytes(_loc13_));
                  }
                  else if(_loc11_ == OPRAND.TYPE_XML)
                  {
                     _loc9_.values.push(new XML(this._response.readUTFBytes(_loc13_)));
                  }
                  else
                  {
                     _loc22_ = new ByteArray();
                     _loc13_ && this._response.readBytes(_loc22_,0,_loc13_);
                     _loc9_.values.push(_loc22_);
                  }
               }
            }
            this.dispatchEvent(_loc9_);
         }
         if(this._response.bytesAvailable == 0)
         {
            this._response.length = this._response.position = 0;
         }
         else if(this._response.position != 0)
         {
            _loc23_ = new ByteArray();
            this._response.readBytes(_loc23_);
            this._response.length = this._response.position = 0;
            this._response.writeBytes(_loc23_);
            this._response.position = 0;
         }
      }
      
      protected function getOprandType(param1:*) : int
      {
         var _loc2_:String = getQualifiedClassName(param1);
         var _loc3_:int = 0;
         switch(_loc2_)
         {
            case "int":
               _loc3_ = int(OPRAND.TYPE_INT);
               break;
            case "Number":
               _loc3_ = int(OPRAND.TYPE_NUMBER);
               break;
            case "String":
               _loc3_ = int(OPRAND.TYPE_STRING);
               break;
            case "XML":
               _loc3_ = int(OPRAND.TYPE_XML);
               break;
            case "flash.utils::ByteArray":
               break;
            default:
               throw new Error("尚不支持的类型");
         }
         return _loc3_;
      }
      
      public function ins_auto_enter_child(param1:uint = 0) : void
      {
         this._request.addInstruction(INS.AUTO_ENTER_CHILD,0,param1);
      }
      
      public function ins_auto_jump_to_sibling(param1:int, param2:uint = 0) : void
      {
         this._request.addInstruction(INS.AUTO_JUMP_TO_SIBLING,1,param1,0,param2);
      }
      
      public function ins_bo_node(param1:uint, param2:*, param3:Boolean = false) : void
      {
         if(param3 == false)
         {
            this._request.addInstruction(INS.BO_NODE,1,param1,Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2)),param2);
         }
         else
         {
            this._request.addInstruction(INS.BO_NODE_1,1,param1,Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2)),param2);
         }
      }
      
      public function ins_bo_global(param1:uint, param2:*) : void
      {
         this._request.addInstruction(INS.BO_GLOBAL,1,param1,Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2)),param2);
      }
      
      public function ins_enter_child(param1:uint, param2:uint = 0, param3:String = null) : void
      {
         if(param3 == null)
         {
            this._request.addInstruction(INS.ENTER_CHILD,1,param1,0,param2);
         }
         else
         {
            this._request.addInstruction(INS.ENTER_CHILD_1,1,param1,0,param2,Number(OPRAND.TYPE_STRING) | Number(OPRAND.SIZE_M),param3);
         }
      }
      
      public function ins_exit_to_parent() : void
      {
         this._request.addInstruction(INS.EXIT_TO_PARENT);
      }
      
      public function ins_get_page(param1:uint, param2:uint, param3:uint = 0) : void
      {
         this._request.addInstruction(INS.GET_PAGE,1,param1,1,param2,0,param3);
      }
      
      public function ins_get_children(param1:uint, param2:ByteArray) : void
      {
         this._request.addInstruction(INS.GET_CHILDREN,2,param1,OPRAND.SIZE_M,param2);
      }
      
      public function ins_get_game(param1:uint) : void
      {
         this._request.addInstruction(INS.GET_GAME,2,param1);
      }
      
      public function ins_get_my(param1:uint) : void
      {
         this._request.addInstruction(INS.GET_MY,2,param1);
      }
      
      public function ins_get_node(param1:uint) : void
      {
         this._request.addInstruction(INS.GET_NODE,2,param1);
      }
      
      public function ins_get_server(param1:uint) : void
      {
         this._request.addInstruction(INS.GET_SERVER,2,param1);
      }
      
      public function ins_get_users(param1:uint, param2:ByteArray) : void
      {
         this._request.addInstruction(INS.GET_USERS,2,param1,OPRAND.SIZE_M,param2);
      }
      
      public function ins_get_user(param1:uint, param2:uint) : void
      {
         this._request.addInstruction(INS.GET_USER,2,param1,2,param2);
      }
      
      public function ins_kick_user(param1:uint) : void
      {
         this._request.addInstruction(INS.KICK_USER,2,param1);
      }
      
      public function ins_login(param1:int, param2:int = 0, param3:int = 0) : void
      {
         if(param2 == 0)
         {
            this._request.addInstruction(INS.LOGIN,2,param1);
         }
         else if(param3 == 0)
         {
            this._request.addInstruction(INS.LOGIN_1,2,param1,2,param2);
         }
         else
         {
            this._request.addInstruction(INS.LOGIN_2,2,param1,2,param2,2,param3);
         }
      }
      
      public function ins_nop() : void
      {
         this._request.addInstruction(INS.NOP);
      }
      
      public function ins_ok() : void
      {
         this._request.addInstruction(INS.OK);
      }
      
      public function ins_set_return_to_param(param1:uint, param2:Boolean) : void
      {
         this._request.addInstruction(INS.SET_RETURN_TO_PARAM,0,param1,0,param2);
      }
      
      public function ins_set_time_out(param1:uint, param2:uint) : void
      {
         this._request.addInstruction(INS.SET_TIME_OUT,1,param1,0,param2);
      }
      
      public function ins_clear_time_out(param1:uint) : void
      {
         this._request.addInstruction(INS.CLEAR_TIME_OUT,2,param1);
      }
      
      public function ins_set_response_filter(param1:int) : void
      {
         this._request.addInstruction(INS.SET_RESPONSE_FILTER,1,param1);
      }
      
      public function ins_send(param1:uint, param2:*, param3:uint, param4:Boolean = false) : void
      {
         if(param4 == false)
         {
            this._request.addInstruction(INS.SEND,1,param1,Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2)),param2,2,param3);
         }
         else
         {
            this._request.addInstruction(INS.SEND_1,1,param1,Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2)),param2,2,param3);
         }
      }
      
      public function ins_set_my(param1:uint, param2:*) : void
      {
         var _loc3_:* = 0;
         switch(param1)
         {
            case UK.DATA:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2));
               break;
            case UK.OK:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_BYTE);
               break;
            case UK.EVENTS:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_INT);
               break;
            default:
               throw new Error("此Key不在支持列表中!");
         }
         this._request.addInstruction(INS.SET_MY,2,param1,_loc3_,param2);
      }
      
      public function ins_set_events(param1:uint) : void
      {
         this._request.addInstruction(INS.SET_EVENTS,2,param1);
      }
      
      public function ins_set_node(param1:uint, param2:*) : void
      {
         var _loc3_:* = 0;
         switch(param1)
         {
            case NK.DATA:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(this.getOprandType(param2));
               break;
            case NK.PASSWORD:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_STRING);
               break;
            case NK.LTD_VISITORS:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_SHORT);
               break;
            case NK.LOCK:
               _loc3_ = Number(OPRAND.SIZE_M) | Number(OPRAND.TYPE_BYTE);
               break;
            default:
               throw new Error("此Key不在支持列表中!");
         }
         this._request.addInstruction(INS.SET_NODE,2,param1,_loc3_,param2);
      }
      
      public function ins_goto_sibling(param1:uint, param2:uint = 0, param3:String = null) : void
      {
         if(param3 == null)
         {
            this._request.addInstruction(INS.GOTO_SIBING,1,param1,0,param2);
         }
         else
         {
            this._request.addInstruction(INS.GOTO_SIBING_1,1,param1,0,param2,Number(OPRAND.TYPE_STRING) | Number(OPRAND.SIZE_M),param3);
         }
      }
      
      public function ins_set_pseudo_node(param1:int) : void
      {
         this._request.addInstruction(INS.SET_PSEUDO_NODE,2,param1);
      }
   }
}

