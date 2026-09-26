import horseClocks from '../assets/pet-horse-native-clocks.json';
import monkeyClocks from '../assets/pet-monkey-native-clocks.json';
import type { PetBehaviorContext } from './PetBehavior';
import type { ProjectileModel } from './ProjectileTypes';

/** Natural display phase is separate from the source bullet's paused logic count. */
export function bindMonkeyHorseNativeClipClock(projectile: ProjectileModel, context: PetBehaviorContext): void {
  const readTick = context.projectileCombat?.displayTick;
  if (!readTick) return;
  const clips: Record<string, { rootFrames: number; cycleStart: number; cycleTicks: number }> =
    context.pet.species === 'horse' ? horseClocks.clips : monkeyClocks.clips;
  const clip = clips[projectile.sourceSymbol];
  if (!clip) throw new Error(`Unknown ${context.pet.species} native clip ${projectile.sourceSymbol}`);
  const born = Math.floor(readTick() + 1e-9);
  const age = () => Math.max(1, Math.floor(readTick() + 1e-9) - born);
  projectile.petNativeFrame = () => (age() - 1) % clip.rootFrames + 1;
  projectile.petNativePhaseTick = () => {
    const tick = age();
    return tick < clip.cycleStart ? tick : clip.cycleStart + (tick - clip.cycleStart) % clip.cycleTicks;
  };
}
