import { addInventoryResource } from './InventorySystem';
import { addHeroExperience } from './ProgressionSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type { LoadedGameState, PartyTaskSaveV6 } from './SaveSystem';
import type { EquipmentDefinition } from './EquipmentSystem';

export type TaskRewardType = 'dj' | 'zzs' | 'lh' | 'exp' | 'roomhorse';
export type TaskNeed = Readonly<{ label: string; producerKey: string; quantity: number }>;
export type TaskReward = Readonly<{ type: TaskRewardType; value: string; label: string }>;
export type DailyTaskDefinition = Readonly<{
  id: number;
  name: string;
  description: string;
  needs: readonly TaskNeed[];
  rewards: readonly TaskReward[];
}>;
export type DailyTaskState = {
  id: number;
  progress: number[];
  isComplete: boolean;
  hasClaimed: boolean;
};
export type PartyTaskModel = {
  dateKey: string;
  daily: DailyTaskState[];
};

const RewardLabels: Readonly<Record<string, string>> = {
  exp: '经验', lh: '灵魂', roomhorse: '炎马',
};

// 权威顺序来自 GameTask.newAllTask；紧凑字符串只承担静态数据目录，不承载行为规则。
const DailyRows = [
  [1, '袭天的妖怪1', '黑龟:Monster8:20', '尾火棍制作书:zzs:whgzzs|灵魂:lh:250'],
  [2, '袭天的妖怪2', '黑虎:Monster7:20', '角木铲制作书:zzs:jmczzs|灵魂:lh:250'],
  [3, '袭天的妖怪3', '黑龟:Monster8:25|巫鹰:Monster3:10', '壁水袍制作书:zzs:bspzzs|灵魂:lh:250'],
  [4, '袭天的妖怪4', '黑虎:Monster7:25|巫鹰:Monster3:10', '氐土铠制作书:zzs:dtkzzs|灵魂:lh:250'],
  [5, '反叛的天兵1', '天兵(斧):Monster18:25|天兵(刀):Monster9:25', '胃土耙制作书:zzs:wtpzzs|经验:exp:600'],
  [6, '反叛的天兵2', '天兵(棒):Monster17:25|天兵(枪):Monster10:25', '翼火甲制作书:zzs:yhjzzs|经验:exp:600'],
  [7, '反叛的天兵3', '天兵(斧):Monster18:25|天兵(弓):Monster19:25', '井木衣制作书:zzs:jmyzzs|经验:exp:600'],
  [8, '梅山的余党1', '牛妖:Monster1:30|蛇妖:Monster13:30', '红莲教皇制作书:zzs:hljhzzs|经验:exp:2000'],
  [9, '梅山的余党2', '狗妖:Monster11:35|蜈蚣精:Monster14:35', '顽石金刚制作书:zzs:wsjgzzs|经验:exp:2000'],
  [10, '梅山的余党3', '羊妖:Monster12:35|蜈蚣精:Monster14:35', '银弹金弓制作书:zzs:ydjgzzs|经验:exp:2000'],
  [11, '挑战心魔1', '邪·沙僧:Monster32:5', '流石碎片1:dj:lssp_1|流石碎片2:dj:lssp_2|流石碎片3:dj:lssp_3'],
  [12, '挑战心魔2', '邪·八戒:Monster33:5', '流石碎片2:dj:lssp_2|流石碎片3:dj:lssp_3|流石碎片4:dj:lssp_4'],
  [13, '挑战心魔3', '邪·唐僧:Monster31:5', '流石碎片5:dj:lssp_5|流石碎片6:dj:lssp_6|流石碎片7:dj:lssp_7'],
  [14, '挑战心魔4', '邪·悟空:Monster34:6', '流石碎片6:dj:lssp_6|流石碎片7:dj:lssp_7|流石碎片8:dj:lssp_8'],
  [15, '挑战心魔5', '邪·后羿:Monster172:7', '流石碎片7:dj:lssp_7|流石碎片8:dj:lssp_8|流石碎片9:dj:lssp_9'],
  [16, '大闹凌霄', '二郎神:Monster22:5', '风灵珠:dj:wpflz|灵魂:lh:10000'],
  [17, '冲上宝塔1', '土行孙:Monster35:6', '天残制作书:zzs:xltczzs|经验:exp:2000'],
  [18, '冲上宝塔2', '土行孙:Monster35:6', '犹绝制作书:zzs:xlyjzzs|经验:exp:2000'],
  [19, '冲上宝塔3', '雷震子:Monster36:5', '天荒制作书:zzs:xlthzzs|经验:exp:2000'],
  [20, '冲上宝塔4', '雷震子:Monster36:5', '如狱制作书:zzs:xlryzzs|经验:exp:2000'],
  [21, '冲上宝塔5', '哪吒:Monster38:5', '熔炼石:dj:rls|经验:exp:2000'],
  [22, '冲上宝塔6', '李靖:Monster37:5', '天枢石:dj:tss|玉衡石:dj:yhs|经验:exp:2000'],
  [23, '铲除凶兽', '梼杌:Monster47:2', '龙女的眼泪:dj:wplvdyl'],
  [24, '勇闯兜率宫1', '银角大王:Monster53:4', '毒丹:dj:wpdd'],
  [25, '勇闯兜率宫2', '金角大王:Monster54:4', '虬龙甲制作书:zzs:qljzzs|蟠龙袍制作书:zzs:plpzzs|应龙凯制作书:zzs:ylkzzs|蛟龙甲制作书:zzs:jljzzs'],
  [26, '勇闯兜率宫3', '青牛精:Monster58:4', '虬龙棍制作书:zzs:qlgzzs|蟠龙杖制作书:zzs:plzzzs|应龙斧制作书:zzs:ylfzzs|蛟龙铲制作书:zzs:jlczzs'],
  [27, '九龙汇元', '花豹圣者:Monster118:1', '4级昆仑玉:dj:kly4'],
  [28, '兽藏龙脊', '狻猊圣者:Monster120:1', '4级昆仑玉:dj:kly4'],
  [29, '匿隐尾妖', '狴犴圣者:Monster125:1', '4级昆仑玉:dj:kly4'],
  [30, '仙音渺渺', '碧霄:Monster131:1', '5级昆仑玉:dj:kly5'],
  [31, '仙幻扑朔', '琼霄:Monster135:1', '5级昆仑玉:dj:kly5'],
  [32, '仙树万丈', '云霄:Monster139:1', '5级昆仑玉:dj:kly5'],
  [33, '寒暑易节', '毗摩智多罗:Monster1008:5', '5级昆仑玉:dj:kly5'],
  [34, '镬汤地狱', '罗宣:Monster111:5', '炎马:roomhorse:1'],
  [35, '玉石俱焚·壹', '飞鹰:Monster30:1000', '4级昆仑玉:dj:kly4'],
  [36, '玉石俱焚·贰', '飞鹰:Monster30:1000', '5级昆仑玉:dj:kly5'],
  [37, '勇闯兜率宫6', '太上老君:Monster65:5', '紫炎:dj:zy'],
  [38, '真假六耳猕猴', '六耳猕猴:Monster1007:3', '六耳衫:dj:les|六耳棍:dj:leg'],
  [39, '通天赦令', '蚊妖:Monster186:1|蝉妖:Monster189:1|千年蜈蚣:Monster203:1', '通天赦令:dj:ttsl'],
  [40, '头衔升级1', '雷震子:Monster36:1', '优秀七曜战神头衔:dj:yxqyzstx'],
  [41, '头衔升级2', '六耳猕猴:Monster1007:1', '精良七曜战神头衔:dj:jlqyzstx'],
  [42, '头衔升级3', '太白金星:Monster64:1', '史诗七曜战神头衔:dj:ssqyzstx'],
  [43, '头衔升级4', '花豹圣者:Monster118:1', '传说七曜战神头衔:dj:csqyzstx'],
] as const;

