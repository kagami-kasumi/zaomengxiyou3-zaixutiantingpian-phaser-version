import { createCraftingItemDefinitionRegistry } from './CraftingItemDefinitionRegistry';
import {
  createEmptyEquipmentStats,
  type EquipmentDefinition,
  type EquipmentItemType,
} from './EquipmentSystem';

export type EquipmentMakingMaterial = {
  fillName: string;
  quantity: number;
};

export type EquipmentMakingRecipe = {
  bookFillName: string;
  productFillName: string;
  requiredMaterials: readonly EquipmentMakingMaterial[];
};

export const DeadEquipmentMakingBookFillName = 'zxqtgzzs';

const recipes: EquipmentMakingRecipe[] = [];

function addRecipes(bookFillNames: readonly string[], requiredMaterials: readonly EquipmentMakingMaterial[]): void {
  for (const bookFillName of bookFillNames) {
    recipes.push({
      bookFillName,
      productFillName: bookFillName.slice(0, -3),
      requiredMaterials,
    });
  }
}

addRecipes(['whgzzs'], [{ fillName: 'wptm', quantity: 20 }]);
addRecipes(['jmczzs'], [{ fillName: 'wptm', quantity: 10 }, { fillName: 'wpxt', quantity: 10 }]);
addRecipes(['bspzzs'], [{ fillName: 'wpsc', quantity: 20 }]);
addRecipes(['dtkzzs'], [{ fillName: 'wpxt', quantity: 20 }]);
addRecipes(['wtpzzs'], [{ fillName: 'wptm', quantity: 20 }, { fillName: 'wpxt', quantity: 20 }]);
addRecipes(['yhjzzs'], [{ fillName: 'wpsc', quantity: 20 }, { fillName: 'wpxt', quantity: 20 }]);
addRecipes(['jmyzzs'], [{ fillName: 'wpsc', quantity: 40 }]);
addRecipes(['tfljzzs'], [{ fillName: 'wpsc', quantity: 20 }, { fillName: 'wpxt', quantity: 20 }]);
addRecipes(['mgzhzzs'], [{ fillName: 'wptm', quantity: 20 }, { fillName: 'wpxt', quantity: 40 }]);
addRecipes(['hljhzzs'], [{ fillName: 'wpsc', quantity: 80 }]);
addRecipes(['wsjgzzs'], [{ fillName: 'wpxt', quantity: 80 }]);
addRecipes(['ydjgzzs'], [{ fillName: 'wptm', quantity: 40 }, { fillName: 'wpxt', quantity: 40 }]);
addRecipes(['tdlzjzzs'], [{ fillName: 'wptm', quantity: 40 }, { fillName: 'wpxt', quantity: 80 }]);
addRecipes(['xleyzzs', 'xlnyzzs'], [{ fillName: 'wpsc', quantity: 80 }, { fillName: 'wpxt', quantity: 80 }]);
addRecipes(['xlczzzs', 'xlyjzzs'], [{ fillName: 'wpsc', quantity: 160 }]);
addRecipes(['xlryzzs', 'xltzzzs'], [{ fillName: 'wpxt', quantity: 160 }]);
addRecipes(['xlthzzs', 'xltqzzs', 'xltszzs'], [{ fillName: 'wptm', quantity: 80 }, { fillName: 'wpxt', quantity: 80 }]);
addRecipes(['xltczzs'], [{ fillName: 'wptm', quantity: 160 }]);
addRecipes(['llyzzs'], [{ fillName: 'yhs', quantity: 3 }, { fillName: 'tss', quantity: 3 }]);
addRecipes(['qlgzzs', 'plzzzs', '_cljzzs', 'ylfzzs', 'jlczzs', 'jlgzzs'], [{ fillName: 'yhs', quantity: 3 }, { fillName: 'wpxt', quantity: 300 }]);
addRecipes(['qljzzs', 'plpzzs', 'clpzzs', 'ylkzzs', 'jljzzs'], [{ fillName: 'tss', quantity: 3 }, { fillName: 'wpsc', quantity: 300 }]);
addRecipes(['ryjgbzzs', 'xhjxjzzs', 'lhzzzs', 'jcdpzzs', 'mdflczzs', 'mdcqgzzs'], [{ fillName: 'yhs', quantity: 7 }, { fillName: 'wpxt', quantity: 999 }]);
addRecipes(['dszkzzs', 'xhmlpzzs', 'jljszzs', 'tpzyzzs', 'mdyszzs'], [{ fillName: 'tss', quantity: 7 }, { fillName: 'wpsc', quantity: 999 }]);
addRecipes(['bxhyzzs'], [{ fillName: 'wpzty', quantity: 3 }, { fillName: 'wpsc', quantity: 1888 }]);
addRecipes(['zhhzzzs'], [{ fillName: 'wpxty', quantity: 3 }, { fillName: 'wpxt', quantity: 1888 }]);
addRecipes(['phhlzzs'], [{ fillName: 'wpycjh', quantity: 3 }, { fillName: 'wptm', quantity: 1888 }]);
addRecipes(['cs_fj_dzzzs', 'cs_fj_tlzzs', 'cs_fj_jszzs', 'cs_fj_jtzzs', 'cs_fj_ztzzs'], [{ fillName: 'yhs', quantity: 7 }, { fillName: 'wpsc', quantity: 888 }]);
addRecipes(['cs_wq_llzzs', 'cs_wq_qszzs', 'cs_wq_glzzs', 'cs_wq_rczzs', 'cs_wq_ytzzs'], [{ fillName: 'tss', quantity: 7 }, { fillName: 'wpxt', quantity: 888 }]);
addRecipes(['zxstgzzs', 'zxptzzzs', 'zxztpzzs', 'zxqtczzs', 'sqmdcqgzzs', 'zxztjzzs'], [{ fillName: 'gjtss', quantity: 5 }, { fillName: 'wpxt', quantity: 999 }]);
addRecipes(['zxstjzzs', 'zxptyzzs', 'zxztkzzs', 'zxqtszzs', 'zxttpzzs'], [{ fillName: 'gjyhs', quantity: 5 }, { fillName: 'wpsc', quantity: 999 }]);
addRecipes(['ylkjzzs', 'hxkjzzs', 'xakjzzs', 'fykjzzs'], [{ fillName: 'wpsc', quantity: 80 }, { fillName: 'wpxt', quantity: 80 }]);
addRecipes(['lyrzzs', 'lxqzzs', 'zlfzzs', 'fljzzs'], [{ fillName: 'wpxt', quantity: 160 }]);

