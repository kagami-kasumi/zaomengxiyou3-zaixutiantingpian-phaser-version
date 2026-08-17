import taskPageTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175h-task-page.json';

export type TaskTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

export type TaskTruthTextStyle = Readonly<{
  fontFamily: string;
  fontSize: number;
  color: string;
}>;

type TaskTruthObject = (typeof taskPageTruth.displayObjects)[number];

export const TaskPageTruthId = 'task-settings-175h.task-page' as const;

export const TaskTruthObjectIds = {
  root: 'task-page-root',
  dailyTab: 'task-page-root.dailymc',
  activityTab: 'task-page-root.activitymc',
  claim: 'task-page-root.getaward',
  close: 'task-page-root.btn_close',
  previous: 'task-page-root.prepage',
  next: 'task-page-root.nextpage',
  pageText: 'task-page-root.txtpage',
  description: 'task-page-root.txtinstr',
  progress: 'task-page-root.txtcur',
  rows: ['task-page-root.t1', 'task-page-root.t2', 'task-page-root.t3', 'task-page-root.t4', 'task-page-root.t5'],
  rewards: ['task-page-root.alist1', 'task-page-root.alist2', 'task-page-root.alist3', 'task-page-root.alist4'],
} as const;

export function assertVerifiedTaskPageTruth(): void {
  if (taskPageTruth.truthId !== TaskPageTruthId || taskPageTruth.status !== 'verified') {
    throw new Error(`${taskPageTruth.truthId} is not the verified task-page truth.`);
  }
  if (taskPageTruth.displayObjects.length !== 45 || taskPageTruth.states.length !== 28) {
    throw new Error(`${TaskPageTruthId} completeness drifted.`);
  }
  if (!taskPageTruth.completeness.displayListMatched
    || !taskPageTruth.completeness.stateSetMatched
    || taskPageTruth.completeness.unresolved.length > 0) {
    throw new Error(`${TaskPageTruthId} contains unresolved or unmatched evidence.`);
  }
}

export function getTaskTruthBounds(id: string, stateId = 'daily-initial'): TaskTruthBounds {
  const placement = findPlacement(id, stateId);
  if (!placement.visible || !placement.stageBounds) {
    throw new Error(`${TaskPageTruthId} ${id} is not visible in ${stateId}.`);
  }
  return placement.stageBounds;
}

export function getTaskTruthHitArea(id: string, stateId = 'daily-initial'): TaskTruthBounds {
  const placement = findPlacement(id, stateId) as ReturnType<typeof findPlacement> & {
    hitArea?: TaskTruthBounds;
  };
  if (!placement.visible || !placement.hitArea) {
    throw new Error(`${TaskPageTruthId} ${id} has no visible hit area in ${stateId}.`);
  }
  return placement.hitArea;
}

export function getTaskTruthTextStyle(id: string): TaskTruthTextStyle {
  const object = findObject(id) as TaskTruthObject & {
    render: { textStyle?: TaskTruthTextStyle };
  };
  if (!object.render.textStyle) {
    throw new Error(`${TaskPageTruthId} ${id} has no text style.`);
  }
  return object.render.textStyle;
}

export function getTaskTileTruthBounds(
  row: number,
  child?: 'name' | 'received',
): TaskTruthBounds {
  const rootId = getIndexedId(TaskTruthObjectIds.rows, row, 'row');
  if (!child) return getTaskTruthBounds(rootId);
  if (child === 'name') return getTaskTruthBounds(`${rootId}.rwnametxt`);

  const sourceRoot = getTaskTruthBounds(TaskTruthObjectIds.rows[0]);
  const sourceChild = getTaskTruthBounds(`${TaskTruthObjectIds.rows[0]}.hasReceiveIcon`, 'claimed-selected');
  const targetRoot = getTaskTruthBounds(rootId);
  return {
    left: roundTruthCoordinate(targetRoot.left + sourceChild.left - sourceRoot.left),
    top: roundTruthCoordinate(targetRoot.top + sourceChild.top - sourceRoot.top),
    width: sourceChild.width,
    height: sourceChild.height,
  };
}

export function getTaskRewardTruthBounds(
  rewardIndex: number,
  child?: 'name' | 'icon',
): TaskTruthBounds {
  const rootId = getIndexedId(TaskTruthObjectIds.rewards, rewardIndex, 'reward');
  if (!child) return getTaskTruthBounds(rootId);
  return getTaskTruthBounds(`${rootId}.${child === 'name' ? 'txtname' : 'runtime-icon'}`, 'reward-four-candidates');
}

export function getTaskTruthCharacterId(id: string): number {
  const characterId = findObject(id).sourceIdentity.characterId;
  if (typeof characterId !== 'number') {
    throw new Error(`${TaskPageTruthId} ${id} has no character id.`);
  }
  return characterId;
}

export function getTaskTruthStateIds(): readonly string[] {
  assertVerifiedTaskPageTruth();
  return taskPageTruth.states.map(({ id }) => id);
}

function findObject(id: string): TaskTruthObject {
  assertVerifiedTaskPageTruth();
  const object = taskPageTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${TaskPageTruthId} is missing ${id}.`);
  return object;
}

function findPlacement(id: string, stateId: string) {
  const placement = findObject(id).placements.find((candidate) => candidate.stateId === stateId);
  if (!placement) throw new Error(`${TaskPageTruthId} ${id} has no placement for ${stateId}.`);
  return placement;
}

function getIndexedId(ids: readonly string[], index: number, label: string): string {
  if (!Number.isInteger(index) || index < 0 || index >= ids.length) {
    throw new RangeError(`${TaskPageTruthId} ${label} index must be 0..${ids.length - 1}.`);
  }
  return ids[index]!;
}

function roundTruthCoordinate(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}
