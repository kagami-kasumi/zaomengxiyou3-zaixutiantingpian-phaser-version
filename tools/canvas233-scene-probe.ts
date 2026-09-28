import Phaser from 'phaser';
import { game } from '../src/main';

const ready = () => game.scene.getScenes(true).find(s => s.scene.key === 'Stage12Scene' && !s.load.isLoading());
function render() { game.renderer.preRender(); game.scene.render(game.renderer); game.renderer.postRender(); }
Object.assign(window, { canvas233: {
  ready: () => ({ ready: !!ready(), renderer: game.renderer?.type, configuredType: game.config.renderType }),
  run() {
    const scene = ready()!; game.loop.stop();
    const camera = scene.cameras.main;
    const renderer = game.renderer as Phaser.Renderer.Canvas.CanvasRenderer;
    const rows: any[] = [], original = Phaser.Renderer.Canvas.CanvasRenderer.prototype.batchSprite;
    const fixed = renderer.batchSprite;
    const isCanvas = renderer.type === Phaser.CANVAS;
    const world: any[] = [];
    function visit(obj: any) { if(obj.texture) world.push(obj); if(obj.list) obj.list.forEach(visit); }
    scene.children.list.forEach(visit);
    const positions = world.map(o => [o.x, o.y]);
    const captures: any[] = [];
    const target = document.createElement('canvas'); target.width = 940; target.height = 590;
    const ctx = target.getContext('2d')!;
    if(isCanvas) renderer.batchSprite = function(obj: any, frame, cam, parent) {
      const live = this.currentContext;
      const calls: any[][] = [];
      const draw = ctx.drawImage;
      ctx.drawImage = function(...args: any[]) {
        calls.push([...args.slice(1), ...Array.from(this.getTransform().toFloat64Array()), this.globalAlpha, this.globalCompositeOperation, this.imageSmoothingEnabled]);
      } as typeof ctx.drawImage;
      try {
        this.currentContext = ctx;
        original.call(this,obj,frame,cam,parent); const before = calls.splice(0);
        fixed.call(this,obj,frame,cam,parent); const after = calls.splice(0);
        rows.push({key:obj.texture.key,type:obj.type, x:obj.x,y:obj.y,scroll:cam.scrollX,round:cam.roundPixels,
          resolution:frame.source.resolution,before,after});
      } finally { ctx.drawImage = draw; this.currentContext = live; }
      fixed.call(this,obj,frame,cam,parent);
    };
    const savedScroll = [camera.scrollX,camera.scrollY];
    let compatibilityCases = 0;
    try {
      for(const fraction of [0,0.25,0.5,0.75]) {
        world.forEach((o,i)=>o.setPosition(positions[i]![0]+fraction,positions[i]![1]+fraction));
        for(const scroll of [0,123.25,345.75]) {
          camera.setScroll(scroll,0); render();
          captures.push({fraction,scroll,png:game.canvas.toDataURL('image/png')});
        }
      }
      if(isCanvas) {
        const texture = scene.textures.createCanvas('canvas233-resolution',32,32)!;
        texture.context.fillStyle = '#e75'; texture.context.fillRect(2,3,25,23); texture.refresh();
        texture.source[0]!.resolution = 2;
        const container = scene.add.container(420.5,280.75).setScale(1.25,0.75);
        const sprite = scene.add.image(8.25,12.75,texture.key).setAlpha(0.65).setCrop(2,3,24,22);
        container.add(sprite);
        const shape = scene.make.graphics({}); shape.fillRect(400,250,80,80);
        const mask = shape.createGeometryMask(); sprite.setMask(mask);
        for(const round of [true,false]) for(const flip of [true,false]) for(const rotation of [0,0.3]) {
          camera.roundPixels=round; sprite.setFlip(flip,!flip).setRotation(rotation); render(); compatibilityCases++;
        }
        sprite.clearMask(); mask.destroy(); shape.destroy(); container.destroy(); scene.textures.remove(texture.key);
        camera.roundPixels=true;
      }
    } finally {
      if(isCanvas) renderer.batchSprite = fixed;
      world.forEach((o,i)=>o.setPosition(...positions[i]!)); camera.setScroll(...savedScroll); render();
    }
    return {renderer:renderer.type,configuredType:game.config.renderType,roundPixels:camera.roundPixels,
      compatibilityCases,objects:world.map(o=>({key:o.texture.key,type:o.type,x:o.x,y:o.y,scrollFactorX:o.scrollFactorX})),rows,captures,
      boundary:'Formal Stage12 scene at frozen gameplay state; fractional object positions and camera scroll are controlled rendering inputs. Draw commands compare upstream geometry, not a full original-game screenshot.'};
  }
}});
