import { EventEmitter } from 'node:events';

/** Preserve the existing sprite pixel observers while supplying real event and
 * independent attachment-anchor semantics to their Phaser protocol fixture. */
export function petDisplaySceneFixture(add: (...args: any[]) => any) {
  const roots:any[]=[];
  return { game: { events: new EventEmitter() }, events: new EventEmitter(), roots,
    add: { sprite: add, image: add, container(x:number,y:number) {
      const root:any=new EventEmitter();
      Object.assign(root,{x,y,alpha:1,list:[],destroyed:false});
      root.setDepth=()=>root;root.setPosition=(x:number,y:number)=>{root.x=x;root.y=y;return root;};
      root.setAlpha=(a:number)=>{root.alpha=a;return root;};
      root.add=(child:any)=>{root.list.push(child);child.parentContainer=root;return root;};
      root.destroy=()=>{if(root.destroyed)return;root.destroyed=true;for(const c of root.list)c.destroy();root.list=[];root.emit('destroy');};
      roots.push(root);return root;
    } },
  };
}
