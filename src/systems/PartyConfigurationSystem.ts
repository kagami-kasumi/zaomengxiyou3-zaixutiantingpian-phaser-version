import type { HeroId } from './HeroNormalAttackSystem';
import type { PlayerSlot } from './InputSystem';

export type PartyMember = {
  heroId: HeroId;
};

export type PartyConfiguration =
  | { playerCount: 1; members: { p1: PartyMember } }
  | { playerCount: 2; members: { p1: PartyMember; p2: PartyMember } };

export function isHeroId(value: unknown): value is HeroId {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

export function createPartyConfiguration(
  playerCount: unknown,
  p1HeroId: unknown,
  p2HeroId?: unknown,
): PartyConfiguration | undefined {
  if (!isHeroId(p1HeroId)) return undefined;
  if (playerCount === 1) {
    return { playerCount: 1, members: { p1: { heroId: p1HeroId } } };
  }
  if (playerCount !== 2 || !isHeroId(p2HeroId) || p1HeroId === p2HeroId) return undefined;
  return {
    playerCount: 2,
    members: {
      p1: { heroId: p1HeroId },
      p2: { heroId: p2HeroId },
    },
  };
}

export function parsePartyConfiguration(value: unknown): PartyConfiguration | undefined {
  if (!isRecord(value) || !isRecord(value.members)) return undefined;
  const memberKeys = Object.keys(value.members);
  if (value.playerCount === 1) {
    const p1 = value.members.p1;
    return memberKeys.length === 1 && memberKeys[0] === 'p1' &&
      isRecord(p1) && Object.keys(p1).length === 1
      ? createPartyConfiguration(1, p1.heroId)
      : undefined;
  }
  if (value.playerCount === 2) {
    const p1 = value.members.p1;
    const p2 = value.members.p2;
    return memberKeys.length === 2 && memberKeys.includes('p1') && memberKeys.includes('p2') &&
      isRecord(p1) && Object.keys(p1).length === 1 &&
      isRecord(p2) && Object.keys(p2).length === 1
      ? createPartyConfiguration(2, p1.heroId, p2.heroId)
      : undefined;
  }
  return undefined;
}

export function getPartyPlayerSlots(party: PartyConfiguration): readonly PlayerSlot[] {
  return party.playerCount === 1 ? ['p1'] : ['p1', 'p2'];
}

export function getPartyHeroId(
  party: PartyConfiguration,
  ownerSlot: PlayerSlot,
): HeroId | undefined {
  return ownerSlot === 'p1'
    ? party.members.p1.heroId
    : party.playerCount === 2
      ? party.members.p2.heroId
      : undefined;
}

export function partyMatchesPlayerHeroes(
  party: PartyConfiguration,
  player1HeroId: unknown,
  player2HeroId: unknown,
): boolean {
  return party.members.p1.heroId === player1HeroId &&
    (party.playerCount === 1 || party.members.p2.heroId === player2HeroId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
