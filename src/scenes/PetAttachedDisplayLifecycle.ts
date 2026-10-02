import type Phaser from 'phaser';

type Attachment = Readonly<{
  object: Phaser.GameObjects.GameObject;
  /** Pure display callback. Return false when the original clip removes itself. */
  display: (elapsedMs: number) => boolean;
}>;
type Entry = {
  key: string;
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.GameObject;
  attachments: Map<string, Attachment & { elapsedMs: number }>;
  retiredMs?: number;
  initialAlpha: number;
};

const lifecycles = new WeakMap<Phaser.Scene, PetAttachedDisplayLifecycle>();

/** Scene-owned display only. No PetState, combat session, damage or skill clock. */
export class PetAttachedDisplayLifecycle {
  private readonly roots = new Map<Phaser.GameObjects.Container, Entry>();
  private readonly identities = new Map<string, Entry>();
  private disposed = false;

  constructor(private readonly scene: Phaser.Scene) {
    scene.game.events.on('prestep', this.advance);
    scene.events.once('shutdown', this.destroy);
  }

  register(key: string, root: Phaser.GameObjects.Container, body: Phaser.GameObjects.GameObject): void {
    if (this.disposed) throw new Error('Pet display lifecycle is disposed');
    if (this.identities.has(key) || this.roots.has(root)) throw new Error(`Duplicate pet display identity ${key}`);
    const entry: Entry = { key, root, body, attachments: new Map(), initialAlpha: root.alpha };
    this.roots.set(root, entry);
    this.identities.set(key, entry);
    root.once('destroy', () => {
      this.roots.delete(root);
      this.identities.delete(key);
      entry.attachments.clear();
    });
  }

  attach(key: string, id: string, attachment: Attachment): void {
    const entry = this.identities.get(key);
    if (!entry || entry.retiredMs !== undefined) throw new Error(`Inactive pet display identity ${key}`);
    // Refreshing a numerical effect must not restart an already attached clip.
    if (entry.attachments.has(id)) throw new Error(`Duplicate pet attachment ${key}/${id}`);
    entry.root.add(attachment.object);
    entry.attachments.set(id, { ...attachment, elapsedMs: 0 });
    if (!attachment.display(0)) this.remove(key, id);
  }

  remove(key: string, id: string): void {
    const entry = this.identities.get(key), attachment = entry?.attachments.get(id);
    if (!entry || !attachment) return;
    attachment.object.destroy();
    entry.attachments.delete(id);
  }

  retire(root: Phaser.GameObjects.Container): void {
    const entry = this.roots.get(root);
    if (!entry) { root.destroy(true); return; }
    if (entry.retiredMs !== undefined) return;
    // BaseBitmapDataClip.destroy removes the body immediately. BasePet's root
    // and its unhidden child effects survive until the one-second Tween ends.
    entry.body.destroy();
    entry.retiredMs = 0;
    entry.initialAlpha = root.alpha;
    if (!entry.attachments.size) this.dispose(root);
  }

  dispose(root: Phaser.GameObjects.Container): void {
    const entry = this.roots.get(root);
    if (!entry) return;
    this.roots.delete(root);
    this.identities.delete(entry.key);
    entry.attachments.clear();
    root.destroy(true);
  }

  snapshot() {
    return [...this.roots.values()].map(entry => ({ key: entry.key,
      retiredMs: entry.retiredMs, x: entry.root.x, y: entry.root.y, alpha: entry.root.alpha,
      attachments: [...entry.attachments].map(([id, a]) => ({ id, elapsedMs: a.elapsedMs })) }));
  }

  private readonly advance = (_time: number, delta: number): void => {
    const elapsed = Math.max(0, delta);
    for (const entry of [...this.roots.values()]) {
      // The Game display phase keeps running when the owning Scene is paused.
      for (const [id, attachment] of [...entry.attachments]) {
        attachment.elapsedMs += elapsed;
        if (!attachment.display(attachment.elapsedMs)) this.remove(entry.key, id);
      }
      if (!this.roots.has(entry.root) || entry.retiredMs === undefined) continue;
      entry.retiredMs += elapsed;
      if (entry.retiredMs >= 1000 - 1e-8) { this.dispose(entry.root); continue; }
      const remaining = 1 - entry.retiredMs / 1000;
      // Compensate only floating accumulation at an exact 1/256 boundary.
      entry.root.setAlpha(Math.floor(entry.initialAlpha * remaining * remaining * 256 + 1e-9) / 256);
    }
  };

  readonly destroy = (): void => {
    if (this.disposed) return;
    this.disposed = true;
    for (const root of [...this.roots.keys()]) this.dispose(root);
    this.scene.game.events.off('prestep', this.advance);
    this.scene.events.off('shutdown', this.destroy);
    lifecycles.delete(this.scene);
  };
}

export function petAttachedDisplayLifecycle(scene: Phaser.Scene): PetAttachedDisplayLifecycle {
  let lifecycle = lifecycles.get(scene);
  if (!lifecycle) {
    lifecycle = new PetAttachedDisplayLifecycle(scene);
    lifecycles.set(scene, lifecycle);
  }
  return lifecycle;
}
