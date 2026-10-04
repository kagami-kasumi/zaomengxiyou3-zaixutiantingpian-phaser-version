# TASK-SETTINGS-252 原方法探针

当前为252已验证的有界原方法工具；不表示249B或父249已完成。

```powershell
python tools/pet-reception-input-source/verify.py
python tools/pet-reception-input-source/mutations.py
python tools/pet-reception-input-source/verify_effects.py
python tools/pet-reception-input-source/effect_mutations.py
python tools/pet-reception-input-source/check.py --freeze
python tools/pet-reception-input-source/check.py
```

使用已有`D:/AIRsdkmanager/sdk/AIRSDK_51.3.4`编译，使用项目随包AIR运行；不安装软件。原提取目录只读。生成物位于`local-resources/regima/task-outputs/TASK-SETTINGS-252/`；本地报告位于`docs/tasks/evidence/TASK-SETTINGS-252/`。Python LSP当前不可用，直接运行Python及AIR检查。

属性探针编译完整PetInfo、Antiwear、binaryEncrypt和IEncrypt。PetInfo的随机调用替换为受控序列，私有重算方法仅扩大可见性。加密种子的随机不计入成长随机序列。Config提示是空服务；非标量加密比较和无关AUtils计算遇到即抛错。升级用perception=0排除技能学习随机，故随机断言只证明该明确前置下的成长顺序。两个owner标签分别创建实例，不等同现代两Scene接入。

效果探针执行完整兔2/3/4释放、技能门及BaseAddEffect的add、curDebuff、getBuffByName、destroy、isCannotContrlSkill。step只保留原循环、首次时间戳、失效判断、计数；remove保留原数组移除。仅输入疾风，剔除其他效果和辉光分支；显示回调为事件sink，不证明像素或完整兔AI。暂停由外层停止调用step模拟，重入创建新的效果owner；尚不能证明正式Scene生命周期。

独立预期在fixtures.py和verify_effects.py；不读取现代生产结果来生成原预期。源变异必须编译及运行成功，并由同一行为断言拒绝；编译失败不计杀死变异。工具末尾恢复原基线并复验。

已修正的探针错误：AIR应用路径写入需重新构造nativePath File；PetInfo接受`rabbit3`等家族名而非`PetRabbit3`显示类名。新增有效HP前置断言，修正后重跑，旧结果不晋升最终证据。

最新：424项属性用例、162条/35996态疾风时间线、13个源变异通过。原countSkillCD推进受控CD值，用当前效果查询改读CD的真实源变异证明二者不可替代；不声称完整技能调度。属性/效果使用不同AIR application id，避免并发调用转发到另一主实例；首次共用id失败不算验收通过。原截断存档抛1009，完整但非数字字段产生NaN；两者不作为现代恢复政策。

每次真实变异的AS3/SWF/输入/输出/日志保存于本地runs，check.py绑定来源与工具并验证完整输出及变异反例；五种报告损坏被拒。精简reference冻结424属性case与1134效果边界见证，完整观察留本地。重新发布需先运行两组mutations，再运行--freeze；普通check不改参考数据。正式owner/迁移实现交253，两Scene交249B。既有247/248/250/251真值不改。
