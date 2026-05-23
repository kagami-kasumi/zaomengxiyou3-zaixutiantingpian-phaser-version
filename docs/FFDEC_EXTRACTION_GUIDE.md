# FFDec 提取资料维护说明

本文只记录现有提取资料的维护边界。当前项目默认认为首轮提取已经完成，后续工作直接基于现有资料推进。

AI 必须遵守：

- 不要在本项目路径内运行 FFDec。
- 不要修改、删除或重新生成 `extracted_flash/` 中现有提取结果，除非用户明确要求。
- 如果发现关键源码或资源缺失，先说明缺失内容，不要自行重提取。

## 当前已完成状态

已有提取结果见：

- `extracted_flash/README_extract.md`
- `extracted_flash/scripts/172845/scripts`
- `extracted_flash/scripts/25034429/scripts`
- `extracted_flash/resources`

当前主参考包是 `[172845].swf`。备用参考包是 `[25034429].swf`。

## 资料补充原则

如果后续需要补充资料：

1. 先在文档中列出缺失的源码、资源或符号映射。
2. 由用户决定是否提供额外资料。
3. 新资料进入项目后，只补充确认需要的文件，不直接覆盖现有 `extracted_flash/`。
4. 补充完成后，更新 `extracted_flash/README_extract.md` 说明新增内容、时间和差异。

AI 如果参与后续整理，只能在用户明确授权后处理用户放入项目的新文件。
