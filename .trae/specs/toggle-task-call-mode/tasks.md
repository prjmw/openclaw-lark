# Tasks
- [ ] Task 1: 设计并落地调用模式常量
  - [ ] 在 `src/tools/oapi/task/task.ts` 定义一个常量开关（例如 `TASK_CALL_MODE`，取值 `invoke` / `invokeByPath`）
  - [ ] 明确默认值为 `invoke`（保持默认行为不变）

- [ ] Task 2: 将现有 invoke 调用改造成可切换实现
  - [ ] 为 `create/get/list/patch/add_members` 抽取一个内部调用封装（例如 `callTaskApi(...)`），根据常量选择 `client.invoke(...)` 或 `client.invokeByPath(...)`
  - [ ] 在 `invokeByPath` 分支中实现 payload 映射：`params → query`、`data → body`、`path → URL`
  - [ ] 确保 `patch` 仍包含空更新保护（无更新字段时报错）

- [ ] Task 3: 保持 append_steps 不变
  - [ ] 确认 `append_steps` 仍走当前的 `client.invokeByPath(...)` 实现，不被本次开关改动影响

- [ ] Task 4: 最小验证
  - [ ] 代码检查：切换常量后两种分支均可通过 TypeScript 基础检查（无明显语法/类型错误）
  - [ ] 代码检查：两种模式下返回结构保持一致（字段名与层级不变）

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
