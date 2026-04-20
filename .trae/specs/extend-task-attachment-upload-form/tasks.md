# Tasks
- [x] Task 1: 扩展 `upload` action 的入参定义
  - [x] 在 `src/tools/oapi/task/attachment.ts` 的 TypeBox schema 中为 `upload` 增加 `resource_type`、`resource_id`、`file`
  - [x] 将 `resource_type` 限定为 `task` / `delivery_task`
  - [x] 在 TS 参数类型中补齐对应字段，并体现 `resource_type` 默认值语义

- [x] Task 2: 扩展上传请求体构造逻辑
  - [x] 在 `upload` 执行逻辑中按 `multipart/form-data` 构造表单请求体
  - [x] 将 `resource_type`、`resource_id`、`file` 透传到表单字段
  - [x] 当调用方未传 `resource_type` 时，使用默认值 `task`

- [x] Task 3: 做最小验证
  - [x] 检查 `upload` 的 schema、参数类型、执行逻辑三处定义保持一致
  - [x] 检查表单字段名与入参字段名保持一致
  - [x] 运行诊断或类型检查，确认未引入明显语法错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
