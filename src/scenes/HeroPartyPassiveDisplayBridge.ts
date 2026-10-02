import type Phaser from 'phaser';
import type { HeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';
import type { PetCombatSnapshot } from '../systems/PetCombatTypes';
import type { PetPassiveVisualSignal } from '../systems/PetPassiveSession';
import { petPassiveProfile } from '../assets/PetPassiveAssets';
import { PetPassiveDisplayBridge } from './PetPassiveDisplayBridge';

/** Narrow party adapter: the combat owners retain all effect identity/numbers. */
export function createHeroPartyPassiveDisplayBridge(scene: Phaser.Scene) {
  const display = new PetPassiveDisplayBridge(scene);
  const pending: Array<{ key: string; signal: PetPassiveVisualSignal }> = [];
  const profiles = new Map<string, string>();
  return {
    ownerStep(member: HeroPartyRuntimeModel['members'][number], rootOffsetY = 0) {
      const host = { profile: `hero${member.combat.normalAttack.heroId}`,
        x: member.movement.x, y: member.movement.y + rootOffsetY,
        direction: member.movement.facingX, rootSign: 1 as const,
        hurt: member.combat.combat.state === 'hurt', dead: member.combat.combat.state === 'dead' };
      display.stepHero(member.combat.slot, host);
      member.combat.stepPetBuffs(signal => display.hero(member.combat.slot, host, signal));
    },
    petSignal(key: string, signal: PetPassiveVisualSignal) { pending.push({ key, signal }); },
    sync(snapshots: readonly PetCombatSnapshot[]) {
      for (const snapshot of snapshots) for (const s of [snapshot, ...(snapshot.summons ?? [])]) {
        if (s.runtime && s.species && s.form) profiles.set(s.runtime.runtimeKey, petPassiveProfile(s.species, s.form));
      }
      for (const event of pending.splice(0)) {
        const profile = profiles.get(event.key);
        if (!profile) throw new Error(`Missing pet passive profile ${event.key}`);
        display.pet(event.key, profile, event.signal);
      }
      display.sync();
    },
    snapshot: () => display.snapshot(),
    destroy() { pending.length = 0; profiles.clear(); display.destroy(); },
  };
}
