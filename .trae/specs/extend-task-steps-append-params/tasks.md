# Tasks
- [x] Task 1: 扩展 `append` action 的入参定义
  - [x] 在 `src/tools/oapi/task/task_steps.ts` 的 TypeBox schema 中为 `append` 增加 `task_guid`、`idempotent_key`、`task_steps`
  - [x] 为 `task_steps` 增加内部对象定义：`quote`、`content`、`timestamp`
  - [x] 在 `FeishuTaskStepsParams` 中增加对应 TypeScript 类型

- [x] Task 2: 扩展 `append` 请求构造逻辑
  - [x] 在 `append` 执行逻辑中将 `task_guid`、`idempotent_key`、`task_steps` 写入请求体或调用参数
  - [x] 确认现有路径解析、tool 名称和授权方式保持不变

- [x] Task 3: 做最小验证
  - [x] 检查 `append` 的 schema、参数类型、执行逻辑三处定义保持一致
  - [x] 检查 `task_steps` 内部对象结构在三处定义中保持一致
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

- [x] Task 4: 对齐 `task_steps` 的非空约束
  - [x] 将 `task_steps` 不能为空的约束同步到 schema，避免声明与运行时行为不一致
  - [x] 重新验证 `append` 的 schema 与执行逻辑一致性

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1]
- [Task 4] depends on [Task 2]
