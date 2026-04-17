# Tasks
- [x] Task 1: 扩展 `patch` action 的入参定义
  - [x] 在 `src/tools/oapi/task/task.ts` 的 TypeBox schema 中为 `patch` 增加 `agent_task_progress`、`agent_task_status`、`text_deliveries`
  - [x] 在 `FeishuTaskTaskParams` 的 `patch` 分支中增加对应 TypeScript 类型

- [x] Task 2: 扩展 `patch` 请求体构造逻辑
  - [x] 在 `updateData` 构造过程中处理 `agent_task_progress`
  - [x] 在 `updateData` 构造过程中处理 `agent_task_status`
  - [x] 在 `updateData` 构造过程中处理 `text_deliveries`
  - [x] 确认新增字段自动进入 `update_fields`

- [x] Task 3: 做最小验证
  - [x] 检查 `patch` 的 schema、参数类型、请求体构造逻辑三处定义保持一致
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
