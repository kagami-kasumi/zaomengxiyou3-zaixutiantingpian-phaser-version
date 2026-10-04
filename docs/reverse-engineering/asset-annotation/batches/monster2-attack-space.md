# 标注批次：monster2-attack-space

## 范围

- 资源族：Monster2Bullet1_1、Monster2Bullet1_2、Monster2Bullet2。
- 影响切片：VS-067；TASK-SETTINGS-257A空间输入，后续Monster2实现。
- 包含三对象双向逐帧、实际colipse、原生world/EXIT；排除身体atlas、Tween与真实HP。

## 输入和证据

- 现代入口：Stage12MonsterVisualSystem 的 monster2Hit1Start/monster2Hit1End/monster2Hit2，仅作映射。
- 恢复源包：`local-resources/regima/source/restored-swfs/assets/1.swf`，char49/34/30；目标StageCommon与40构造复核。
- FFDec选择性XML、原AIR基准、机器清单及复验入口见 `../../monster2-attack-space-contract.md`。
- 人工证据：234精确碰撞像素许可已获用户明确批准；无视觉来源缺失。

## Agent 调查结论

| 对象 | status | confidence | nextAction | 证据 |
| --- | --- | --- | --- | --- |
| Monster2Bullet1_1 | derived-ready | confirmed | review-candidate | 14帧双向；234个精确碰撞残差已批准 |
| Monster2Bullet1_2 | derived-ready | confirmed | none | 20帧双向，6帧全透明、7–20空树；像素零差异 |
| Monster2Bullet2 | derived-ready | confirmed | none | 14帧双向，实际裸MC暂停继续与EXIT移除 |

权威结构化标注直接保存在 `ground-truth/manifests/monster2-attack-space.json` 与reference sidecar，不另复制坐标CSV；总体状态verified；仅有限空间输入通过，生产仍需257B/真实HP补证。

## 人工动作与去向

仅需裁决第一弹234个冻结碰撞像素例外；没有回答时可完成所有原生/Schema/工具检查，但不晋升verified。不是请求重提取、定位符号或接受视觉替代。当前257A已完成归档；同线257B唯一Ready，不生成无阻塞实现任务。

## 关闭检查

- 三对象来源、身份、逐帧和唯一去向已记录；无缺原资源、无猜测补事实。
- 原生PNG与显示树、真实CHECK映射已生成；精确碰撞许可已绑定并重验。
- 本批已完成关闭；父257其余范围交257B。
