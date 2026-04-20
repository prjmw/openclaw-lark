# Tasks
- [x] Task 1: 识别并修正 `invoke()` 场景下错误的 env header 注入点
  - [x] 在 `src/tools/oapi/task/task.ts` 中修正所有通过 `client.invoke(...)` 调用 SDK 时的 `x-tt-env` 注入方式
  - [x] 在 `src/tools/oapi/task/tasklist.ts` 中修正所有通过 `client.invoke(...)` 调用 SDK 时的 `x-tt-env` 注入方式
  - [x] 保持 action 逻辑、路径、参数和返回值不变

- [x] Task 2: 保持 `invokeByPath()` 场景不变
  - [x] 确认 `task.ts`、`attachment.ts`、`task_agent.ts` 中的 `invokeByPath(...)` header 用法不做修改

- [x] Task 3: 做最小验证
  - [x] 检查 `task.ts` 与 `tasklist.ts` 中不再把 `x-tt-env` 放进 SDK payload 的 `headers` 字段
  - [x] 检查 `invokeByPath(...)` 场景的 `headers` 保持不变
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
