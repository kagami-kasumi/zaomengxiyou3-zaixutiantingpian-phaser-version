export type PlayerSoulOwner = {
  soulCount: number;
};

export type PlayerSoulSpendResult = {
  ok: boolean;
  soulBefore: number;
  soulAfter: number;
};

export function canSpendPlayerSouls(owner: PlayerSoulOwner, amount: number): boolean {
  return Number.isSafeInteger(amount)
    && amount >= 0
    && Number.isSafeInteger(owner.soulCount)
    && owner.soulCount >= amount;
}

export function spendPlayerSouls(
  owner: PlayerSoulOwner,
  amount: number,
): PlayerSoulSpendResult {
  const soulBefore = owner.soulCount;
  if (!canSpendPlayerSouls(owner, amount)) {
    return { ok: false, soulBefore, soulAfter: soulBefore };
  }
  owner.soulCount -= amount;
  return { ok: true, soulBefore, soulAfter: owner.soulCount };
}
