import { gatherBrowserHooks } from './hero-gather-browser-hooks.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
export function monster2BrowserHooks() {
  return { name: 'observe-natural-monster2', setup(api) {
    gatherBrowserHooks().setup({ onLoad(options, callback) {
      api.onLoad(options, async args => {
        const result = await callback(args);
        if (path.basename(args.path) === 'HeroPartyRuntimeBridge.ts') {
          const needle = 'heroGatherObserve?.parties.push({scene, runtime, model, petRosters});';
          if (result.contents.includes(needle)) result.contents = result.contents.replace(needle,
            'heroGatherObserve?.parties.push({scene, runtime, model, petRosters, petCombatRuntimes});');
        }
        if (path.basename(args.path) === 'Stage12GameplayBridge.ts') {
          const needle = '  const hud = createStage1CombatHudBridge(';
          assert(result.contents.includes(needle));
          result.contents = result.contents.replace(needle,
            '(globalThis as any).monster2Observe = {scene, heroes, monsters, flow};\n'+needle);
        }
        if (path.basename(args.path) === 'MonsterRuntimeRegistryBridge.ts') {
          const needle = 'boss: true, flower: false, targets: heroes.monster2Targets,';
          assert(result.contents.includes(needle));
          result.contents = result.contents.replace(needle, needle+' random: () => 0.2,');
          if (process.env.HG_VARIANT === 'registry-owner-survives') {
            const destroyNeedle = '      destroyMonsterRuntimeRegistry(model);';
            assert.equal((result.contents.match(new RegExp(destroyNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1);
            result.contents = result.contents.replace(destroyNeedle, '      /* mutation: registry owner survives */');
          }
        }
        return result;
      });
    }});
    api.onLoad({filter:/HeroPartyMonsterReception\.ts$/, namespace:'file'}, args => {
      let source=readFileSync(args.path,'utf8');
      if (path.basename(args.path) !== 'HeroPartyMonsterReception.ts') return {contents:source,loader:'ts'};
      const needle = '          return target.receive({ ...request, geometryHit: geometryHit(';
      assert.equal(source.split(needle).length, 2, 'HeroPartyMonsterReception pet receive hook must be unique');
      source = source.replace(needle, '          const hpBefore = pet.hp;\r\n          const reception = target.receive({ ...request, geometryHit: geometryHit(');
      const tail = '            `Pet${sourceName}${pet.form}`, current!.x, current!.y) });';
      assert.equal(source.split(tail).length, 2, 'HeroPartyMonsterReception pet receive tail must be unique');
      source = source.replace(tail, '            `Pet${sourceName}${pet.form}`, current!.x, current!.y) });\r\n          (globalThis as any).monster2PetReceptionTrace?.push({slot, petId:pet.id, hpBefore, hpAfter:pet.hp, attackId:request.attackId, sourceId:request.sourceId});\r\n          return reception;');
      return {contents:source,loader:'ts'};
    });
    api.onLoad({filter:/Monster2RawDisplayBridge\.ts$/}, args => {
      let source=readFileSync(args.path,'utf8');
      if (process.env.HG_VARIANT === 'raw-pause-freeze') {
        const needle = '  const enter = () => {';
        assert.equal(source.split(needle).length, 2, 'Monster2RawDisplayBridge enter hook must be unique');
        source=source.replace(needle, '  const enter = () => { if (scene.scene.isPaused()) return;');
      }
      return {contents:source,loader:'ts'};
    });
    api.onLoad({filter:/Monster2AttackProjection\.ts$/}, args => {
      let source=readFileSync(args.path,'utf8');
      if (process.env.HG_VARIANT === 'projection-offset') {
        const needle = 'return { ...pose, x: attack.x + pose.x, y: attack.y + pose.y };';
        assert.equal((source.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1);
        source=source.replace(needle, 'return { ...pose, x: attack.x + pose.x + 1, y: attack.y + pose.y };');
      }
      if (process.env.HG_VARIANT === 'projection-sign') {
        const needle = 'const sign = attack.facingX === -1 ? 1 : -1;';
        assert.equal((source.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1);
        source=source.replace(needle, 'const sign = attack.facingX === -1 ? -1 : 1;');
      }
      return {contents:source,loader:'ts'};
    });
    api.onLoad({filter:/Monster2AttackRuntime\.ts$/}, args => {
      let source=readFileSync(args.path,'utf8');
      source=source.replace('    runtime.attacks.push(attack);',
        '    runtime.attacks.push(attack); (globalThis as any).monster2Events?.push({kind:"bullet",attack:attack.attack,id:attack.id,x:attack.x,y:attack.y});');
      source=source.replace('      gather({ x: host.x, y: host.y - 50 });',
        '      (globalThis as any).monster2Events?.push({kind:"gather",x:host.x,y:host.y-50}); gather({ x: host.x, y: host.y - 50 });');
      return {contents:source,loader:'ts'};
    });
  }};
}
