import { heroPartyMonsterTargets } from './HeroPartyMonsterReception';
import { monster2AttackHits, type Monster2Attack } from '../systems/Monster2AttackRuntime';
import { monster2TargetProfile } from '../systems/Monster2CollisionSystem';

type Args = Parameters<typeof heroPartyMonsterTargets>;
export function heroPartyMonster2Targets(model: Args[0], runtimes: Args[1], readPet: Args[2],
  destroyed: Args[3], attack: Monster2Attack, readCompatibility?: Args[5]) {
  return heroPartyMonsterTargets(model, runtimes, readPet, destroyed,
    (sourceType, x, y) => monster2AttackHits(attack, monster2TargetProfile(sourceType), x, y), readCompatibility);
}
