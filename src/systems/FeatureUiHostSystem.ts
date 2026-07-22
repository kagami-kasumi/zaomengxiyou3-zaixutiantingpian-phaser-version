export const FeatureUiPages = ['backpack', 'skills', 'pets', 'magic-weapon', 'workshop'] as const;

export type FeatureUiPage = typeof FeatureUiPages[number];
export type FeatureUiOwner = 'p1' | 'p2';
export type FeatureUiOriginKind = 'map' | 'combat';

export type FeatureUiSession = {
  page: FeatureUiPage;
  owner: FeatureUiOwner;
  originSceneKey: string;
  originKind: FeatureUiOriginKind;
  playerCount: 1 | 2;
};

export type FeatureUiHostModel = {
  active?: FeatureUiSession;
  lastFeedback: string;
};

export type OpenFeatureUiResult =
  | { status: 'opened'; session: FeatureUiSession }
  | { status: 'busy'; session: FeatureUiSession }
  | { status: 'invalid-owner' };

const PageLabels: Record<FeatureUiPage, string> = {
  backpack: '背包 / 装备',
  skills: '心法 / 技能',
  pets: '宠物管理',
  'magic-weapon': '法宝强化',
  workshop: '装备工坊',
};

export function createFeatureUiHostModel(): FeatureUiHostModel {
  return { lastFeedback: '功能页面主机就绪' };
}

export function openFeatureUi(
  model: FeatureUiHostModel,
  input: FeatureUiSession,
): OpenFeatureUiResult {
  if (!isOwnerAvailable(input.owner, input.playerCount)) {
    model.lastFeedback = '当前游戏没有第二位玩家';
    return { status: 'invalid-owner' };
  }
  if (model.active) {
    model.lastFeedback = '已有功能页面打开';
    return { status: 'busy', session: model.active };
  }
  model.active = { ...input };
  model.lastFeedback = `${formatFeatureUiOwner(input.owner)} · ${getFeatureUiPageLabel(input.page)}`;
  return { status: 'opened', session: model.active };
}

export function switchFeatureUi(
  model: FeatureUiHostModel,
  page: FeatureUiPage,
  owner: FeatureUiOwner,
): FeatureUiSession | undefined {
  const active = model.active;
  if (!active || !isOwnerAvailable(owner, active.playerCount)) return undefined;
  active.page = page;
  active.owner = owner;
  model.lastFeedback = `${formatFeatureUiOwner(owner)} · ${getFeatureUiPageLabel(page)}`;
  return active;
}

export function closeFeatureUi(model: FeatureUiHostModel): FeatureUiSession | undefined {
  const previous = model.active;
  model.active = undefined;
  model.lastFeedback = '功能页面已关闭';
  return previous;
}

export function getFeatureUiPageLabel(page: FeatureUiPage): string {
  return PageLabels[page];
}

export function formatFeatureUiOwner(owner: FeatureUiOwner): string {
  return owner === 'p1' ? 'P1' : 'P2';
}

export function isOwnerAvailable(owner: FeatureUiOwner, playerCount: 1 | 2): boolean {
  return owner === 'p1' || playerCount === 2;
}
