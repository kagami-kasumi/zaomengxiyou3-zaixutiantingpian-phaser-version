import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyMonsterKnockback, createMonsterKnockbackMotion, getMonsterKnockbackProfile,
  stepMonsterKnockback, type MonsterKnockbackMotion } from '../src/systems/MonsterKnockbackSystem';
import type { PetGroundWall } from '../src/systems/PetGroundMovementSystem';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-237-monster-knockback-profiles.json', 'utf8'));
type Row = { monsterId: number; stage: number; fps: number; mode: string; direction: number;
  states: (number | boolean | string)[][]; level: number; wallId: string; worldOffset: number[] };
let statesChecked = 0;
function compare(m: MonsterKnockbackMotion, expected: Row['states'][number], label: string) {
  const actual = [m.x, m.y, m.velocityX, m.velocityY, !!m.standingOn, m.head, m.wallLeft, m.wallRight, m.action];
  for (let i = 0; i < actual.length; i++) {
    if (i === 2 || i === 3) assert.ok(Math.abs(Number(actual[i]) - Number(expected[i])) < 1e-8, `${label}/${i}: ${actual[i]} != ${expected[i]}`);
    else assert.equal(actual[i], expected[i], `${label}/${i}`);
  }
  statesChecked++;
}
for (const row of truth.motion as Row[]) {
  const p = getMonsterKnockbackProfile(row.monsterId, row.stage, 1);
  const m = createMonsterKnockbackMotion(p, Number(row.states[0][0]), Number(row.states[0][1]));
  m.action = String(row.states[0][8]);
  const mode = row.mode;
  const b = p.profile.collider;
  let wall: PetGroundWall | undefined;
  if (['floor','hit1-floor','hit4-floor','through','through-up','through-down'].includes(mode)) {
    wall = { id: 'wall', left: 0, right: 1000, top: 200 + b.y + b.height + 1,
      bottom: 200 + b.y + b.height + 31, usesWallTolerance: true,
      through: mode === 'through', throughUp: mode === 'through-up', throughDown: mode === 'through-down', isThroughWallClass: mode === 'through' };
  }
  if (mode === 'ceiling') wall = { id: 'wall', left: 0, right: 1000, top: 200+b.y-4, bottom: 200+b.y-2, usesWallTolerance: true };
  if (mode === 'left') wall = { id: 'wall', left: 400+b.x-4, right: 400+b.x-2, top: 0, bottom: 500, usesWallTolerance: true };
  if (mode === 'right') wall = { id: 'wall', left: 400+b.x+b.width+2, right: 400+b.x+b.width+4, top: 0, bottom: 500, usesWallTolerance: true };
  applyMonsterKnockback(m, 6*row.direction, -5, 0, m.x-100);
  const label = `${row.monsterId}/${row.stage}/${row.fps}/${mode}/${row.direction}`;
  compare(m, row.states[0]!, label+'/0');
  for (let tick = 1; tick <= 24; tick++) {
    if (mode === 'recover' && tick === 5) m.action = 'wait';
    stepMonsterKnockback(m, p, { timeMs: (tick-1)*1000/row.fps, walls: wall ? [wall] : [], worldX: -100, worldY: 0,
      frozen: mode === 'stun' || (mode === 'unfreeze' && tick < 5) });
    compare(m, row.states[tick]!, label+'/'+tick);
  }
}
for (const row of truth.environmentMotion as Row[]) {
  const p = getMonsterKnockbackProfile(row.monsterId, Math.floor(row.level/10), row.level%10);
  const m = createMonsterKnockbackMotion(p, Number(row.states[0][0]), Number(row.states[0][1]));
  const env = truth.environmentInputs.find((r: {level:number}) => r.level === row.level);
  const walls: PetGroundWall[] = env.walls.map((w: {id:string;left:number;top:number;width:number;height:number;throughClass:boolean;markers:string[]}) => ({
    id:w.id,left:w.left,right:w.left+w.width,top:w.top,bottom:w.top+w.height,usesWallTolerance:true,
    through:w.markers.includes('isThroughWall'), throughUp:w.markers.includes('isThroughUpButDownWall'),
    throughDown:w.markers.includes('isThroughDownButUpWall'),isThroughWallClass:w.throughClass }));
  m.action = 'hurt';applyMonsterKnockback(m, 6*row.direction, -5, 0, m.x+row.worldOffset[0]!);
  const label = `env/${row.monsterId}/${row.level}/${row.wallId}/${row.fps}/${row.direction}`;
  compare(m,row.states[0]!,label+'/0');
  for(let tick=1;tick<=24;tick++) {
    stepMonsterKnockback(m,p,{timeMs:(tick-1)*1000/row.fps,walls,worldX:row.worldOffset[0]!,worldY:row.worldOffset[1]!});
    compare(m,row.states[tick]!,label+'/'+tick);
  }
}
console.log(`Monster knockback: ${statesChecked} original profile/environment states matched.`);
