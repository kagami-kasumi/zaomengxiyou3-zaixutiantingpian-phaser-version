# AIR 运行时验证工具

本文件登记本机 AIR 工具及按需调用合同，供逆向证据协议命中触发条件时读取。它不持有游戏 task 状态，不是所有任务的前置门禁，也不是现代游戏运行依赖。

## 路径与可用性

| 项目 | 本机值 |
| --- | --- |
| SDK 根目录 | `D:/AIRsdkmanager/sdk/AIRSDK_51.3.4` |
| ADL | `D:/AIRsdkmanager/sdk/AIRSDK_51.3.4/bin/adl.exe` |
| AS3 编译入口 | `D:/AIRsdkmanager/sdk/AIRSDK_51.3.4/bin/mxmlc.bat` |
| SDK 版本文件 | `D:/AIRsdkmanager/sdk/AIRSDK_51.3.4/air-sdk-description.xml` |
| 管理器 | `D:/AIRsdkmanager/AIRSDKManager.exe`，只用于管理下载，不是测试运行入口 |
| 原版自带runtime根 | 工作区内`local-resources/regima/source/unpacked/`，其下包含`Adobe AIR/`；DLL为51.1.1.5，与原解包清单hash一致 |

2026-09-06 已确认 SDK 版本为51.3.4/build 3，`adl.exe -help`退出0；仅证明启动器可执行，未证明某个碰撞/时间轴fixture已通过。目录在工作区外，可直接访问，无须复制SDK到仓库。换机器或升级时核实用户实际路径，更新本表；不得静默选择另一版本覆盖旧基准。

```powershell
$airSdkRoot = 'D:/AIRsdkmanager/sdk/AIRSDK_51.3.4'
& "$airSdkRoot/bin/adl.exe" -help
Get-Content -LiteralPath "$airSdkRoot/air-sdk-description.xml"
```

工具不可用时报告缺少的具体文件。不得自动下载/安装复杂软件；沿用AGENTS安装规则。已确认路径在当前会话无变化时不反复探测。

原版兼容验证优先复用游戏包已有runtime：先窄查unpacked的descriptor、runtime DLL和提取清单，不仅查PATH/系统安装目录。218已验证SDK ADL通过`-runtime <unpacked绝对路径>`可加载原版AIR51.1.1.5；参数不是DLL路径。原版组件只读，使用自建fixture，不修改原游戏descriptor。原版与新版runtime对比结果落当前task证据。

## 触发条件与读取路由

满足下列任一条件，且结果会影响当前合同/实现时，读取本文件并建立有界运行fixture：

- 静态AS3/SWF提取不能确定实际运行语义，例如`BitmapData.draw`、颜色变换/混合、像素采样、mask/filter、动态显示列表或事件/帧执行顺序。
- FFDec导出、源码推导、原版观察或现代实现之间出现尚未解释的差异，需要执行源逻辑区分原因。
- 当前task明确要求源运行trace或原生运行时基准，且已有证据未覆盖该状态。

仅出现上述API名称不自动触发。常量/公式已明确、静态资源导出、现代重构、文档修改、普通UI调整及已有证据覆盖且输入未变的任务，默认不调用AIR。不将ADL加入`check:harness`、`check:workflow`或`check:all`，避免所有开发都依赖本机SDK。

## 使用方法

