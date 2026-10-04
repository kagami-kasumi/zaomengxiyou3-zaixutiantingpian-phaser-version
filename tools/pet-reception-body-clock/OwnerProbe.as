package {import flash.display.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.filesystem.*;import flash.desktop.NativeApplication;
public class OwnerProbe extends Sprite {
private var fixtures:Array,caseIndex:int=0,packageIndex:int=0,domain:ApplicationDomain,first:Array,loaders:Array=[],rows:Array=[];
public function OwnerProbe(){try{var stream:FileStream=new FileStream();stream.open(File.applicationDirectory.resolvePath('fixtures.json'),FileMode.READ);fixtures=JSON.parse(stream.readUTFBytes(stream.bytesAvailable)) as Array;stream.close();startCase();}catch(e:Error){fail(e);}}
private function save(name:String,bytes:ByteArray):void{var s:FileStream=new FileStream();s.open(new File(File.applicationDirectory.resolvePath(name).nativePath),FileMode.WRITE);s.writeBytes(bytes);s.close();}
private function startCase():void{if(caseIndex==fixtures.length){var bytes:ByteArray=new ByteArray();bytes.writeUTFBytes(JSON.stringify(rows));save('observations.json',bytes);trace('COMPLETE');NativeApplication.nativeApplication.exit();return;}domain=new ApplicationDomain(ApplicationDomain.currentDomain);packageIndex=0;first=[];loadNext();}
private function loadNext():void{
 var fixture:Object=fixtures[caseIndex];
 if(packageIndex==fixture.packages.length){
  for(var i:int=1;i<=3;i++){var name:String='PetKabuBmd'+i,type:Class=domain.getDefinition(name) as Class,b:BitmapData=new type();save(fixture.id+'-'+name+'.png',b.encode(b.rect,new PNGEncoderOptions(true)));rows.push({id:fixture.id,symbol:name,firstDefinitionRetained:type===first[i-1],width:b.width,height:b.height,stageFrameRate:stage.frameRate});b.dispose();}
  caseIndex++;startCase();return;
 }
 var stream:FileStream=new FileStream(),bytes:ByteArray=new ByteArray();stream.open(new File(fixture.packages[packageIndex]),FileMode.READ);stream.readBytes(bytes);stream.close();
 var loader:Loader=new Loader();loaders.push(loader);var context:LoaderContext=new LoaderContext(false,domain);context.allowCodeImport=true;
 loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(event:Event):void{try{if(packageIndex==0)for(var i:int=1;i<=3;i++)first.push(domain.getDefinition('PetKabuBmd'+i));packageIndex++;loadNext();}catch(e:Error){fail(e);}});
 loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(event:IOErrorEvent):void{fail(new Error(event.text));});loader.loadBytes(bytes,context);
}
private function fail(e:Error):void{trace('FAILED '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}
}}
