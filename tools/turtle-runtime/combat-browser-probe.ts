import { game } from '../../src/main';
import { createSeedPetRoster } from '../../src/systems/PetRosterSystem';
import { FormalPetsUpdatedEvent } from '../../src/scenes/feature-ui/FormalPetRuntimeBridge';
import { readHeroPartyPetSnapshots, readHeroPartyPresentationSnapshot } from '../../src/scenes/HeroPartyRuntimeBridge';
import type { PetRoster } from '../../src/systems/PetTypes';
import { compareCombatLayers } from './combat-visual-probe';
import { applyHeroHealing } from '../../src/systems/PetTurtleLinkSystem';
import { applyHeroMagicShield } from '../../src/systems/HeroCombatSystem';
import { createStage1CombatEnemy } from '../../src/systems/Stage1CombatSystem';

let time = 0;
const rosters: Partial<Record<'p1' | 'p2', PetRoster>> = {};
const activeScene = () => game.scene.getScenes(true).find(scene => readHeroPartyPresentationSnapshot(scene));
Object.assign(window, { turtleCombatProbe: {
  linkSettlement() {
    const party = (window as any).__turtleParty;
    const members = party.compatibilityMembers();
    const pets = members.map((m: any) => rosters[m.combat.slot as 'p1' | 'p2']!.pets.find(p => p.isActive)!);
    const heroes = members.map((m: any) => m.combat.combat);
    const before = heroes.map((h: any) => ({ active: h.turtleLink?.active, pet: h.turtleLink?.peer?.()?.active }));
    if (!before.every((h: any) => h.active && h.pet)) throw Error('Both real owner links must be active');
    heroes.forEach((h: any, i: number) => { h.hp = 500; h.maxHp = 1000; h.state = 'ready';
      h.invulnerableUntilMs = 0; h.magicInvulnerability = undefined; pets[i]!.hp = 500; pets[i]!.maxHp = 1000; });
    applyHeroMagicShield(heroes[0], { kind: 'magicUmbrellaDefend', sourceName: 'probe', initialAmount: 100,
      remainingAmount: 100, totalMs: 1000, remainingMs: 1000 });
    applyHeroMagicShield(heroes[1], { kind: 'magicUmbrellaDefend', sourceName: 'probe', initialAmount: 201,
      remainingAmount: 201, totalMs: 1000, remainingMs: 1000 });
    const enemy = createStage1CombatEnemy({ id: `link-probe-${time}`, enemyType: 2, x: 0, y: 0 });
    enemy.phase = 'active'; enemy.activeAttack = { attackId: `link-probe-${time}`, actionName: 'hit1',
      damage: 201, attackKind: 'magic', attackRange: 100000 } as any;
    party.resolveEnemyAttack(enemy, time);
    const damage = heroes.map((h: any, i: number) => ({ hero: h.hp, pet: pets[i]!.hp }));
    party.resolveEnemyAttack(enemy, time + 1000);
    const duplicate = heroes.map((h: any, i: number) => ({ hero: h.hp, pet: pets[i]!.hp }));
    applyHeroHealing(heroes[1], 101);
    const healing = heroes.map((h: any, i: number) => ({ hero: h.hp, pet: pets[i]!.hp }));
    return { before, damage, duplicate, healing };
  },
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
