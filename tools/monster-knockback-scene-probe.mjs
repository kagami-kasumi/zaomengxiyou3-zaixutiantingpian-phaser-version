// Local-only observation build of the real application. No replacement scenes/physics.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const out = 'dist/__monster-knockback';
mkdirSync(out, { recursive: true });
await build({ entryPoints: ['tools/monster-knockback-scene-probe.ts'], bundle: true, format: 'esm',
  outfile: `${out}/probe.js`, external: ['/assets/*'], define: { 'import.meta.env.DEV': 'false' },
  plugins: [{ name: 'local-observation', setup(builder) {
    builder.onLoad({ filter: /(?:MonsterKnockbackBridge|HeroPartyRuntimeBridge|Stage1CombatSystem|Stage22GameplayBridge)\.ts$/ }, args => {
      let contents = readFileSync(args.path, 'utf8');
      if (args.path.endsWith('scenes\\MonsterKnockbackBridge.ts') || args.path.endsWith('scenes/MonsterKnockbackBridge.ts')) {
        contents = contents.replace('  return binding;', '  globalThis.__knockbackProbe?.bind(scene, level, monsterId, position, binding);\n  return binding;');
      } else if (args.path.endsWith('HeroPartyRuntimeBridge.ts')) {
        contents = contents.replace('heroPartyRuntimeByScene.set(scene, runtime);', 'heroPartyRuntimeByScene.set(scene, runtime); globalThis.__knockbackProbe?.heroes(scene, runtime);');
      } else if (args.path.endsWith('Stage22GameplayBridge.ts')) {
        // Existing QA creates a real boss but freezes it for screenshots. Let its
        // ordinary production update run for this movement fixture only.
        contents = contents.replace("if (freezeBossShowcase && monster.combat.id === 'stage22-qa-monster16') continue;", 'if (false) continue;');
      } else {
        contents = contents.replace("  params.enemy.lastHitBy = params.ownerSlot;\n  params.sourceBullet", "  globalThis.__knockbackProbe?.hit(params);\n  params.enemy.lastHitBy = params.ownerSlot;\n  params.sourceBullet");
      }
      return { contents, loader: 'ts' };
    });
  } }], logLevel: 'info' });
writeFileSync(`${out}/index.html`, '<!doctype html><meta charset="utf-8"><title>236 实际场景观察</title><link rel="stylesheet" href="probe.css"><style>#game{position:absolute;left:0;top:0;width:940px;height:590px}</style><div id="game"></div><script type="module" src="probe.js"></script>');
