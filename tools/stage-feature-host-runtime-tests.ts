import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assertVerifiedStageFeatureHostTruth,
  getStageFeatureHostTruthStateIds,
  StageFeatureHostNegativeStateId,
  StageFeatureHostTruthId,
} from '../src/scenes/feature-ui/FormalStageFeatureHostTruth';

const root = process.cwd();
const source = (relativePath: string): string =>
  readFileSync(path.join(root, relativePath), 'utf8');

assertVerifiedStageFeatureHostTruth();
assert.equal(StageFeatureHostTruthId, 'task-settings-175c.stage-feature-host');
assert.equal(getStageFeatureHostTruthStateIds().length, 42);
assert.ok(getStageFeatureHostTruthStateIds().includes(StageFeatureHostNegativeStateId));

const scene = source('src/scenes/FeatureUiScene.ts');
assert.match(scene, /assertVerifiedStageFeatureHostTruth\(\)/);
assert.match(scene, /originKind === 'combat'[\s\S]*binding\.page === this\.session\?\.page/);
assert.match(scene, /switchFeatureUiOwner\(formalFeatureUiHost, owner\)/);
assert.doesNotMatch(scene, /createMapHostChrome|createPageButton|createCloseButton/);
assert.doesNotMatch(scene, /正式功能页面主机|fontFamily:\s*'Arial, sans-serif'|关闭并返回/);
assert.doesNotMatch(scene, /keydown-ESC|switchFeatureUi\(/);

const bridge = source('src/scenes/feature-ui/FormalFeatureUiEntryBridge.ts');
assert.match(bridge, /if \(keyboard && config\.originKind === 'combat'\)/);
assert.match(bridge, /originKind:\s*config\.originKind/);

console.log('Stage feature host verified truth, direct page root, and zero shared chrome tests passed.');
