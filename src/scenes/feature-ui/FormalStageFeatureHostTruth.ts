import stageFeatureHostTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175c-stage-feature-host.json';

export const StageFeatureHostTruthId = 'task-settings-175c.stage-feature-host' as const;
export const StageFeatureHostNegativeStateId = 'map-origin-no-shared-chrome' as const;

export function assertVerifiedStageFeatureHostTruth(): void {
  if (stageFeatureHostTruth.truthId !== StageFeatureHostTruthId
    || stageFeatureHostTruth.status !== 'verified') {
    throw new Error(`${stageFeatureHostTruth.truthId} is not the verified stage-feature-host truth.`);
  }
  if (stageFeatureHostTruth.displayObjects.length !== 25
    || stageFeatureHostTruth.states.length !== 42) {
    throw new Error(`${StageFeatureHostTruthId} completeness drifted.`);
  }
  if (stageFeatureHostTruth.completeness.unresolved.length > 0) {
    throw new Error(`${StageFeatureHostTruthId} contains unresolved evidence.`);
  }
  const visibleCount = stageFeatureHostTruth.completeness
    .expectedVisibleObjectCountByState[StageFeatureHostNegativeStateId];
  if (visibleCount !== 0) {
    throw new Error(`${StageFeatureHostNegativeStateId} must remain an empty original host scope.`);
  }
}

export function getStageFeatureHostTruthStateIds(): readonly string[] {
  assertVerifiedStageFeatureHostTruth();
  return stageFeatureHostTruth.states.map((state) => state.id);
}
