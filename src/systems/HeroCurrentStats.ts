import type { HeroBaseStats } from './EquipmentSystem';

/** Compatibility fixtures may have only growth stats; real party views expose currentStats. */
export function readHeroCurrentStats<T extends Partial<HeroBaseStats>>(player: { currentStats?: T; baseStats?: T }): T | undefined {
  return player.currentStats ?? player.baseStats;
}
