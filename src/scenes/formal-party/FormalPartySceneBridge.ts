import {
  resolveFormalPartyRuntime,
  type FormalPartyRuntime,
  type FormalPartySceneData,
} from '../../systems/FormalPartyRuntimeSystem';
import type { SaveStorage } from '../../systems/SaveSystem';

export function resolveFormalPartyScene(
  data: FormalPartySceneData | undefined,
  allowDevOverride: boolean,
): FormalPartyRuntime | undefined {
  return resolveFormalPartyRuntime(getBrowserStorage(), data, allowDevOverride);
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

