import Phaser from 'phaser';
import { PetPassiveDisplayBridge } from '../src/scenes/PetPassiveDisplayBridge';
import { petAttachedDisplayLifecycle } from '../src/scenes/PetAttachedDisplayLifecycle';
import { petPassiveImages } from '../src/assets/PetPassiveAssets';
import { PetPassiveSession } from '../src/systems/PetPassiveSession';
import { addHeroPetBuff, stepHeroPetBuffs, clearHeroPetBuffs } from '../src/systems/HeroPetBuffSystem';
import { createHeroPartyRuntimeModel } from '../src/systems/HeroPartyRuntimeSystem';

const inputs = await fetch('/inputs.json').then(r => r.json());
const backend = new URLSearchParams(location.search).get('renderer');
const ensure = (ok: unknown, label: string) => { if (!ok) throw Error(label); };
const expectedCanvas = document.createElement('canvas');
const expected = expectedCanvas.getContext('2d', { willReadFrequently: true })!;
const pixels = new Map<string, Uint8ClampedArray>();
class Probe extends Phaser.Scene {
  preload() {
    for (const a of petPassiveImages) this.load.image(a.key, '/' + a.path);
    for (const [key, url] of Object.entries(inputs.images)) this.load.image(key, url as string);
  }
  create() { this.game.loop.stop(); setTimeout(() => this.run().then(result => (window as any).result = result)
    .catch(error => (window as any).result = { status: 'failed', error: error.stack }), 0); }
  async run() {
    this.game.loop.stop(); let time = this.game.loop.now;
    const reports: any[] = []; let measured = 0;
    const step = (delta: number, work: () => void = () => {}) => {
      this.game.events.once('step', work); time += delta; this.game.step(time, delta);
    };
    // Shutdown with active owner clip and a retiring attached root, then repeat
    // cleanup. An empty end-of-cycle scene cannot detect a leaking destroy.
    {
      const display=new PetPassiveDisplayBridge(this), lifecycle=petAttachedDisplayLifecycle(this);
      const root=this.add.container(300,350),body=this.add.rectangle(0,0,1,1).setVisible(false);
      root.add(body);lifecycle.register('shutdown-fixture',root,body);
      display.pet('shutdown-fixture','monkey1',{type:'show',name:'sxkb'});
      display.hero('p1',{profile:'hero1',x:300,y:350,direction:-1,rootSign:1,hurt:false,dead:false},{type:'show',name:'smjc'});
      lifecycle.retire(root);display.destroy();display.destroy();
      ensure(!root.list.some((o:any)=>o.name?.startsWith('passive:')) && !this.children.list.some((o:any)=>o.name?.startsWith('passive:')),'exit residual');
      lifecycle.destroy();lifecycle.destroy();
    }
    for (const fixture of inputs.cases) {
      this.scene.resume();
      const display = new PetPassiveDisplayBridge(this), lifecycle = petAttachedDisplayLifecycle(this);
      const root = this.add.container(fixture.x, fixture.y), body = this.add.rectangle(0, 0, 1, 1).setVisible(false);
      root.add(body); lifecycle.register(fixture.id, root, body);
      const session = new PetPassiveSession();
      const model = createHeroPartyRuntimeModel([{ slot: fixture.owner === 1 ? 'p1' : 'p2', heroId: 1, x: fixture.x, y: fixture.y, width: 48 }]);
      const player = model.members[0]!.combat;
      const host = { profile: fixture.profile, x: fixture.x, y: fixture.y, direction: (fixture.direction === 0 ? -1 : 1) as -1 | 1,
        rootSign: 1 as -1 | 1, hurt: false, dead: false };
      const pet = fixture.effect === 'sxkb' || fixture.effect === 'fsnl';
      const add = (value: number) => pet ? session.add(fixture.effect, value, fixture.duration)
        : addHeroPetBuff(player, fixture.effect, value, fixture.duration);
      const ownerStep = () => {
        if (pet) session.stepEffects(s => display.pet(fixture.id, fixture.profile, s));
        else { display.stepHero(fixture.id, host); stepHeroPetBuffs(player, s => display.hero(fixture.id, host, s)); }
      };
      add(7); let maxDelta = 0, residualPixels = 0;
      for (const row of fixture.rows) {
        if (row.phase === 'added-before-step') step(0);
        else if (row.phase === 'first-owner-step') step(0, ownerStep);
        else step(1000 / 24, () => {
          const t = row.tick, s = fixture.scenario;
          if ((t === 3 && s === 'refresh') || (t === 105 && s === 'late-refresh') || (t === 125 && s === 'readd')) add(99);
          if (t === 3 && s === 'move') {
            root.x += 31.25; root.y -= 12.5; host.x = root.x; host.y = root.y; host.direction = -host.direction as -1 | 1;
          }
          if ((t === 4 || t === 5) && s === 'move') { root.scaleX = t === 4 ? -1 : 1; host.rootSign = root.scaleX as -1 | 1; }
          if (t === 3 && s === 'hurt') host.hurt = true;
          if (t === 3 && s === 'effect-destroy') { if (pet) session.destroy(); else clearHeroPetBuffs(player); }
          if (t === 3 && s === 'host-destroy') {
            if (pet) { session.destroy(); lifecycle.retire(root); }
            else { host.dead = true; clearHeroPetBuffs(player); display.stepHero(fixture.id, host); }
          }
          if (s === 'world-pause' && t === 3) this.scene.pause();
          if (s === 'world-pause' && t === 41) this.scene.resume();
          if (!(s === 'world-pause' && t >= 3 && t <= 40) && !(s === 'host-destroy' && t >= 3)) ownerStep();
          display.sync();
        });
        const snap = display.snapshot(); const visible = pet ? snap.pets : snap.heroes;
        ensure(visible.length === row.visualCount, `${fixture.id}/${row.tick}/${row.phase}: count ${visible.length}/${row.visualCount}`);
        if (visible.length) ensure(visible[0]!.frame === row.frame, `${fixture.id}/${row.tick}: frame ${visible[0]!.frame}/${row.frame}`);
        if (pet && visible.length) {
          const image = root.list.find((o: any) => o.name?.startsWith('passive:'));
          ensure(image?.parentContainer === root, `${fixture.id}: wrong pet parent`);
          ensure(Math.abs(root.alpha - row.alpha) < 1e-8, `${fixture.id}/${row.tick}: alpha ${root.alpha}/${row.alpha}`);
        } else if (!pet && visible.length) {
          const image = this.children.list.find((o: any) => o.name?.startsWith('passive:'));
          ensure(image && !image.parentContainer, `${fixture.id}: wrong hero parent`);
        }
        if (!pixels.has(row.key)) {
          expectedCanvas.width = row.crop.width; expectedCanvas.height = row.crop.height;
          expected.drawImage(this.textures.get(row.key).getSourceImage() as HTMLImageElement, 0, 0);
          pixels.set(row.key, expected.getImageData(0, 0, row.crop.width, row.crop.height).data);
        }
        const reference = pixels.get(row.key)!;
        const c = row.crop; const actual = new Uint8Array(c.width * c.height * 4);
        const x0 = Math.max(0, c.left), y0 = Math.max(0, c.top);
        const w = Math.max(0, Math.min(940, c.left + c.width) - x0), h = Math.max(0, Math.min(590, c.top + c.height) - y0);
        if (w && h) {
        let region: Uint8Array | Uint8ClampedArray;
        if (backend === 'webgl') {
          const gl = (this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer).gl;
          region = new Uint8Array(w * h * 4);
          gl.readPixels(x0, 590 - y0 - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, region);
        } else region = this.game.canvas.getContext('2d')!.getImageData(x0, y0, w, h).data;
        for (let y = 0; y < h; y++) {
          const sourceY = backend === 'webgl' ? h - 1 - y : y;
          actual.set(region.subarray(sourceY * w * 4, (sourceY + 1) * w * 4), ((y + y0 - c.top) * c.width + x0 - c.left) * 4);
        }
        }
        let bad = 0;
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4, j = i;
          let delta = Math.abs(actual[j + 3]! - reference[i + 3]!);
          for (let ch = 0; ch < 3; ch++) delta = Math.max(delta, Math.abs(
            (backend === 'webgl' ? actual[j + ch]! : actual[j + ch]! * actual[j + 3]! / 255) - reference[i + ch]! * reference[i + 3]! / 255));
          if (delta > 0) residualPixels++; if (delta > 3) bad++; maxDelta = Math.max(maxDelta, delta);
        }
        ensure(bad === 0, `${fixture.id}/${row.tick}/${row.phase}: ${bad} pixels >3, max ${maxDelta}; crop=${JSON.stringify(c)} actual=${[...actual.slice(0,64)]} expected=${[...reference.slice(0,64)]}`);
        measured++;
        if (measured % 100 === 0) { (window as any).progress = { measured, fixture: fixture.id }; await new Promise(r => setTimeout(r, 0)); }
      }
      reports.push({ id: fixture.id, states: fixture.rows.length, maxDelta, residualPixels });
      display.destroy(); lifecycle.destroy(); this.scene.resume();
      step(0); ensure(!this.children.list.some((o: any) => o.name?.startsWith('passive:')), 'exit residual');
    }
    return { status: 'passed', backend, measured, results: reports };
  }
}
new Phaser.Game({ type: backend === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL, width: 940, height: 590,
  transparent: true, banner: false, audio: { noAudio: true }, fps: { target: 24, forceSetTimeOut: true },
  render: { antialias: false, roundPixels: false, preserveDrawingBuffer: true }, scene: Probe });
