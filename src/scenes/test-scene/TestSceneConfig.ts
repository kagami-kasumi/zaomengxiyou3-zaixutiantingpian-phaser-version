export type TestScenePlayerCount = 1 | 2;

export function getTestScenePlayerCount(search = globalThis.location?.search ?? ''): TestScenePlayerCount {
  return new URLSearchParams(search).get('players') === '2' ? 2 : 1;
}

