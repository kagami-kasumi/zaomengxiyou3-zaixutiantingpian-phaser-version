import assert from 'node:assert/strict';
import { createHeroMovement, updateHeroMovement } from '../src/systems/HeroMovementSystem';
import { createStage11MovementPlatforms } from '../src/systems/Stage11Layout';
import type { PlayerInputState } from '../src/systems/InputSystem';
import { stage11Navigation } from './monster3-stage11-navigation';

// Driver feasibility only: this does not prove combat, Boss reception or a Scene journey.
for (const fps of [20, 24, 30]) {
  const platforms = createStage11MovementPlatforms();
  const ground = platforms.find(p => p.id === 'stage11-obs-1')!;
  const hero = createHeroMovement(500, ground.top, 48);
  hero.grounded = true; hero.currentPlatformId = ground.id;
  let previous: PlayerInputState | undefined;
  let reached = false;
  for (let tick = 0; tick < fps * 100; tick++) {
    const drive = stage11Navigation({ movementPlatforms: platforms }, hero, tick, fps, false)!;
    const input: PlayerInputState = { slot: 'p1', moveX: drive.dx < -8 ? -1 : drive.dx > 8 ? 1 : 0,
      jump: drive.jump, down: false, up: false, attack: false, skillSlots: [], special: false, magicWeapon: false };
    updateHeroMovement(hero, input, previous, platforms, { left: 0, right: 940 }, tick * 1000 / fps, 1000 / fps);
    previous = input;
    if (hero.grounded && hero.currentPlatformId === 'stage11-through-up-down-1') { reached = true; break; }
  }
  assert(reached, `${fps}fps keyboard driver must reach the Boss platform through production movement`);
}
console.log('Stage11 keyboard route feasibility: 20/24/30fps passed; combat journey is a separate gate.');
