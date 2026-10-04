import { monsterSourcePower, type MonsterDamageRequest, type MonsterDamageReception } from './MonsterDamageReception';

/** Bullet reception counters only; world timing, geometry and display belong to the attack owner. */
export type MonsterAttackReception = {
  serial: number;
  prefix: string;
  interval: number;
  count: number;
  remaining: number;
};

export type MonsterReceptionTarget = Readonly<{
  ids: string[];
  receive: (request: MonsterDamageRequest) => MonsterDamageReception;
}>;

export function refreshMonsterAttackSource(request: MonsterDamageRequest): void {
  // BaseBullet stores hurt/qixue/atk through three real calls, including unused values.
  for (let index = 0; index < 3; index++) monsterSourcePower(request.source, request.power);
}

export function createMonsterAttackReception(prefix: string, interval: number,
  request: MonsterDamageRequest, remaining: number): MonsterAttackReception {
  refreshMonsterAttackSource(request);
  return { serial: 1, prefix, interval, count: 0, remaining };
}

export function checkMonsterAttackReception(state: MonsterAttackReception, input: MonsterDamageRequest,
  targets: readonly Readonly<{ hero: MonsterReceptionTarget; pet?: MonsterReceptionTarget }>[]): void {
  if (state.remaining <= 0) return;
  let bingo = input.bingo;
  if (input.difficulty === 2) bingo = input.source.random() <= 1;
  if (state.count === state.interval) { state.serial++; state.count = 0; }
  if (state.count >= 0) state.count++;
  const request = { ...input, bingo, attackId: `${state.prefix}${state.serial}` };
  for (const pair of targets) {
    if (!pair.hero.ids.includes(request.attackId) && pair.hero.receive(request).accepted) {
      refreshMonsterAttackSource(request);
      pair.hero.ids.push(request.attackId);
      state.remaining--;
    }
    if (state.remaining > 0 && pair.pet && !pair.pet.ids.includes(request.attackId)
      && pair.pet.receive(request).accepted) {
      pair.pet.ids.push(request.attackId);
      state.remaining--;
    }
    if (state.remaining <= 0) break;
  }
}
