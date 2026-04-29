# Tasks
- [x] Task 1: 扩展 `update_profile` action 的入参定义
  - [x] 在 `src/tools/oapi/task/task_agent.ts` 的 TypeBox schema 中为 `update_profile` 增加 `profile_content`
  - [x] 在 `FeishuTaskAgentParams` 的 `update_profile` 分支中增加对应 TypeScript 类型

- [x] Task 2: 扩展 `update_profile` 请求构造逻辑
  - [x] 在 `update_profile` 执行逻辑中将 `profile_content` 写入请求体或调用参数
  - [x] 确认 `register`、`unregister`、`list_registered` / `list_register` 的行为不受影响

- [x] Task 3: 做最小验证
  - [x] 检查 `update_profile` 的 schema、参数类型、执行逻辑三处定义保持一致
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
