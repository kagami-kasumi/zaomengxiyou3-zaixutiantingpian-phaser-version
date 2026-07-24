export type Stage22DevOptions = Readonly<{
  enabled: boolean;
  playerCount: 1 | 2;
  spawnX?: number;
  noDamage: boolean;
  freezeFireFrame?: number;
}>;

export type Stage22PlayerCount = 1 | 2;
export type Stage22QaOptions = Readonly<{
  fastClear?: boolean;
  noDamage?: boolean;
  failParty?: boolean;
}>;

export function normalizeStage22PlayerCount(value: unknown): Stage22PlayerCount {
  return value === 2 ? 2 : 1;
}

export function readStage22QaOptions(search: string, isDevelopment: boolean): Stage22QaOptions {
  if (!isDevelopment) return {};
  const params = new URLSearchParams(search);
  return {
    fastClear: params.get('qaFastClear') === '1',
    noDamage: params.get('qaNoDamage') === '1',
    failParty: params.get('qaFailParty') === '1',
  };
}

export function isStage22LocalQaHost(hostname: string): boolean {
  return hostname === '127.0.0.1' || hostname === 'localhost';
}

export function readStage22DevOptions(search: string, isDev: boolean): Stage22DevOptions {
  if (!isDev) return { enabled: false, playerCount: 1, noDamage: false };
  const params = new URLSearchParams(search);
  const requestedSpawnX = Number(params.get('qaX'));
  const spawnX = Number.isFinite(requestedSpawnX) && requestedSpawnX >= 100
    && requestedSpawnX <= 4_600 ? requestedSpawnX : undefined;
  const requestedFrame = Number(params.get('qaFireFrame'));
  const freezeFireFrame = Number.isInteger(requestedFrame)
    && requestedFrame >= 1 && requestedFrame <= 130 ? requestedFrame : undefined;
  return {
    enabled: params.get('qaStage') === '2-2-layout',
    playerCount: params.get('players') === '2' ? 2 : 1,
    ...(spawnX === undefined ? {} : { spawnX }),
    noDamage: params.get('qaNoDamage') === '1',
    ...(freezeFireFrame === undefined ? {} : { freezeFireFrame }),
  };
}
