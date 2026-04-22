# Tasks
- [x] Task 1: 修正 tenant token 获取方式
  - [x] 在 `src/tools/oapi/task/attachment.ts` 中改为使用 tool client 可用的 account credential 获取 tenant_access_token
  - [x] 统一使用标准 `Authorization: Bearer <token>` header（避免大小写/字段名不一致）

- [x] Task 2: 修正 multipart 表单参数传递方式
  - [x] 确保传入 `raw-request.ts` 的 body 能被识别为 FormData（至少包含 `append()` 与 `entries()`）
  - [x] 保持 `resource_type/resource_id/file` 三个字段写入表单，字段名不变
  - [x] 保持 multipart 请求不手动设置 `Content-Type`（交由 fetch 自动带 boundary）

- [x] Task 3: 对齐 task.ts 代码风格与细节
  - [x] 复用 `TASK_ENV_HEADER` 常量风格与 header 注入方式（参考 `src/tools/oapi/task/task.ts`）
  - [x] 保持 `handleInvokeErrorWithAutoAuth`、`json()` 的返回与错误处理风格一致

- [x] Task 4: 最小验证
  - [x] 静态检查：确认 `raw-request.ts` 不会把 FormData 误当 JSON（必要时补充边界处理）
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
