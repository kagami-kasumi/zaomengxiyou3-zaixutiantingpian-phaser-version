import { heroPartyMonsterTargets } from './HeroPartyMonsterReception';
import { monster3AttackHits, type Monster3Attack } from '../systems/Monster3AttackRuntime';
import { monster3TargetProfile } from '../systems/Monster3CollisionSystem';

type Args = Parameters<typeof heroPartyMonsterTargets>;
export function heroPartyMonster3Targets(model: Args[0], runtimes: Args[1], readPet: Args[2],
  destroyed: Args[3], attack: Monster3Attack, readCompatibility?: Args[5]) {
  return heroPartyMonsterTargets(model, runtimes, readPet, destroyed,
    (sourceType, x, y) => monster3AttackHits(attack, monster3TargetProfile(sourceType), x, y), readCompatibility);
}
