import Phaser from 'phaser';
import { stage22Assets } from '../src/assets/AssetManifest';
import { updateIceHazards } from '../src/scenes/stage21/Stage21GameplayBridge';
import { updateFire } from '../src/scenes/stage22/Stage22GameplayBridge';
import { applyDevFireHits, createDevFireTargets, hasVisibleStage22FirePixel } from '../src/scenes/stage22/Stage22DevGameplayBridge';
import { createStage21IceHazards } from '../src/systems/Stage21IceHazardSystem';
import { createStage22FireHazards, updateStage22FireHazards } from '../src/systems/Stage22FireHazardSystem';
import { createHeroPartyRuntimeModel, snapshotHeroParty, applyHeroPartyEnvironmentHits } from '../src/systems/HeroPartyRuntimeSystem';
import { applyHeroMagicShield } from '../src/systems/HeroCombatSystem';
import type { HeroPartyRuntime } from '../src/scenes/HeroPartyRuntimeBridge';

class Probe extends Phaser.Scene {
  preload() { this.load.svg(stage22Assets.fireThorn.frameKeys[1], stage22Assets.fireThorn.framePaths[1]); }
  create() {
    const rows: unknown[] = [];
    for (const kind of ['ice', 'fire', 'dev-fire'] as const) for (const slot of ['p1', 'p2'] as const) {
      const ice = createStage21IceHazards()[0]; ice.frame = 2;
      const fire = createStage22FireHazards()[0]; fire.frame = 2;
      const x = kind === 'ice' ? ice.source.x + 20 : fire.source.x;
      const y = kind === 'ice' ? ice.source.y + 60 : fire.source.y + 29;
      const model = createHeroPartyRuntimeModel((['p1', 'p2'] as const).map(s => ({ slot: s, heroId: 1,
        x: s === slot ? x : x + 10000, y })));
      model.members.forEach(m => { m.combat.combat.hp = m.combat.combat.maxHp = 200; });
      const hero = model.members[slot === 'p1' ? 0 : 1].combat.combat;
      const width = kind === 'ice' ? 48 : 400;
      const height = kind === 'ice' ? 96 : 400;
      const snapshots = () => snapshotHeroParty(model).map(s => ({ ...s, view: { displayWidth: width, displayHeight: height } }));
      const heroes = { snapshots, applyEnvironmentHits: (hits: Parameters<typeof applyHeroPartyEnvironmentHits>[1]) => applyHeroPartyEnvironmentHits(model, hits) } as unknown as HeroPartyRuntime;
      const execute = () => {
        const originalRandom = Math.random; Math.random = () => .65;
        try {
          if (kind === 'ice') updateIceHazards(heroes, [ice], [], 0, false, 123);
          else if (kind === 'fire') updateFire(this, heroes, [fire], [], () => {}, 0, false);
          else {
            const targets = createDevFireTargets(heroes.snapshots());
            const hits = updateStage22FireHazards([fire], targets, 0, (h, t) => hasVisibleStage22FirePixel(this, h, t));
            applyDevFireHits(heroes, heroes.snapshots(), hits, this.time.now);
          }
        } finally { Math.random = originalRandom; }
      };
      const hazard = kind === 'ice' ? ice : fire;
      hero.magicInvulnerability = { sourceName: 'ring', totalMs: 1000, remainingMs: 1000 };
      execute();
      rows.push({ id: `${kind}/${slot}/protected`, actual: [hero.hp, hazard.hitKeys.size], expected: [200, 0] });
      hero.magicInvulnerability = undefined;
      hero.invulnerableUntilMs = 999999;
      applyHeroMagicShield(hero, { kind: 'magicUmbrellaDefend', sourceName: 'fixture', initialAmount: 100,
        remainingAmount: 100, totalMs: 1000, remainingMs: 1000 });
      execute();
      rows.push({ id: `${kind}/${slot}/shield`, actual: [hero.hp, hero.magicShield?.remainingAmount, hazard.hitKeys.size,
        hero.lastDamageEvent?.sourceId, hero.lastDamageEvent?.attackId, hero.lastDamageEvent?.targetId],
        expected: [200, kind === 'ice' ? 84 : 54, 1, hazard.source.id, `${hazard.source.id}:${hazard.attackId}`, slot] });
      execute();
      rows.push({ id: `${kind}/${slot}/duplicate`, actual: hero.magicShield?.remainingAmount, expected: kind === 'ice' ? 84 : 54 });
      hero.magicShield = undefined;
      hazard.source = { ...hazard.source, id: `${hazard.source.id}-second` };
      hazard.hitKeys.clear();
      execute();
      rows.push({ id: `${kind}/${slot}/different-source`, actual: [hero.hp, hero.state, model.members[slot === 'p1' ? 1 : 0].combat.combat.hp],
        expected: [kind === 'ice' ? 184 : 154, 'hurt', 200] });
    }
    Object.assign(window, { environmentRows: rows, probeReady: true });
  }
}
new Phaser.Game({ type: Phaser.CANVAS, width: 940, height: 590, audio: { noAudio: true }, scene: Probe });
