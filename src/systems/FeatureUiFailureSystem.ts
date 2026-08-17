import type {
  FeatureUiOwner,
  FeatureUiPage,
} from './FeatureUiHostSystem';

export const FeatureUiFailureEvent = 'feature-ui-failed';

export type FeatureUiFailurePhase =
  | 'owner'
  | 'bundle'
  | 'page-assets'
  | 'origin'
  | 'host'
  | 'render';

export type FeatureUiFailureSignal = Readonly<{
  phase: FeatureUiFailurePhase;
  page: FeatureUiPage;
  owner: FeatureUiOwner;
  originSceneKey: string;
  message: string;
}>;

export function createFeatureUiFailureSignal(input: Readonly<{
  phase: FeatureUiFailurePhase;
  page: FeatureUiPage;
  owner: FeatureUiOwner;
  originSceneKey: string;
  error?: unknown;
}>): FeatureUiFailureSignal {
  return {
    phase: input.phase,
    page: input.page,
    owner: input.owner,
    originSceneKey: input.originSceneKey,
    message: formatFailureMessage(input.error),
  };
}

function formatFailureMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string' && error.length > 0) return error;
  return 'Feature UI failed without an error message.';
}