export const EquipmentMakingRecipes: readonly EquipmentMakingRecipe[] = recipes;
export const EquipmentMakingRecipeRegistry: Readonly<Record<string, EquipmentMakingRecipe>> = Object.fromEntries(
  EquipmentMakingRecipes.map((recipe) => [recipe.bookFillName, recipe]),
);

type SupplementalProduct = readonly [
  fillName: string,
  name: string,
  type: EquipmentItemType,
  user: string,
  quality: string,
  color: string,
];

const SupplementalProducts: readonly SupplementalProduct[] = [
  ['whg', '尾火棍', 'zbwq', '悟空', '优 秀', '0x00FF00'],
  ['jmc', '角木铲', 'zbwq', '沙僧', '优 秀', '0x00FF00'],
  ['bsp', '壁水袍', 'zbfj', '唐僧', '优 秀', '0x00FF00'],
  ['dtk', '氐土铠', 'zbfj', '八戒', '优 秀', '0x00FF00'],
  ['wtp', '胃土耙', 'zbwq', '八戒', '精 良', '0x0000FF'],
  ['yhj', '翼火甲', 'zbfj', '悟空', '精 良', '0x0000FF'],
  ['jmy', '井木衣', 'zbfj', '沙僧', '精 良', '0x0000FF'],
  ['ydjg', '银弹金弓', 'zbwq', '沙僧', '史 诗', '0x660099'],
  ['wsjg', '顽石金刚', 'zbfj', '八戒', '史 诗', '0x660099'],
  ['hljh', '红莲教皇', 'zbfj', '唐僧', '史 诗', '0x660099'],
  ['qlj', '虬龙甲', 'zbfj', '悟空', '魂 器', '0x66ffff'],
  ['qlg', '虬龙棍', 'zbwq', '悟空', '魂 器', '0x66ffff'],
  ['plz', '蟠龙杖', 'zbwq', '唐僧', '魂 器', '0x66ffff'],
  ['plp', '蟠龙袍', 'zbfj', '唐僧', '魂 器', '0x66ffff'],
  ['ylf', '应龙斧', 'zbwq', '八戒', '魂 器', '0x66ffff'],
  ['ylk', '应龙铠', 'zbfj', '八戒', '魂 器', '0x66ffff'],
  ['jlg', '蛟龙弓', 'zbwq', '沙僧', '魂 器', '0x66ffff'],
  ['jlc', '蛟龙铲', 'zbwq', '沙僧', '魂 器', '0x66ffff'],
  ['jlj', '蛟龙甲', 'zbfj', '沙僧', '魂 器', '0x66ffff'],
  ['clp', '螭龙袍', 'zbfj', '白龙', '魂 器', '0x66ffff'],
  ['_clj', '螭龙剑', 'zbwq', '白龙', '魂 器', '0x66ffff'],
  ['sqmdcqg', '神摩多苍穹弓', 'zbwq', '沙僧', '神 器', '0xFF0000'],
  ['zxstg', '诛邪弑天棍', 'zbwq', '悟空', '神 器', '0xFF0000'],
  ['zxstj', '诛邪弑天甲', 'zbfj', '悟空', '神 器', '0xFF0000'],
  ['zxptz', '诛邪破天杖', 'zbwq', '唐僧', '神 器', '0xFF0000'],
  ['zxpty', '诛邪破天衣', 'zbfj', '唐僧', '神 器', '0xFF0000'],
  ['zxztp', '诛邪震天耙', 'zbwq', '八戒', '神 器', '0xFF0000'],
  ['zxztk', '诛邪震天铠', 'zbfj', '八戒', '神 器', '0xFF0000'],
  ['zxqtc', '诛邪擎天铲', 'zbwq', '沙僧', '神 器', '0xFF0000'],
  ['zxqts', '诛邪擎天衫', 'zbfj', '沙僧', '神 器', '0xFF0000'],
  ['zxztj', '诛邪斩天剑', 'zbwq', '白龙', '神 器', '0xFF0000'],
  ['zxttp', '诛邪托天袍', 'zbfj', '白龙', '神 器', '0xFF0000'],
  ['ylkj', '炎龙铠甲', 'zbfj', '悟空', '魂 器', '0x66ffff'],
  ['hxkj', '黑犀铠甲', 'zbfj', '唐僧', '魂 器', '0x66ffff'],
  ['xakj', '雪獒铠甲', 'zbfj', '八戒', '魂 器', '0x66ffff'],
  ['fykj', '风鹰铠甲', 'zbfj', '沙僧', '魂 器', '0x66ffff'],
  ['lyr', '烈焰刃', 'zbwq', '悟空', '魂 器', '0x66ffff'],
  ['lxq', '流星枪', 'zbwq', '唐僧', '魂 器', '0x66ffff'],
  ['zlf', '震雷斧', 'zbwq', '八戒', '魂 器', '0x66ffff'],
  ['flj', '风轮剑', 'zbwq', '沙僧', '魂 器', '0x66ffff'],
];