1. 先冻结要回答的问题、源locator、输入和预期状态集合。优先加载恢复源的目标定义或执行原始源函数；测试支架只负责注入输入、采样和输出，不能重写待证明算法来自证。
2. 在`local-resources/regima/task-outputs/<task-id>/air/`准备有界SWF与AIR application descriptor。编译新增AS3时使用SDK的AIR配置，记录编译命令与参数；不改恢复源和legacy-extraction。ADL接收的是descriptor XML，不能直接把SWF路径当作descriptor。
3. descriptor的`initialWindow.content`指向测试SWF，选兼容的命名空间及desktop profile；记录舞台大小、帧率、renderMode、缩放和runtime版本。需要显示列表的测试保留正常舞台，可设`initialWindow.visible=false`；**不要使用`-cmd`，该模式没有stage/display list**。需要人工视觉观察时才显示窗口。
4. 原始trace输出结构化case ID、输入、测量值及完成标记，必要时保存局部buffer PNG。fixture完成后显式退出；调用方加有界超时，只终止本次创建的进程，不杀其他AIR应用。
5. 独立verifier检查全部预期case、完成标记、测量值及正负边界。成功启动或退出0不等于语义通过；崩溃、缺case、超时、重复调用已有实例均不得当成功。保留stdout/stderr、真实退出码及运行元数据。

以下为**已准备好fixture后的调用模板**，不是仓库现成的碰撞验收命令；替换`<task-id>`和descriptor文件名：

```python
from pathlib import Path
import subprocess

sdk = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
probe = (Path('local-resources/regima/task-outputs/<task-id>/air')).resolve()
result = subprocess.run(
    [str(sdk / 'bin/adl.exe'), '-profile', 'desktop',
     str(probe / 'application.xml'), str(probe)],
    cwd=probe, capture_output=True, timeout=60,
)
(probe / 'stdout.log').write_bytes(result.stdout)
(probe / 'stderr.log').write_bytes(result.stderr)
print('ADL exit:', result.returncode)  # 后续仍须独立检查case与完成标记
```

普通SDK试验可使用其自带runtime；原版兼容验证优先指定原版runtime并记录来源。文档描述trace输出到stdout，但本机Windows实测trace位于stderr，因此必须保留并解析两个输出流。调用形式和`-cmd`限制见[AIR官方ADL文档](https://airsdk.dev/docs/building/air-debug-launcher)。

## 证据边界与保存

- 标注为“AIR 51.3.4实测”，不能直接写成“当年Flash Player实测”。运行时差异敏感的结论仍须与原版/独立证据交叉确认，差异未解时保留`unresolved`。
- 本地完整产物留在task-outputs；可交接的fixture源码/调用命令、源与SWF哈希、SDK/runtime版本、参数、环境、case集合、摘要/差异结果保存在当前task的evidence目录。真值晋升仍走原有Schema/完整性/证据门禁。
- 不由本工具自动修改task状态、晋升verified或解除Blocked；SDK安装完成与合同验收完成是两件事。

## 调用频率与复用

频率由证据失效条件决定，不按时间定期运行：

| 场景 | 调用策略 |
| --- | --- |
| 普通开发、静态提取、无新疑点 | 0次 |
| 首次接入或SDK路径/版本变化 | 1次环境探测；版本变化后重验受影响基准 |
| 首次研究一种未确认运行语义 | 将相关正/负/边界case合成1个有界批次运行；失败后按具体问题追加 |
| 修正fixture、输入、源资源或运行参数 | 重跑受影响批次；关键差异解决后执行该合同的完整验收批次 |
| 只改现代实现，源输入及运行环境均不变 | 复用已核验源基准，运行现代消费者回归；出现反证才重开源实测 |
| 同机制后续任务 | 核对源hash、SDK/runtime、fixture版本、参数和case覆盖；全部适用则复用，否则补差异case |

不承诺每任务固定调用次数，不按帧或每个对象单独启动进程。一个进程尽可能跑完同一合同的有限case集合；重复运行必须由变化、失败或未解项驱动。

## MCP 决策

当前使用CLI即可：现有shell工具能启动ADL、控制超时并收集文件/trace，增加MCP不会提高采样真实性。本次不新建MCP服务。

只有后续出现多个客户端反复使用同一套稳定fixture协议、需要共享进程调度/取消、标准化结构化结果或远程运行时，再评估薄MCP封装。封装应复用同一CLI/fixture和验证器，不另写算法、不自动升级真值、不绕过超时与来源记录。需要批量调用时，先用当前task的脚本组织批次。
