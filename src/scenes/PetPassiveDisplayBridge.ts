import { createPetPassiveImage } from './PetPassiveImage';
import type Phaser from 'phaser';
import { petPassiveEndFrame, petPassivePose, type PetPassiveEffect } from '../assets/PetPassiveAssets';
import type { PetPassiveVisualSignal } from '../systems/PetPassiveSession';
import { petAttachedDisplayLifecycle } from './PetAttachedDisplayLifecycle';

type HeroHost = Readonly<{ profile: string; x: number; y: number; direction: -1 | 1; rootSign: -1 | 1; hurt: boolean; dead: boolean }>;
type HeroClip = { effect: PetPassiveEffect; image: Phaser.GameObjects.Image; elapsed: number; sign: number; rootSign: number; host: HeroHost };
type PetClip = { root: Phaser.GameObjects.Container; image: Phaser.GameObjects.Image; effect: PetPassiveEffect; profile: string; elapsed: number };

/** Display only: existing owners send first-show/expiry, never numerical refresh. */
export class PetPassiveDisplayBridge {
  private readonly pets = new Map<string, PetClip>();
  private readonly heroes = new Map<string, HeroClip[]>();
  private disposed = false;
  constructor(private readonly scene: Phaser.Scene) {
    scene.game.events.on('prestep', this.advanceHeroes);
    scene.game.events.on('poststep', this.sync);
    scene.events.once('shutdown', this.destroy);
  }

  pet(key: string, profile: string, signal: PetPassiveVisualSignal): void {
    const lifecycle = petAttachedDisplayLifecycle(this.scene), id = `passive:${signal.name}`;
    if (signal.type === 'hide') { lifecycle.remove(key, id); return; }
    if (signal.name !== 'sxkb' && signal.name !== 'fsnl') throw new Error('Pet attachment must be a pet effect');
    const root = lifecycle.rootFor(key);
    if (!root) throw new Error(`Missing passive attachment root ${key}`);
    const initial = petPassivePose(signal.name, profile, 1, 1, root.scaleX, root.x, root.y);
    const image = createPetPassiveImage(this.scene, initial.key).setName(`${id}:${key}`);
    const clip: PetClip = { root, image, effect: signal.name, profile, elapsed: 0 };
    const identity = key + '/' + id;
    this.pets.set(identity, clip);
    image.once('destroy', () => this.pets.delete(identity));
    lifecycle.attach(key, id, { object: image, display: elapsed => {
      clip.elapsed = elapsed;
      const frame = this.frame(elapsed);
      if (frame >= 100) return false;
      if (elapsed === 0) this.drawPet(clip, frame);
      return true;
    } });
  }

  hero(key: string, host: HeroHost, signal: PetPassiveVisualSignal): void {
    if (signal.type !== 'show' || host.dead) return;
    if (signal.name === 'sxkb' || signal.name === 'fsnl') throw new Error('Hero effect must be scene-owned');
    const initial = petPassivePose(signal.name, host.profile, 1, 0, -host.direction, host.x, host.y);
    const image = createPetPassiveImage(this.scene, initial.key).setDepth(44).setName(`passive:${signal.name}:${key}`);
    const clip: HeroClip = { effect: signal.name, image, elapsed: 0, sign: -host.direction, rootSign: host.rootSign, host };
    const clips = this.heroes.get(key) ?? []; clips.push(clip); this.heroes.set(key, clips);
    this.drawHero(clip);
  }

  /** FollowBaseObjectBullet.step2, before this owner's BaseAddEffect.step. */
  stepHero(key: string, host: HeroHost): void {
    const clips = this.heroes.get(key);
    if (!clips) return;
    for (const clip of [...clips]) {
      if (host.dead || host.hurt || this.frame(clip.elapsed) >= petPassiveEndFrame(clip.effect)) {
        clip.image.destroy(); clips.splice(clips.indexOf(clip), 1); continue;
      }
      if (clip.rootSign !== host.rootSign) { clip.sign = host.rootSign; clip.rootSign = host.rootSign; }
      clip.host = host; this.drawHero(clip);
    }
    if (!clips.length) this.heroes.delete(key);
  }

  /** Reproject after the ordinary body adapter moves its root this frame. */
  readonly sync = (): void => {
    for (const clip of this.pets.values()) this.drawPet(clip, this.frame(clip.elapsed));
    for (const clips of this.heroes.values()) for (const clip of clips) this.drawHero(clip);
  };
  snapshot() {
    return { pets: [...this.pets].map(([id, c]) => ({ id, frame: this.frame(c.elapsed), profile: c.profile })),
      heroes: [...this.heroes].flatMap(([id, clips]) => clips.map(c => ({ id, effect: c.effect, frame: this.frame(c.elapsed), sign: c.sign }))) };
  }
  // A newly inserted Flash clip retains frame 1 on its first native frame
  // event; this applies both at initial show and to an ENTER_FRAME re-add.
  private frame(elapsed: number): number { return Math.max(1, Math.floor(elapsed * this.scene.game.loop.targetFps / 1000 + 1e-8)); }
  private drawPet(clip: PetClip, frame: number): void {
    if (frame >= 100 || !clip.image.scene) return;
    const root = clip.root;
    if (root.rotation !== 0 || root.scaleY !== 1) throw new Error('Unsupported passive parent transform');
    const p = petPassivePose(clip.effect, clip.profile, frame, 1 + (frame - 1) % 6, root.scaleX, root.x, root.y);
    clip.image.setTexture(p.key).setScale(1 / root.scaleX, 1 / root.scaleY)
      .setPosition((p.x - root.x) / root.scaleX, (p.y - root.y) / root.scaleY);
    clip.image.setData('passiveProjection', p);
  }
  private drawHero(clip: HeroClip): void {
    const frame = this.frame(clip.elapsed);
    if (frame >= petPassiveEndFrame(clip.effect)) { clip.image.setVisible(false); return; }
    const p = petPassivePose(clip.effect, clip.host.profile, frame, 0, clip.sign, clip.host.x, clip.host.y);
    clip.image.setTexture(p.key).setPosition(p.x, p.y).setData('passiveProjection', p);
  }
  private readonly advanceHeroes = (_time: number, delta: number): void => {
    if (this.scene.sys.isPaused()) return;
    for (const clips of this.heroes.values()) for (const clip of clips) {
      clip.elapsed += Math.max(0, delta);
    }
  };
  readonly destroy = (): void => {
    if (this.disposed) return; this.disposed = true;
    for (const clip of this.pets.values()) clip.image.destroy();
    for (const clips of this.heroes.values()) for (const clip of clips) clip.image.destroy();
    this.pets.clear(); this.heroes.clear();
    this.scene.game.events.off('prestep', this.advanceHeroes);
    this.scene.game.events.off('poststep', this.sync);
    this.scene.events.off('shutdown', this.destroy);
  };
}
