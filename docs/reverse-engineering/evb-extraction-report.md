# RegiMA（EVB）原始资源恢复报告

## 结论

2026-07-15 使用 RegiMA 资源恢复流程和官方 `evbunpack` 0.2.6 成功恢复 `再续天庭1.1.exe` 的 Enigma Virtual Box 虚拟文件系统。原始命名资源现统一放在 Git 忽略的项目内本地目录 `local-resources/regima/`，代表性角色、关卡和怪物 SWF 经 176-byte 重排后可被 FFDec 26.0.0 正常解析和导出。

这次结果推翻了“原 EXE 中可能没有真素材”的弱假设。此前 `local-resources/regima/legacy-extraction/` 只是不包含原始命名的子资源包；旧提取集仍保持只读，用于 AS3 和旧结果对照。

## 输入与工具

| 项目 | 路径 | SHA-256 |
| --- | --- | --- |
| 源 EXE | `再续天庭1.1.exe` | `d7a5dd2d12eafcae8e355f98c35eb7537188749fec151f090bb186c6856fc1ff` |
| 解包器 | `evbunpack.exe` 0.2.6 | `8c0ee1ba242aeb09cbaefe9b300ef8e1737b34af871353c1380f80fb4c98b1c8` |
| SWF 验证器 | `C:\Program Files (x86)\FFDec\ffdec-cli.exe` 26.0.0 | 本机既有安装 |

`evbunpack.exe` 的大小和 SHA-256 与 GitHub 官方 0.2.6 Release 资产一致。以下是当时使用的命令（历史记录；当前产物已迁移）：

```powershell
.\evbunpack.exe --ignore-pe `.\再续天庭1.1.exe` `D:\flash-unpacked`
```

`--ignore-pe` 用于只恢复虚拟文件系统，不恢复或运行容器内主程序。

## 当前本地产物

| 路径 | 内容 |
| --- | --- |
| `local-resources/regima/source/unpacked/` | EVB 原始文件系统，206 个文件，473,460,042 bytes |
| `local-resources/regima/manifests/unpacked-manifest.json` | 206 个原始解包文件的相对路径、大小和 SHA-256 |
| `local-resources/regima/source/restored-swfs/` | 174 个已还原标准头的 SWF，保留原相对目录；视觉资源定位首选入口 |
| `local-resources/regima/manifests/restored-swfs-manifest.json` | 还原模式、签名、版本、声明长度及输入/输出 SHA-256 |
| `local-resources/regima/manifests/unpacked-swf-audit.json` | 原始解包 SWF 审计结果 |
| `local-resources/regima/validation/images/` | 三个代表包的 FFDec 图片抽检输出 |
| `local-resources/regima/task-outputs/` | 已执行资源任务的本地选择性导出与 symbol 调查产物 |

这些目录不是项目源码，整个 `local-resources/` 已由 `.gitignore` 排除，也没有写入或覆盖 `local-resources/regima/legacy-extraction/`。

## SWF 还原方法与全量结果

AS3 加载器在运行时执行以下变换：

```text
input[97..175] + input[0..96] + input[176..end]
```

对 175 个 `.swf` 扫描后的结果：

| 状态 | 数量 | 说明 |
| --- | ---: | --- |
| 原始文件已是标准 SWF | 3 | 不重排，原样复制 |
| 重排后为 `CWS` | 105 | zlib 压缩 SWF |
| 重排后为 `FWS` | 65 | 未压缩 SWF |
| 重排后为 `ZWS` | 4 | LZMA 压缩 SWF，FFDec 可解析 |
| 未解析 | 1 | `assets/231111.swf`，保留在原始解包目录，不伪造成功 |

因此恢复率为 `174 / 175`。唯一未解析项的原始 SHA-256 为 `3ac394dab231876d4dd6ffd526ce72fba3b3600ab441b86fcef259deb6139c50`。

## 代表样本验证

| 样本 | 原始大小 | 原始 SHA-256 | 还原签名 | FFDec 结果 | 语义证据 |
| --- | ---: | --- | --- | --- | --- |
| `assets/WuKong.swf` | 11,561,112 | `c4f922b23863dca52ee8a9c33b138103e5f3e541c6aa0fa20d5045d5dd3083d9` | `CWS` v17 | exit 0，1002 行标签，184 张图片 | 找到 `Role1Bullet`，导出悟空动作图集 |
| `assets/levels/level11.swf` | 806,983 | `c2dfe956cf13f472e260d08dfa2dae9452ac641bc7e21a74f4297f93561f56ce` | `FWS` v15 | exit 0，178 行标签，20 张图片 | 找到 `sl11`，导出凤凰立柱场景件 |
| `assets/Monster1111.swf` | 522,218 | `ffe4f475b1b4d2d2c22eafb5c469235df021977565d7129e5ca27ae7b34d086e` | `CWS` v43 | exit 0，305 行标签，12 张图片 | 找到 `Monster1111`，导出怪物动作图集 |
| `assets/past.swf` | 167,185 | `8b184e7ca2665bf3a55349a1dd4d2db4ad3ff2401749bc7457c0fa3df23816a0` | `ZWS` v41 | exit 0，69 行标签 | 证明 LZMA 样本可解析 |

三个主要样本的声明长度均与解压后的实际 SWF 长度一致，标签流均能解析到唯一 End 标签。视觉抽检能确认角色、关卡和怪物语义；部分透明边缘带有彩色通道边纹，后续制作 atlas 时需要单独评估清边方式。

## 可复现性

相同命令第二次提取到 `D:\flash-unpacked-repro`：

- 命令退出码 `0`；
- 两次均为 206 个文件；
- 按相对路径、文件长度和 SHA-256 比较，差异数为 `0`；
- 比对后已删除重复目录。

## 后续边界

- `TASK-ASSET-002` 不再依赖用户提供外部源包，可以从 `local-resources/regima/source/restored-swfs/` 选择一个最小真资源族。
- 真素材接入前仍需按 MovieClip/SymbolClass 选择性导出和标注；不要把 174 个 SWF 一次性全部转换进 `public/assets`。
- `assets/231111.swf` 单独保持 unresolved，除非后续 AS3 或格式证据表明它实际不是 SWF。
- 不执行解包得到的 EXE/DLL，不修改旧的 `local-resources/regima/legacy-extraction/` 证据集。
