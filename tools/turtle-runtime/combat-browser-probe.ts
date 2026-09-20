import { game } from '../../src/main';
import { createSeedPetRoster } from '../../src/systems/PetRosterSystem';
import { FormalPetsUpdatedEvent } from '../../src/scenes/feature-ui/FormalPetRuntimeBridge';
import { readHeroPartyPetSnapshots, readHeroPartyPresentationSnapshot } from '../../src/scenes/HeroPartyRuntimeBridge';
import type { PetRoster } from '../../src/systems/PetTypes';
import { compareCombatLayers } from './combat-visual-probe';

let time = 0;
const rosters: Partial<Record<'p1' | 'p2', PetRoster>> = {};
const activeScene = () => game.scene.getScenes(true).find(scene => readHeroPartyPresentationSnapshot(scene));
Object.assign(window, { turtleCombatProbe: {
  install(form: number, skills = ['sld']) {
    const scene = activeScene() as any;
    if (!scene) throw Error('Production hero party is not ready');
    for (const slot of ['p1', 'p2'] as const) {
      const roster = createSeedPetRoster();
      for (const pet of roster.pets) {
        pet.id = `${slot}-${pet.id}`; pet.isActive = pet.species === 'turtle' && pet.form === form;
        if (pet.isActive) Object.assign(pet, { skills, hp: 5000, maxHp: 10000, mp: 1000, maxMp: 1000, atk: 30, def: 100 });
      }
      rosters[slot] = roster;
      // TestScene feeds this same public event from its roster each update.
      if (scene.playerPetRosters) {
        scene.playerPetRosters[slot] = roster;
        if (slot === 'p1') scene.petRoster = roster; else scene.p2PetRoster = roster;
      }
      scene.events.emit(FormalPetsUpdatedEvent, { owner: slot, roster });
    }
  },
  snapshot() {
    const scene = activeScene();
    return { scene: scene?.scene.key, loading: scene?.load.isLoading(),
      pets: scene && readHeroPartyPetSnapshots(scene),
      stats: Object.fromEntries(Object.entries(rosters).map(([slot, roster]) => [slot, roster?.pets.find(p => p.isActive)])),
      views: scene?.children.list.filter(object => object.name.startsWith('pet-turtle-presentation:')).map(object => ({
        name: object.name, stateId: object.getData('turtleStateId'), owners: object.getData('turtleOwners'),
        viewport: object.getData('turtleViewport'), active: object.active,
      })),
      textures: game.textures.getTextureKeys().filter(key => key.startsWith('pet-turtle-presentation:')),
      storedSaves: { ...localStorage },
    };
  },
  stop() { time = game.loop.now; game.loop.stop(); },
  compare(refs: any[]) { return compareCombatLayers(game, activeScene()!, refs, () => game.step(time, 0)); },
  step(count: number) { for (let i = 0; i < count; i++) { time += 1000 / 30; game.step(time, 1000 / 30); } },
  resume() { game.loop.start(game.step.bind(game)); },
  keys(codes: number[], down: boolean) {
    for (const scene of game.scene.getScenes(true)) for (const code of codes) {
      const key = scene.input.keyboard?.addKey(code); if (key) key.isDown = down;
    }
  },
  restart() { const scene = activeScene(); scene?.scene.restart(scene.sys.settings.data); },
  leave() { activeScene()?.scene.start('SaveSlotScene'); },
} });
