import assert from 'node:assert/strict';
import {
  validatePlayableLevelDefinition,
  type PlayableLevelDefinition,
} from '../src/systems/PlayableLevelDefinition';
import { stage12LevelDefinition } from '../src/systems/Stage12LevelDefinition';
import { stage11LevelDefinition } from '../src/systems/Stage11LevelDefinition';
import { isStage11DoorQaEnabled } from '../src/systems/Stage11LevelDefinition';
import { stage13LevelDefinition } from '../src/systems/Stage13LevelDefinition';
import { stage21LevelDefinition } from '../src/systems/Stage21LevelDefinition';
import { stage22LevelDefinition } from '../src/systems/Stage22LevelDefinition';

function testPilotDefinitions(): void {
  assert.doesNotThrow(() => validatePlayableLevelDefinition(stage11LevelDefinition));
  assert.doesNotThrow(() => validatePlayableLevelDefinition(stage12LevelDefinition));
  assert.doesNotThrow(() => validatePlayableLevelDefinition(stage13LevelDefinition));
  assert.doesNotThrow(() => validatePlayableLevelDefinition(stage21LevelDefinition));
  assert.doesNotThrow(() => validatePlayableLevelDefinition(stage22LevelDefinition));
  assert.notEqual(stage12LevelDefinition.transferDoor.visualId, stage13LevelDefinition.transferDoor.visualId);
  assert.equal(stage11LevelDefinition.routes.next, 'Stage12Scene');
  assert.equal(stage12LevelDefinition.routes.next, 'Stage13Scene');
  assert.equal(stage13LevelDefinition.routes.next, 'Stage21Scene');
  assert.equal(stage21LevelDefinition.routes.next, 'Stage22Scene');
  assert.equal(stage22LevelDefinition.unlockTarget.unlockedLevel, 3);
}

function testInvalidDefinitionIsRejected(): void {
  const invalid: PlayableLevelDefinition = {
    ...stage12LevelDefinition,
    worldBounds: { ...stage12LevelDefinition.worldBounds, width: 0 },
  };
  assert.throws(() => validatePlayableLevelDefinition(invalid), /invalid world bounds/);
}

function testStage11DoorQaIsLocalAndExplicit(): void {
  assert.equal(isStage11DoorQaEnabled('?qaStage=1-1-door', '127.0.0.1'), true);
  assert.equal(isStage11DoorQaEnabled('?qaStage=1-1-door', 'localhost'), true);
  assert.equal(isStage11DoorQaEnabled('', 'localhost'), false);
  assert.equal(isStage11DoorQaEnabled('?qaStage=1-1-door', 'example.com'), false);
}

testPilotDefinitions();
testInvalidDefinitionIsRejected();
testStage11DoorQaIsLocalAndExplicit();
console.log('Playable level definitions and Stage 1/Stage 2 migration contracts passed.');