export function createEquipmentMakingDefinitionRegistry(
  existing: Readonly<Record<string, EquipmentDefinition>> = {},
): Record<string, EquipmentDefinition> {
  const registry = {
    ...existing,
    ...createCraftingItemDefinitionRegistry(existing),
  };
  for (const [fillName, name, type, user, quality, color] of SupplementalProducts) {
    if (registry[fillName]) continue;
    registry[fillName] = {
      showId: 1,
      name,
      fillName,
      type,
      user,
      quality,
      color,
      stats: createEmptyEquipmentStats(),
      description: '1.1 AllEquipment.as 制作产物身份；完整基础数值仍由装备内容全集任务闭合',
    };
  }
  for (const recipe of EquipmentMakingRecipes) {
    const product = registry[recipe.productFillName];
    if (!product) throw new Error(`Missing equipment making product definition: ${recipe.productFillName}`);
    if (!registry[recipe.bookFillName]) {
      registry[recipe.bookFillName] = {
        showId: 100,
        name: `${product.name}制作书`,
        fillName: recipe.bookFillName,
        type: 'zbwp',
        user: '',
        quality: product.quality,
        color: product.color,
        stats: createEmptyEquipmentStats(),
        description: `可以打造出 ${product.name}`,
      };
    }
  }
  return registry;
}
