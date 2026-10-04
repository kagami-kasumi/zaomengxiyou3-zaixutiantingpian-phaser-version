import display from '../assets/monster3-native-display.json';
import type { Monster3Attack } from './Monster3AttackRuntime';

/** Already rasterized native child transforms/alpha and both directions; never flip these again. */
export function projectMonster3Attack(attack: Readonly<Monster3Attack>) {
  const sign = attack.facingX === -1 ? 1 : -1;
  const pose = display.poses.find(p => p.attack === (attack.action === 'hit1' ? 1 : 2)
    && p.frame === attack.frame && p.sign === sign);
  if (!pose) throw new Error(`Unverified Monster3 display ${attack.action}/${attack.frame}/${sign}`);
  return { key: pose.key, x: attack.x + pose.x, y: attack.y + pose.y,
    width: pose.width, height: pose.height };
}
