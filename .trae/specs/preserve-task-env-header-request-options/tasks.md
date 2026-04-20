# Tasks
- [x] Task 1: 修正 task 工具的 env header helper
  - [x] 在 `src/tools/oapi/task/task.ts` 中调整 `withTaskEnvHeader()`，避免通过对象展开重建 SDK request options
  - [x] 确保 `opts` 存在时只增量合并 `headers`，保留原始 request options 对象及其内部信息
  - [x] 确保 `opts` 为空时仍返回可用于 tenant 调用的最小 request options

- [x] Task 2: 消除 tasklist 中的同类风险
  - [x] 在 `src/tools/oapi/task/tasklist.ts` 中应用相同修正
  - [x] 保持 `tasklist` 现有 action 的路径、参数与返回值不变

- [x] Task 3: 做最小验证
  - [x] 检查 `task.ts` 与 `tasklist.ts` 中不再通过 `{ ...(opts ?? {}) }` 重建 request options
  - [x] 检查 `append_steps` 等 `invokeByPath(...)` 场景保持不变
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
