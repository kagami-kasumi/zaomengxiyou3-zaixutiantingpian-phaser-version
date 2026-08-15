import role1ShadowTruth from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-173-role1-shadow.json';

export type Role1ShadowAction = 'walk' | 'hit1' | 'hit2';
export type Role1ShadowDirection = 'left' | 'right';

type TruthState = {
  id: string;
  entry: string;
  frame: number;
};

type TruthPlacement = {
  stateId: string;
  visible: boolean;
  registrationPoint: { x: number; y: number } | null;
  localBounds: { left: number; top: number; width: number; height: number } | null;
};

type ShadowTruthManifest = {
  truthId: string;
  status: string;
  stage: { frameRate: number };
  states: TruthState[];
  displayObjects: Array<{
    id: string;
    placements: TruthPlacement[];
  }>;
};

const manifest = role1ShadowTruth as ShadowTruthManifest;
if (manifest.truthId !== 'task-settings-173.role1-shadow' || manifest.status !== 'verified') {
  throw new Error('Role1 shadow runtime requires the verified TASK-SETTINGS-173 truth');
}

function readAction(action: Role1ShadowAction) {
  const states = manifest.states
    .filter((state) => state.id.startsWith(`${action}-`) && state.id.endsWith('-left'))
    .sort((left, right) => left.frame - right.frame);
  if (states.length === 0) throw new Error(`Role1 shadow truth has no ${action} states`);
  return states.map((state) => {
    const hold = /hold=(\d+)/.exec(state.entry)?.[1];
    if (!hold) throw new Error(`Role1 shadow truth state ${state.id} has no host-tick hold`);
    return Object.freeze({ frame: state.frame, holdTicks: Number(hold) });
  });
}

function readShadowPlacements(): TruthPlacement[] {
  const placements = manifest.displayObjects.find(
    (object) => object.id === 'role1-shadow-bitmap',
  )?.placements;
  if (!placements) throw new Error('Role1 shadow truth has no role1-shadow-bitmap display object');
  return placements;
}

const shadowPlacements = readShadowPlacements();

export const Role1ShadowTruth = Object.freeze({
  truthId: manifest.truthId,
  tickRate: manifest.stage.frameRate,
  tickMs: 1_000 / manifest.stage.frameRate,
  lifetimeTicks: manifest.stage.frameRate * 3,
  actions: Object.freeze({
    walk: Object.freeze(readAction('walk')),
    hit1: Object.freeze(readAction('hit1')),
    hit2: Object.freeze(readAction('hit2')),
  }),
});

export function getRole1ShadowActionTotalTicks(action: Role1ShadowAction): number {
  return Role1ShadowTruth.actions[action].reduce((sum, state) => sum + state.holdTicks, 0);
}

export function getRole1ShadowActionCell(
  action: Role1ShadowAction,
  candidate: number,
  completedTicks: number,
): { cell: number; frame: number } {
  const sequence = Role1ShadowTruth.actions[action];
  if (action === 'walk') {
    const cell = Math.max(0, Math.min(sequence.length - 1, Math.trunc(candidate)));
    return { cell, frame: sequence[cell]!.frame };
  }
  const totalTicks = getRole1ShadowActionTotalTicks(action);
  const tick = Math.max(0, Math.min(totalTicks - 1, Math.trunc(completedTicks)));
  let cumulative = 0;
  for (let cell = 0; cell < sequence.length; cell += 1) {
    cumulative += sequence[cell]!.holdTicks;
    if (tick < cumulative) return { cell, frame: sequence[cell]!.frame };
  }
  const cell = sequence.length - 1;
  return { cell, frame: sequence[cell]!.frame };
}

export function getRole1ShadowPlacement(
  action: Role1ShadowAction,
  cell: number,
  direction: Role1ShadowDirection,
): TruthPlacement {
  const placement = shadowPlacements.find(
    (candidate) => candidate.stateId === `${action}-${cell}-${direction}`,
  );
  if (!placement?.visible || !placement.registrationPoint || !placement.localBounds) {
    throw new Error(`Role1 shadow truth has no visible placement for ${action}-${cell}-${direction}`);
  }
  return placement;
}
