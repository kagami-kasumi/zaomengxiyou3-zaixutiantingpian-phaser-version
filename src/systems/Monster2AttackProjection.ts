import display from '../assets/monster2-native-display.json';

/** Native crops already contain original child transforms, alpha and direction. */
export function projectMonster2Attack(attack: Readonly<{
  attack: 1 | 2 | 3; frame: number; facingX: -1 | 1; x: number; y: number;
}>) {
  const sign = attack.facingX === -1 ? 1 : -1;
  const pose = display.poses.find(p => p.attack === attack.attack && p.frame === attack.frame && p.sign === sign);
  if (!pose) throw new Error(`Unverified Monster2 display ${attack.attack}/${attack.frame}/${sign}`);
  return { ...pose, x: attack.x + pose.x, y: attack.y + pose.y };
}