export const DailyTaskDefinitions: readonly DailyTaskDefinition[] = DailyRows.map(
  ([id, name, needs, rewards]) => ({
    id,
    name,
    description: name,
    needs: needs.split('|').map((encoded) => {
      const [label, producerKey, quantity] = encoded.split(':');
      return { label: label!, producerKey: producerKey!, quantity: Number(quantity) };
    }),
    rewards: rewards.split('|').map((encoded) => {
      const [label, type, value] = encoded.split(':');
      return { label: label!, type: type as TaskRewardType, value: value! };
    }),
  }),
);

export const DormantActivityTaskIds = [101, 102, 103, 104] as const;

export function createPartyTaskModel(now = new Date(), saved?: PartyTaskSaveV6): PartyTaskModel {
  const dateKey = getLocalDateKey(now);
  const savedById = saved?.dateKey === dateKey
    ? new Map(saved.daily.map((state) => [state.id, state]))
    : new Map<number, PartyTaskSaveV6['daily'][number]>();
  return {
    dateKey,
    daily: DailyTaskDefinitions.map((definition) => {
      const restored = savedById.get(definition.id);
      const progress = definition.needs.map((need, index) =>
        Math.min(need.quantity, Math.max(0, restored?.progress[index] ?? 0)));
      const isComplete = progress.every((count, index) => count >= definition.needs[index]!.quantity);
      return { id: definition.id, progress, isComplete, hasClaimed: isComplete && restored?.hasClaimed === true };
    }),
  };
}

