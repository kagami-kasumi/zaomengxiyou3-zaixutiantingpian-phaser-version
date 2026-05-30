# 法宝系统索引

本文记录 `TASK-SETTINGS-019` 对原版法宝系统中宣花葫芦捕捉入口的逆向结果。范围只覆盖法宝装备入口、按键触发、基础生命周期和 `MagicBottle` 捕捉链路；不展开完整法宝技能表、法宝强化、真资源接入或联机同步。

## 资料状态

主要 AS3 证据：

- `extracted_flash/scripts/172845/scripts/base/BaseMagicWeapon.as`
- `extracted_flash/scripts/172845/scripts/export/magicWeapon/MagicBottle.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/my/KeyBoardControl.as`
- `extracted_flash/scripts/172845/scripts/my/AllEquipment.as`
- `extracted_flash/scripts/172845/scripts/export/pack/BackPack.as`
- `extracted_flash/scripts/172845/scripts/export/pack/PackThings.as`
- `extracted_flash/scripts/172845/scripts/export/RoleInfo.as`

相关前置文档：

- `docs/reverse-engineering/equipment-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/skills-input-index.md`

## 装备与创建入口

法宝装备槽类型是 `zbfb`。`AllEquipment.sutra2` 定义宣花葫芦：名称 `宣花葫芦`、`fillName = "xhhl"`、类型 `zbfb`，说明为有一定概率捕捉宠物。

`BaseHero.initMagicWeapon()` 读取 `getPlayer().getCurEquipByType("zbfb")`：

- 本地玩家当前 `zbfb.fillName == "xhhl"` 时创建 `new MagicBottle(this)`。
- 其他 `fillName` 会创建其他法宝，例如 `kyl`、`qyj`、`hyzzs`、`zjld` 等。
- 创建成功后把 `curMagicWeapon` 加到 `gc.gameSence`。
- 联机玩家路径只按 `MutiUser.bmwId` 重建少量基础法宝；捕捉逻辑本身仍只在单机分支执行。

背包装备切换会调用 `hero.changeMagicWeapon()`，先销毁旧法宝再重新 `initMagicWeapon()`。当当前法宝处于使用动作时，背包侧会阻止穿脱 `zbfb` 并提示当前法宝正在使用。

`RoleInfo.fbClick()` 打开的是法宝强化/界面入口，不是法宝释放入口。没有装备 `zbfb` 时提示未装备法宝。

## 基础法宝生命周期

`BaseMagicWeapon` 保存 `sourceRole` 和自身 `bmwId`。构造时初始化动画并进入 `wait`。

`useSkill()` 的规则：

- 如果当前动作已经是 `hit`，普通法宝直接返回，避免重入。
- 否则切到 `hit` 并调用子类 `showSkill()`。

`step()` 的规则：

- 推进法宝自身动画。
- 每隔半轮动画调用 `setPosition()`，让法宝漂浮在英雄左右侧和上方。
- `BaseHero.updateMagicWeapon()` 每帧调用 `curMagicWeapon.step()`；英雄主更新链路会调用该方法。

`setPosition()` 按英雄朝向把法宝放在英雄侧边约 60 像素、上方约 15 或 25 像素处，并调整左右朝向。

`destroy()` 会释放英雄当前法宝引用、销毁动画对象并从父容器移除。

## 触发输入

法宝释放使用技能数组第 7 项，而不是 0 至 4 的普通技能槽，也不是 Space 特殊技：

| 玩家 | 技能数组 | 法宝键 |
| --- | --- | --- |
| P1 | `[Y, L, U, I, O, Space, H]` | `H` / keyCode `72` |
| P2 | `[num8, num3, num4, num5, num6, num0, num7]` | 小键盘 `7` / keyCode `103` |

`KeyBoardControl.__keyBoardDown()` 找到数组下标后调用 `role.sendSkill(index)`。当 index 为 `6` 时，`BaseHero.sendSkill(6)` 调用 `showSkillFaBao()`。

`showSkillFaBao()` 先检查 `gc.isSingleGame()`，非单机直接返回；单机且存在 `curMagicWeapon` 时调用 `curMagicWeapon.useSkill()`。

## 宣花葫芦捕捉

`MagicBottle` 是宣花葫芦的法宝类，`bmwId = BaseMagicWeapon.BMW_Bottle`，动画资源名为 `MagicBottleBmd`。构造中设置 `mp = 20`，但当前捕捉链路实际门禁和消耗使用玩家灵魂值。

`MagicBottle.showSkill()`：

- 玩家灵魂值 `< 5000` 时提示 `灵魂不足5000，无法捕捉！`，葫芦回到 `wait`，不生成捕捉特效。
- 灵魂足够时创建 `SpecialEffectBullet("MagicBottleEffect3")`，按英雄朝向放在英雄左右 70 像素处，加入 `sourceRole.magicBulletArray` 和 `gc.gameSence`。
- 约 2 秒后葫芦动作回到 `wait`。

`MagicBottle.step()`：

- 仅在 `gc.isSingleGame()` 时处理捕捉。
- 检查 `gc.pWorld.likeMonsterArray` 中的 `Monster70` 至 `Monster78`。
- 用捕捉特效和怪物 `colipse` 做复杂碰撞检测。
- 命中后立即扣除 `5000` 灵魂，并按怪物类型设置宠物名和概率。
- 成功时调用 `sourceRole.getPlayer().catchNewPet(petName, bm.getLevel())`；返回 true 后延迟提示成功并销毁怪物。
- 满栏或随机失败时不销毁怪物，但灵魂已经扣除。

详细怪物映射、概率、等级来源和现代捕捉切片边界见 `docs/reverse-engineering/pets-index.md`。

## 现代实现边界

首个捕捉切片可以只实现宣花葫芦等价能力：

- 复用 `PetSystem` 的宠物列表和出战实体。
- 复用装备系统里 `zbfb`/`xhhl` 的语义，但不实现完整法宝强化 UI。
- 在测试场景提供可捕捉怪物等价对象、灵魂值、`H` 释放、命中碰撞、概率判定和入宠物列表。
- 成功捕捉直接进入宠物列表，不走掉落或背包。

后置范围：

- 其他法宝和全部法宝技能。
- 法宝强化面板和数值成长。
- 真正的 `MagicBottleBmd`、`MagicBottleEffect2/3` 资源。
- P2/联机法宝同步。
