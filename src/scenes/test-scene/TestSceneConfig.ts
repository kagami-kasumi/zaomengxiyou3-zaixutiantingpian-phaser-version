export type TestScenePlayerCount = 1 | 2;

export function getTestScenePlayerCount(search = globalThis.location?.search ?? ''): TestScenePlayerCount {
  return new URLSearchParams(search).get('players') === '2' ? 2 : 1;
}

export function isRole1ShadowQaEnabled(search = globalThis.location?.search ?? ''): boolean {
  return new URLSearchParams(search).get('qaRole1Shadow') === '1';
}
