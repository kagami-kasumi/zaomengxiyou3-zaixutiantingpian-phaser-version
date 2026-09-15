# 216C 本地全宠物入口交接

完成：默认 http://localhost:5173/ 存档页右上可发现“创建 / 刷新全宠物测试档”，显式点击复用210A fixture，双人各35只/9家族，存档6可经原存档按钮进入地图。刷新指重读/选择已有全宠物档并刷新列表，保留测试进度，不重置存档。QA入口只在存档页存在，退出即清理。

## 证据

- `entry-verification.json`：实际production build、独立Edge存储、9个默认/点击/重载/原生存档入口/普通档/损坏档/query/4174/非本地主机状态通过；940×590三张截图，warning/error为0。默认地址无query且点击前无fixture；实际点击存档6后进入地图，DOM入口清理。
- `tools/pet-visual-qa-save-tests.ts`：双owner35宠物/9家族、localhost与127.0.0.1、端口/host/query禁执行、已有档逐字节保留与active-slot保护通过。
- 生产门禁在DOM与fixture函数两层，必须localhost/127.0.0.1:5173。Boot已删除query自动写档调用；`?qaPetSave=all`单独出现不触发创建，4174/127.0.0.2实际浏览器入口隐藏且不写档。
- 普通/损坏存档6返回occupied、raw与active-slot均不变；已有双人35宠物档只选择，raw保持；其他槽位不写。复用既有slot5(显示6)、schema和roster生成，无新增正式字段/第二Runtime。
- 构建与全系统回归、structure/annotations/workflow/audit/diff全部通过。结构保留9项既有warning、构建保留大chunk提示、workflow保留既有PlayerSlot别名提示，无门禁error。未更改任何战斗输入：fixture仍是原210A双人/全宠物数据生成；216B实际战斗报告复用，不以存档成功替代伤害验收。

## 父216合同核销

| 合同 | 证据与结果 |
| --- | --- |
| 215源真值及完整producer语义 | 215 handoff/109源图态/22源行为组/34fixture；本轮check/self-test通过，未知/不适用明确 |
| pnum资源、唯一combat-common、直接显示及原版几何/时序 | 216A handoff；32数据态、68实际WebGL/Canvas对照、13+13+1变异；像素差最多2/255通道取整 |
| 所有当前结算producer、owner、不同producer/去重、0/致死/盾/保护/转嫁/环境 | 216B handoff/适用性矩阵、runtime专项与10变异、216实际TestScene adapter trace；B1/B2修复反证分别36/20数值、216/24真实adapter与10/13变异 |
| 实际五关/TestScene及清理 | 216B gameplay-verification：五关P1/P2实际trace，1-2真实hero+pet pnum，冰火环境数字，五关重试/返回及Page.reload清理；零console warning/error |
| 怪物数字/连击/最高值/结果不回归 | 全系统含combat-feedback/结果/五关旅程；211/212专项保持通过，无incoming→combo路径 |
| 默认5173可发现并安全使用全宠物档 | 本批9实际浏览器状态与slot保护专项，原生存档进入地图截图 |

父216与216C本批归档，M-054当前存在producer闭环、VS-072完成。未实现玄龟正式重定向/GXP/Pig8/hero DOT等仍按B矩阵保留，不虚报新玩法已完成。功能线仍Active：猴/马/青龙三族完成，其余六族继续；下一项为TASK-SETTINGS-221玄龟完整家族行为证据，继而补对应视觉真值/实现，不执行194。

## 复验与交接

`npm run build` 后4174 preview与 `npx vite preview --host 0.0.0.0 --port 5173 --strictPort` 可提供同一生产构建；没有启动npm run dev。`npm run test:pet-qa-entry` 使用两端口和独立浏览器profile。5173/4174本次保持运行。未执行Git提交或上传；全部变更建议复核后commit，再push。下一家族建议新对话，当前目标已完成。
