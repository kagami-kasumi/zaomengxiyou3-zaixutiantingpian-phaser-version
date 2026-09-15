import Phaser from 'phaser';
import { createIncomingDamageFeedbackView, type IncomingDamageFeedbackView } from '../src/scenes/IncomingDamageFeedbackView';
import { incomingDamageFeedbackAssets } from '../src/assets/IncomingDamageFeedbackAssets';

// Source-isolated driver: inputs only. It exports actual Phaser state; no expected truth imported.
let presenter: IncomingDamageFeedbackView;
let scene: Phaser.Scene;
const params = new URLSearchParams(location.search);
class Probe extends Phaser.Scene {
  preload() {
    for(const a of incomingDamageFeedbackAssets) this.load.image(a.key,a.path);
  }
  create() {
    scene=this;
    presenter=createIncomingDamageFeedbackView(this);
    (window as any).probeReady=true;
  }
}
const game=new Phaser.Game({
  type:params.get('renderer')==='canvas'?Phaser.CANVAS:Phaser.WEBGL,
  width:940,height:590,transparent:true,pixelArt:false,roundPixels:true,
  banner:false,audio:{noAudio:true},render:{preserveDrawingBuffer:true},
  scene:[Probe],
});
(window as any).incomingProbe={
  show(input:any,time:number) {
    presenter.destroy();
    presenter=createIncomingDamageFeedbackView(scene);
    scene.cameras.main.setScroll(input.cameraX??0,input.cameraY??0);
    presenter.show(input);
    presenter.update(time*1000);
  },
  destroy() {presenter.destroy();},
  measure() {
    return scene.children.list.filter(d=>d instanceof Phaser.GameObjects.Container).map(d=>{
      const c=d as Phaser.GameObjects.Container;
      return {name:c.name,x:c.x,y:c.y,alpha:c.alpha,scaleX:c.scaleX,scaleY:c.scaleY,
        owner:c.getData('incomingDamage').ownerSlot,kind:c.getData('incomingDamage').targetKind,
        target:c.getData('incomingDamage').targetId,children:c.list.map((d)=>{
          const i=d as Phaser.GameObjects.Image;const m=i.getWorldTransformMatrix();
          return {key:i.texture.key,x:i.x,y:i.y,width:i.width,height:i.height,
            originX:i.originX,originY:i.originY,flipX:i.flipX,flipY:i.flipY,filter:i.texture.source[0]?.scaleMode,
            stageBounds:{x:m.tx,y:m.ty,width:i.width*m.a,height:i.height*m.d}};
        })};
    });
  },
  image() {return game.canvas.toDataURL('image/png');},
};
