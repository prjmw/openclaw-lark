# Tasks
- [x] Task 1: 扩展 `list` action 的入参定义与查询参数
  - [x] 在 `src/tools/oapi/task/task.ts` 的 TypeBox schema 中为 `list` 增加 `agent_task_status`
  - [x] 在 `FeishuTaskTaskParams` 的 `list` 分支中增加对应 TypeScript 类型
  - [x] 在 `list` 执行逻辑中将 `agent_task_status` 透传到 SDK 查询参数

- [x] Task 2: 修正 `patch` action 的 agent 字段类型
  - [x] 将 `patch` schema 中 `agent_task_progress` 的类型改为 `string`
  - [x] 将 `patch` schema 中 `agent_task_status` 的类型改为 `int`
  - [x] 将 `FeishuTaskTaskParams` 的 `patch` 分支中两个字段的 TypeScript 类型同步修正
  - [x] 确认 `updateData` 透传逻辑与修正后的类型定义保持一致

- [x] Task 3: 做最小验证
  - [x] 检查 `list` 的 schema、参数类型、SDK 查询参数三处定义保持一致
  - [x] 检查 `patch` 的 schema、参数类型、`updateData` 三处定义保持一致
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
