import { game } from '../src/main';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { getActivePet } from '../src/systems/PetRosterSystem';
import { isPetRabbitJifengActive } from '../src/systems/PetSkillStateSystem';
import { requestPetRabbit2JfSkill } from '../src/systems/PetRabbitSkillSystem';
import { readHeroPartyPresentationSnapshot } from '../src/scenes/HeroPartyRuntimeBridge';
import type { PlayerSlot } from '../src/systems/InputSystem';
import { createFormalPartyRetryData } from '../src/systems/FormalPartyRuntimeSystem';
let time = 0;
let entryData: ReturnType<typeof createFormalPartyRetryData>;
let retained: ReturnType<typeof createPlayerPetRosters> | undefined;
let replaced: ReturnType<typeof createPlayerPetRosters> | undefined;
const scene = () => game.scene.getScene('TestScene') as any;
function step(count = 1, delta = 1000 / 30) {
  game.loop.stop(); time = Math.max(time, game.loop.now);
  for (let i = 0; i < count; i++) { game.loop.delta = delta; time += delta; game.step(time, delta); }
}
function states(rosters = retained) {
  return Object.fromEntries(Object.entries(rosters ?? {}).map(([slot, roster]) => {
    const pet = getActivePet(roster)!;
    return [slot, { id: pet.id, active: isPetRabbitJifengActive(pet), ...pet.skillState!.rabbit2Jf }];
  }));
}
Object.assign(window, { jifengProbe: {
  ready: () => !!readHeroPartyPresentationSnapshot(scene()) && !scene().load.isLoading(),
  pump: () => { if (game.renderer && game.isRunning) step(); },
  install(form: number, fps: number) {
    game.loop.stop(); game.loop.targetFps = fps;
    replaced = retained; retained = createPlayerPetRosters(); const s = scene();
    for (const slot of ['p1', 'p2'] as const) {
      const roster = retained[slot], pet = roster.pets[0]!;
      Object.assign(pet, { species: 'rabbit', form, skills: ['jf'], mp: 100, maxMp: 100, def: 100000 });
      s.playerPetRosters[slot] = roster;
      s[slot === 'p1' ? 'petRoster' : 'p2PetRoster'] = roster;
      s[slot === 'p1' ? 'petRuntime' : 'p2PetRuntime'] = undefined;
      // The production update synchronizes this roster to the party next frame.
      // Exit before that frame must still clean this actual compatibility owner.
      assertRelease(roster, fps);
    }
    return states();
  },
  step, states,
  replacedStates: () => states(replaced),
  rearm(slot: PlayerSlot) {
    const roster = retained![slot]; getActivePet(roster)!.skillState!.rabbit2Jf.cooldownMs = 0;
    assertRelease(roster, game.loop.targetFps);
  },
  kill(slot: PlayerSlot) { const owner = scene().getPlayer(slot); owner.combat.hp = 0; owner.combat.state = 'dead'; },
  revive(slot: PlayerSlot) { const owner = scene().getPlayer(slot); owner.combat.hp = owner.combat.maxHp; owner.combat.state = 'idle'; },
  runtime: (slot: PlayerSlot) => !!scene()[slot === 'p1' ? 'petRuntime' : 'p2PetRuntime'],
  stopScene() { entryData = createFormalPartyRetryData(scene().formalPartyRuntime); scene().scene.stop(); step(); return states(); },
  restart() { scene().scene.restart({}); step(); },
  start() { game.scene.start('TestScene', entryData); step(); },
  pause() { scene().scene.pause(); },
  resume() { scene().scene.resume(); },
} });
function assertRelease(roster: ReturnType<typeof createPlayerPetRosters>['p1'], fps: number) {
  if (!requestPetRabbit2JfSkill({ roster, hostFps: fps }).ok) throw Error('Jifeng fixture release rejected');
}
