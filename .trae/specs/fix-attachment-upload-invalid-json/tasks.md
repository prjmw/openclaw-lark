# Tasks
- [x] Task 1: 移除错误的手写 multipart Content-Type
  - [x] 在 `src/tools/oapi/task/attachment.ts` 的 `client.invokeByPath` headers 中删除 `'Content-Type': 'multipart/form-data; boundary=---7MA4YWxkTrZu0gW'`
  - [x] 保留 `x-tt-env` 与 `Authorization: Bearer <token>`

- [x] Task 2: 最小验证
  - [x] 运行 TypeScript 类型检查/诊断，确保未引入语法错误
  - [x] 确认 `rawLarkRequest` 对 FormData 分支不会注入 `Content-Type: application/json`（已具备，仅复查）

# Task Dependencies
- [Task 2] depends on [Task 1]
