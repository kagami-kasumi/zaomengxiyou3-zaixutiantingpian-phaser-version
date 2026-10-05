import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export function gatherBrowserHooks(variant = 'baseline') {
  assert(['baseline', 'request-after-hero', 'physics-before-tween', 'duplicate-hero'].includes(variant));
  const mark = phase => `{ const o = (globalThis as any).heroGatherObserve; o?.traces.push({phase:${JSON.stringify(phase)},pose:o.pose?.(),clock:o.parties.find((p:any)=>!p.model.destroyed)?.runtime.gather.snapshot().time}); }`;
  return { name: 'observe-stage12', setup(api) {
    api.onLoad({ filter: /(?:Stage12GameplayBridge|HeroPartyRuntimeBridge|HeroPartyRuntimeSystem|MonsterRuntimeRegistryBridge)\.ts$/ }, args => {
      let source = readFileSync(args.path, 'utf8');
      const replace = (needle, replacement) => {
        assert.equal(source.split(needle).length, 2, `${path.basename(args.path)} unique hook: ${needle}`);
        source = source.replace(needle, replacement);
      };
      const file = path.basename(args.path);
      if (file === 'HeroPartyRuntimeBridge.ts') {
        replace('heroPartyRuntimeByScene.set(scene, runtime);',
          'heroPartyRuntimeByScene.set(scene, runtime); (globalThis as any).heroGatherObserve?.parties.push({scene, runtime, model, petRosters});');
        replace('updateHeroPartyRuntime(model, { ...frame, projectileSources: activePetSources });',
          mark('hero-update') + 'updateHeroPartyRuntime(model, { ...frame, projectileSources: activePetSources });');
        replace('updatePets({', mark('pets-update') + 'updatePets({');
        replace('combatFeedbackView.update();', mark('hero-done') + 'combatFeedbackView.update();');
      }
      if (file === 'HeroPartyRuntimeSystem.ts') replace('  updateProjectiles(', mark('hero-projectiles') + '  updateProjectiles(');
      if (file === 'MonsterRuntimeRegistryBridge.ts') {
        replace('events.push(...updateMonsterRuntimeRegistry(model, {', mark('monster-world') + 'events.push(...updateMonsterRuntimeRegistry(model, {');
        replace('heroes.resolveAttacks(targets, timeMs);', mark('resolve-attacks') + 'heroes.resolveAttacks(targets, timeMs);');
      }
      if (file === 'Stage12GameplayBridge.ts') {
        replace('const monsters = createMonsterRuntimeRegistry<Stage12MonsterView>({',
          '(globalThis as any).heroGatherObserve?.stages.push({scene, heroes}); const monsters = createMonsterRuntimeRegistry<Stage12MonsterView>({');
        replace('const state = input.read();', `const rawState = input.read();
          const moves = (globalThis as any).heroGatherObserve?.moves;
          const state = moves ? {...rawState, p1:{...rawState.p1,moveX:moves[0]},p2:{...rawState.p2,moveX:moves[1]}} : rawState;`);
        const gather = 'heroes.gather.advance((scene.game.loop.time - pendingWorldMs) / 1000);';
        const world = 'const result = worldStep(frameMs, scene.time.now - pendingWorldMs);';
        if (variant === 'physics-before-tween') {
          replace(gather, '/* mutant: delay coordinate render */');
          replace(world, world + gather);
        }
        replace(gather, mark('tween-before') + gather + mark('tween-after'));
        const request = `const o = (globalThis as any).heroGatherObserve;
          if (o?.fixture) {
            heroes.gather.request({x:o.fixture.endX,y:o.fixture.endY},o.fixture.slots);
            o.traces.push({phase:'fixture-request',pose:o.pose(),time:heroes.gather.snapshot().time});
            o.fixture=undefined;
          }`;
        const hero = 'heroes.update(frame);';
        const body = variant === 'request-after-hero' ? hero + request
          : request + hero + (variant === 'duplicate-hero' ? hero : '');
        replace('monsters.update(heroes, timeMs, deltaMs, () => heroes.update(frame));',
          `monsters.update(heroes, timeMs, deltaMs, () => {${body}});`);
      }
      return { loader: 'ts', contents: source };
    });
  } };
}