export function encodePartyTaskModel(model: PartyTaskModel): PartyTaskSaveV6 {
  return {
    dateKey: model.dateKey,
    daily: model.daily.map((state) => ({
      id: state.id,
      progress: [...state.progress],
      isComplete: state.isComplete,
      hasClaimed: state.hasClaimed,
    })),
  };
}

export function recordTaskMonsterDefeat(
  model: PartyTaskModel,
  producerKey: string,
  difficulty: 0 | 1 | 2,
): number {
  if (difficulty === 2) return 0;
  let changed = 0;
  for (const state of model.daily) {
    const definition = DailyTaskDefinitions[state.id - 1];
    if (!definition || state.hasClaimed) continue;
    definition.needs.forEach((need, index) => {
      if (need.producerKey !== producerKey || state.progress[index]! >= need.quantity) return;
      state.progress[index] += 1;
      changed += 1;
    });
    state.isComplete = definition.needs.every((need, index) => state.progress[index]! >= need.quantity);
  }
  return changed;
}

export function claimTaskReward(params: {
  model: PartyTaskModel;
  taskId: number;
  restored: LoadedGameState;
  registry: Readonly<Record<string, EquipmentDefinition>>;
  random?: () => number;
}): { ok: boolean; message: string; reward?: TaskReward; modernDifferences: readonly string[] } {
  const state = params.model.daily.find((item) => item.id === params.taskId);
  const definition = DailyTaskDefinitions.find((item) => item.id === params.taskId);
  if (!state || !definition || !state.isComplete || state.hasClaimed) {
    return { ok: false, message: '任务尚未完成或奖励已领取', modernDifferences: [] };
  }
  const random = Math.min(1, Math.max(0, params.random?.() ?? Math.random()));
  const index = Math.round(random * (definition.rewards.length - 1));
  const reward = definition.rewards[index]!;
  const players = params.restored.party.playerCount === 2
    ? [params.restored.player1, params.restored.player2]
    : [params.restored.player1];
  if (reward.type === 'lh') {
    for (const player of players) player.soulCount += Number(reward.value);
  } else if (reward.type === 'exp') {
    for (const player of players) {
      const pet = player.petRoster.pets[player.petRoster.selectedIndex];
      if (pet) pet.exp += Number(reward.value);
      else addHeroExperience(player.progression, Number(reward.value));
    }
  } else if (reward.type === 'roomhorse') {
    params.restored.player1.petRoster.pets.push(createRewardHorse(params.restored.player1.petRoster.pets.length));
  } else {
    for (const player of players) {
      const result = addInventoryResource(player.inventoryStore, params.registry, reward.value, 1);
      if (!result.ok) return { ok: false, message: result.message, modernDifferences: [] };
    }
  }
  state.hasClaimed = true;
  return {
    ok: true,
    message: `获得${reward.label}${RewardLabels[reward.type] ? `（${RewardLabels[reward.type]}）` : ''}`,
    reward,
    modernDifferences: reward.type === 'exp'
      ? ['P2 经验按各自 owner 路由，修正原版误查 P1 宠物的串号缺陷']
      : [],
  };
}

export function getTaskProgressText(definition: DailyTaskDefinition, state: DailyTaskState): string {
  return definition.needs
    .map((need, index) => `${need.label} ${state.progress[index] ?? 0}/${need.quantity}`)
    .join('；');
}

export function getLocalDateKey(now: Date): string {
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function createRewardHorse(index: number) {
  return {
    id: `task-horse-${Date.now()}-${index}`,
    species: 'horse1',
    form: 1,
    displayName: '炎马',
    level: 1, exp: 0, expToNext: 100,
    hp: 150, maxHp: 150, mp: 100, maxMp: 100,
    atk: 20, def: 10, critBonusRate: 0, skillDamageBonus: 0,
    moveSpeed: 2, lifetime: 0, quality: 1,
    hpQuality: 10, mpQuality: 10, atkQuality: 10, defQuality: 10,
    perception: 10, technique: 10, warpower: 0,
    isActive: false, skills: ['sp'], skillState: createPetSkillState(),
  };
}
